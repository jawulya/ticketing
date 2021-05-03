import request from "supertest";
import {app} from "../../app";

it('should returns 404 if ticket is not found',async function () {
    await request(app)
        .get('/api/tickets/jskdjfl2ass')
        .send()
        .expect(404)
});

it('should return a ticket id found', async function () {
    const title = 'title';
    const price = 20;
    const { body: {id} } = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title,
            price
        })
        .expect(201);

    const ticketResp = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(200)
    expect(ticketResp.body.title).toEqual(title);
    expect(ticketResp.body.price).toEqual(price);
});