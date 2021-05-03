import {Publisher, OrderCancelledEvent, Subjects} from "@dfaber/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.ORDER_CANCELLED;
}