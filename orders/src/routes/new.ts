import express, {Request, Response} from "express";
import {body} from 'express-validator';
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@dfaber/common';
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";
import {natsService} from "../nats-service";

const router = express.Router();

const EXPIRATION_SECONDS = 15 * 60;

router.post('/api/orders',
    requireAuth,
    [
        body('ticketId')
            .notEmpty()
            .withMessage("TicketId must be provided")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }
    const isReserved = await ticket.isReserved();

    if (isReserved) {
        throw new BadRequestError('Ticket already reserved');
    }
    const expiration = new Date();

    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.CREATED,
        expiresAt: expiration,
        ticket
    });

    await order.save();
    new OrderCreatedPublisher(natsService.client).publish({
        id: order.id,
        status: OrderStatus.CREATED,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        version: order.version,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    })
    res.status(201).send(order)
});

export {router as newOrderRouter};