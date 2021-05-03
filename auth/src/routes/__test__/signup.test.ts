import request from 'supertest';
import {app} from "../../app";

it('should return 201 on success', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)
})
it('should return 400 with invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test.com',
            password: 'password'
        })
        .expect(400)
})
it('should return 400 with invalid password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'pas'
        })
        .expect(400)
    return request(app)
        .post('/api/users/signup')
        .send({
        })
        .expect(400)
})
it('should prevent submitting duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201)

    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(400)
})
it('should sets a cookie after signup', async function () {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test2.com',
            password: 'password'
        })
        .expect(201)
    expect(response.get('Set-Cookie')).toBeDefined();
});