import {Listener, NotFoundError, OrderCreatedEvent, Subjects} from '@dfaber/common'
import {Message} from "node-nats-streaming";
import { queueGroupName } from './queue-group-name';
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.ORDER_CREATED;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new NotFoundError();
        }
        ticket.set({orderId: data.id});
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