import {Listener, NotFoundError, OrderStatus, PaymentCreatedEvent, Subjects} from "@dfaber/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PAYMENT_CREATED;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new NotFoundError();
        };

        order.set({
            status: OrderStatus.COMPLETED
        });

        await order.save()

        msg.ack();
    }
}