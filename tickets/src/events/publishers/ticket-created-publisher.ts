import {Subjects, Publisher, TicketCreatedEvent} from '@dfaber/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TICKET_CREATED;
};