import mongoose from 'mongoose';
import {app} from "./app";
import {natsService} from "./nats-service";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";
import {OrderCancelledListener} from "./events/listeners/order-cancelled-listener";


const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('jwt_key not defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI not defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID not defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL not defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID not defined');
    }
    try {

    await natsService.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    natsService.client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });

    process.on('SIGINT', () => natsService.client.close())
    process.on('SIGTERM', () => natsService.client.close())

    new OrderCreatedListener(natsService.client).listen();
    new OrderCancelledListener(natsService.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
        console.log('connected to db')
    } catch (err) {
        console.error(err)
    }
};


app.listen(3000, () => {
    console.log('listening port 3000');
})
start();