import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsService} from "../../../nats-service";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {Order} from "../../../models/order";
import {ExpirationCompleteEvent, OrderStatus} from "@dfaber/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsService.client);
    const ticket = Ticket.build({
        title: 'ddd',
        price: 200,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const order = Order.build({
        status: OrderStatus.CREATED,
        userId: 'asda',
        expiresAt: new Date(),
        ticket
    });
    await order.save();
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { order, ticket, listener, data, msg }
}

it('should update order to cancelled', async function () {
    const {order, ticket, listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    const updOrder = await Order.findById(order.id);
    expect(updOrder!.status).toEqual(OrderStatus.CANCELLED);
});
it('should emit event', async function () {
    const {order, ticket, listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(natsService.client.publish).toHaveBeenCalled();
});
it('should update order to cancelled', async function () {
    const {order, ticket, listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});