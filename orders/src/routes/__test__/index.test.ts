import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Ticket} from "../../models/ticket";
import {Order} from "../../models/order";
import {OrderStatus} from "@dfaber/common";

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: "title",
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    return ticket;
}

it('should return error if ticket reserved', async function () {
    const ticket1 = await buildTicket();
    const ticket2 = await buildTicket();
    const ticket3 = await buildTicket();

    const user1 = global.signIn();
    const user2 = global.signIn();
    await request(app)
        .post("/api/orders")
        .set("Cookie", user1)
        .send({
            ticketId: ticket1.id
        })
        .expect(201)

    await request(app)
        .post("/api/orders")
        .set("Cookie", user2)
        .send({
            ticketId: ticket2.id
        })
        .expect(201)

    await request(app)
        .post("/api/orders")
        .set("Cookie", user2)
        .send({
            ticketId: ticket3.id
        })
        .expect(201)

    const resp = await request(app)
        .get("/api/orders")
        .set("Cookie", user2)
        .send()

    expect(resp.body.length).toEqual(2);
});
