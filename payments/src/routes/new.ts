import express, {Request, Response} from "express";
import {body} from 'express-validator';
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
    requireAuth,
    validateRequest
} from '@dfaber/common';
import {Order} from "../models/order";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsService} from "../nats-service";

const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [
        body('token')
            .notEmpty(),
        body('orderId')
            .notEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestError('Order Cancelled');
    }

    const {id} = await stripe.charges?.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token,
    });

    const payment = Payment.build({orderId, stripeId: id})
    await payment.save();

    await new PaymentCreatedPublisher(natsService.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
    });

    res.status(201).send(payment)
    });

export {router as createChargeRouter};