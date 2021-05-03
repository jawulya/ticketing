import mongoose from "mongoose";
import {OrderCreatedListener} from "../order-created-listener";
import {natsService} from "../../../nats-service";
import {OrderCreatedEvent, OrderStatus} from "@dfaber/common";
import {Message} from "node-nats-streaming";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsService.client);
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.CREATED,
        expiresAt: '123123',
        userId: 'sdsa',
        ticket: {
            id: 'sss',
            price: 500
        }
    }
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg };
}

it('should create a order', async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const order = await Order.findById(data.id);
    expect(order!.id).toEqual(data.id);
});

it('ack message', async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});