import {PaymentCreatedEvent, Publisher, Subjects} from '@dfaber/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PAYMENT_CREATED
}