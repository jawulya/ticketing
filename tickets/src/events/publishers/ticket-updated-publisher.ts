import {Subjects, Publisher, TicketUpdatedEvent} from '@dfaber/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TICKET_UPDATED;
};