import mongoose from "mongoose";
import {natsService} from "../../../nats-service";
import {OrderCancelledEvent, OrderStatus} from "@dfaber/common";
import {Message} from "node-nats-streaming";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsService.client);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.CREATED,
        userId: 'asd',
        version: 0
    });
    await order.save();
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdasd'
        }
    }
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return { listener, data, msg };
}

it('should update ticket', async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const orderUpd = await Order.findById(data.id);
    expect(orderUpd!.status).toEqual(OrderStatus.CANCELLED);
});

it('ack message', async function () {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});
