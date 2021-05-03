import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

it('should return 404 if doesn"t exist', async function () {
    await request(app)
        .put('/api/tickets/incorrectId')
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: 20
        })
        .expect(404);
});

it('should return 401 if not authenticated', async function () {
    await request(app)
        .put('/api/tickets/incorrectId')
        .send({
            title: 'title',
            price: 20
        })
        .expect(401);
});
it('should return 401 if user not owner of the ticket', async function () {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: 20
        })
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: 20
        })
        .expect(401);
});
it('should return 400 if invalid arguments', async function () {
    const userCookie = global.signIn();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", userCookie)
        .send({
            title: 'title',
            price: 20
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
            price: 20
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
            title: 'sssas',
            price: -20
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
            title: 'sssas',
        })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
        })
        .expect(400);
});
it('should return 200 when success', async function () {
    const userCookie = global.signIn();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", userCookie)
        .send({
            title: 'title',
            price: 20
        });
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
            price: 220,
            title: "new title"
        })
        .expect(200);
    const res = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send()
    expect(res.body.title).toEqual('new title');
    expect(res.body.price).toEqual(220);
});
it('should reject update if reserved', async function () {
    const userCookie = global.signIn();
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", userCookie)
        .send({
            title: 'title',
            price: 20
        });
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()})
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set("Cookie", userCookie)
        .send({
            price: 220,
            title: "new title"
        })
        .expect(400);
}); 