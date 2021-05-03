import {OrderCreatedEvent, Publisher, Subjects} from "@dfaber/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.ORDER_CREATED;
};

