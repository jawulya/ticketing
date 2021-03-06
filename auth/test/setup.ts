import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from "mongoose";
import request from 'supertest';
import {app} from "../src/app";

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'asdf';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});
afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
})
declare global {
    namespace NodeJS {
        interface Global {
            signIn: () => Promise<string[]>
        }
    }
}
global.signIn = async () => {
    const email = 'test@test.com';
    const password = 'password';
    const res = await request(app)
        .post('/api/users/signup')
        .send({email, password})
        .expect(201)

    return res.get('Set-Cookie');
};