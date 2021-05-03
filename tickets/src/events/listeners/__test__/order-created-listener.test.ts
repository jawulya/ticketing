import {OrderCreatedListener} from "../order-created-listener";
import {natsService} from "../../../nats-service";
import {Ticket} from "../../../models/ticket";
import {OrderCreatedEvent, OrderStatus} from "@dfaber/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCreatedListener(natsService.client);
    const ticket = Ticket.build({
        title: 'title',
        price: 90,
        userId: 'fdf'
    });
    await ticket.save();
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.CREATED,
        expiresAt: '123123',
        userId: 'sdsa',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, ticket, data, msg };
}

it('should set userId to ticket', async function () {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updTicket = await Ticket.findById(ticket.id);
    expect(updTicket!.orderId).toEqual(data.id);
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