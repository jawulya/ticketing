import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {OrderStatus} from "@dfaber/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";
jest.mock('../../stripe');

it('should return 404 error when order not exist', async function () {
    return request(app)
        .post("/api/payments")
        .set("Cookie", global.signIn())
        .send({
            token: 'asdasd',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
});
it('should return 401 error order belongs for another user', async function () {
    const order = Order.build({
        userId: mongoose.Types.ObjectId().toHexString(),
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.CREATED,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signIn())
        .send({
            token: 'asdasd',
            orderId: order.id,
        })
        .expect(401)
});

it('should return 400 when order cancelled', async function () {
    const userId = mongoose.Types.ObjectId().toHexString();
const user = global.signIn(userId);

    const order = Order.build({
        userId: userId,
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.CANCELLED,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", user)
        .send({
            token: 'asdasd',
            orderId: order.id,
        })
        .expect(400)
});
it('should return 200', async function () {
    const userId = mongoose.Types.ObjectId().toHexString();
    const user = global.signIn(userId);

    const order = Order.build({
        userId,
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.CREATED,
    });

    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", user)
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201)
    expect(stripe.charges.create).toHaveBeenCalledWith({
        currency: 'usd',
        amount: order.price * 100,
        source: 'tok_visa',
    })

    const payment = await Payment.findOne({
        orderId: order.id
    })
    expect(payment?.stripeId).toEqual('testId')
});