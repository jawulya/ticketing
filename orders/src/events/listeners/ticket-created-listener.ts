import { Message } from 'node-nats-streaming';
import {Listener, Subjects, TicketCreatedEvent} from "@dfaber/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TICKET_CREATED;
    readonly queueGroupName = QUEUE_GROUP_NAME;
    async onMessage({id, title, price}: TicketCreatedEvent["data"], msg: Message) {
        const ticket = Ticket.build({
            id, title, price
        });
        await ticket.save();
        msg.ack();
    }
}