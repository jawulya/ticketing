import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@dfaber/common";
import {natsService} from "../../nats-service";

it('should return error in ticket not exist', async function () {
    const ticketId = mongoose.Types.ObjectId();
    return request(app)
        .post("/api/orders")
        .set("Cookie", global.signIn())
        .send({
            ticketId
        })
        .expect(404)
});
it('should return error if ticket reserved', async function () {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const order = Order.build({
        userId: 'ss1da',
        ticket,
        status: OrderStatus.CREATED,
        expiresAt: new Date()
    });
    await order.save();
    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(400)
});
it('should return ticket', async function () {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(201)

});

it('should publish event', async () => {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    await request(app)
        .post("/api/orders")
        .set("Cookie", global.signIn())
        .send({
            ticketId: ticket.id
        })
        .expect(201)
    expect(natsService.client.publish).toHaveBeenCalled();
});