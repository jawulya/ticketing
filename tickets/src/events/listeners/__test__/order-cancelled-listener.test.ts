import {natsService} from "../../../nats-service";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent, OrderStatus} from "@dfaber/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {OrderCancelledListener} from "../order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsService.client);
    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'title',
        price: 90,
        userId: 'fdf'
    });
    ticket.set({ orderId })
    await ticket.save();
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, ticket, data, orderId, msg };
}

it('should update ticket', async function () {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updTicket = await Ticket.findById(ticket.id);
    expect(updTicket!.orderId).toBeUndefined();
});

it('ack message', async function () {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
it('should publish ticket updated event', async function () {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsService.client.publish).toHaveBeenCalled();
}); 