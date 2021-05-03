import {Listener, NotFoundError, OrderCancelledEvent, Subjects} from "@dfaber/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.ORDER_CANCELLED;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket);
        if (!ticket) {
            throw new NotFoundError();
        }
        ticket.set({orderId: undefined});

        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            price: ticket.price,
            title: ticket.title,
            id: ticket.id,
            orderId: ticket.orderId,
            version: ticket.version,
            userId: ticket.userId
        })
        msg.ack();
    }
}