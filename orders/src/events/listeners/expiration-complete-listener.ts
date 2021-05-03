import {ExpirationCompleteEvent, Listener, NotFoundError, OrderStatus, Subjects} from "@dfaber/common";
import {QUEUE_GROUP_NAME} from './queue-group-name';
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject = Subjects.EXPIRATION_COMPLETE;
    queueGroupName = QUEUE_GROUP_NAME;
    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket')
        if (!order) {
            throw new NotFoundError();
        }
        if (order.status === OrderStatus.COMPLETED) {
            return msg.ack();
        }
        order.set({
            status: OrderStatus.CANCELLED
        });
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: order.ticket.id,
        });
        msg.ack();
    }
}