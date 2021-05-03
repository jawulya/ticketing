import { Message } from 'node-nats-streaming';
import {Listener, Subjects, TicketUpdatedEvent} from "@dfaber/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TICKET_UPDATED;
    readonly queueGroupName = QUEUE_GROUP_NAME;
    async onMessage({id, title, price, version}: TicketUpdatedEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(id)

        if (!ticket) {
            throw new Error('not found')
        };

        ticket.set({
            title, price
        });

        await ticket.save();
        msg.ack();
    }
}