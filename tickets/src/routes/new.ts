import express, {Request, Response, NextFunction} from "express";
import {body} from 'express-validator';
import {requireAuth, validateRequest} from '@dfaber/common';
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsService} from "../nats-service";

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title')
        .notEmpty()
        .withMessage('Title required'),
    body('price')
        .isFloat({gt: 0})
        .notEmpty()
        .withMessage('Price required')
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    });

    await ticket.save();
    await new TicketCreatedPublisher(natsService.client).publish({id: ticket.id, title: ticket.title, price: ticket.price, userId: ticket.userId, version: ticket.version});
    res.status(201).send(ticket);
});

export {router as createTicketRouter}