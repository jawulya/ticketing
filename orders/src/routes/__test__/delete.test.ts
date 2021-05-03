import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsService} from "../../nats-service";
import mongoose from "mongoose";

it('should mark order as cancelled', async function () {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const user = global.signIn();
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id
        })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200)
});
it('should return error when user wants request order of another user', async function () {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const user1 = global.signIn();
    const user2 = global.signIn();
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", user1)
        .send({
            ticketId: ticket.id
        })
        .expect(201)
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user2)
        .send()
        .expect(401)
});
it('emits event order cancelled', async () => {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();
    const user = global.signIn();
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", user)
        .send({
            ticketId: ticket.id
        })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", user)
        .send()
        .expect(200)

    expect(natsService.client.publish).toHaveBeenCalled()
})