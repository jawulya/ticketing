import {natsService} from "./nats-service";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";

const start = async () => {

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
    
    } catch (err) {
        console.error(err)
    }
};

start();