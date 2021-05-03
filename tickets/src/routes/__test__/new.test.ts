import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsService} from "../../nats-service";

it('should have a route handler listening a /api/tickets for post', async function () {
    const resp = await request(app)
        .post("/api/tickets")
        .send({})
    expect(resp.status).not.toEqual(404);
});

it('should be accessible only for authorized user', async function () {

    const resp = await request(app)
        .post("/api/tickets")
        .send({})

    expect(resp.status).toEqual(401);
});

it('should return error if invalid title', async function () {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: '',
            price: 10
        })
        .expect(400)

await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            price: 10
        })
        .expect(400)
});

it('should return error if invalid price', async function () {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: -10
        })
        .expect(400)

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'title'
        })
        .expect(400)

});
it('creates a ticket with valid input', async function () {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const req = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: 10
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});

it('should publish an event', async function () {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'title',
            price: 10
        })
        .expect(201);

    expect(natsService.client.publish).toHaveBeenCalled();
});