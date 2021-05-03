import request from "supertest";
import {app} from "../../app";

const createTicket = () => {
    return request(app)
        .post("/api/tickets")
        .set("Cookie", global.signIn())
        .send({
            title: 'asdasd',
            price: 20
        })
}
it('should fetch all tickets', async function () {
    await createTicket()
    await createTicket()
    await createTicket()
    const resp = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);
    expect(resp.body.length).toEqual(3);
}); 