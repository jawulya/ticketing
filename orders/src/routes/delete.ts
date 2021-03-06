import express, {Request, Response} from "express";
import {Order} from "../models/order";
import {NotAuthorizedError, NotFoundError, OrderStatus, requireAuth} from "@dfaber/common";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsService} from "../nats-service";

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) =>{
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.CANCELLED;
    await order.save();
    new OrderCancelledPublisher(natsService.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })
    res.status(200).send(order);
});

export {router as deleteOrderRouter};