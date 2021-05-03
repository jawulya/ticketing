import request from "supertest";
import {app} from "../../app";

it('should return current user details', async function () {
    const cookies = await global.signIn();
    const res = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookies)
        .send()
        .expect(200)
    expect(res.body.currentUser.email).toEqual('test@test.com')
}); 