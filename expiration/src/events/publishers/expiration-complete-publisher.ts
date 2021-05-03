import {ExpirationCompleteEvent, Publisher, Subjects} from "@dfaber/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.EXPIRATION_COMPLETE;
}