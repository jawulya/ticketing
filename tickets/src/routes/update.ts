import express, {Request, Response, NextFunction} from "express";
import {body} from 'express-validator';
import {Ticket} from "../models/ticket";
import {requireAuth, validateRequest, NotAuthorizedError, NotFoundError, BadRequestError} from "@dfaber/common";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsService} from "../nats-service";

const router = express.Router();

router.put('/api/tickets/:id', requireAuth,[
    body('title')
        .notEmpty()
        .withMessage('Title required'),
    body('price')
        .isFloat({gt: 0})
        .notEmpty()
        .withMessage('Price required')
], validateRequest, async (req: Request, res: Response) =>{
    let ticket
    try {
        ticket = await Ticket.findById(req.params.id);
    } catch {}

    if (!ticket) {
        throw new NotFoundError();
    }
    if (req.currentUser?.id !== ticket.userId) {
        throw new NotAuthorizedError();
    }
    if (ticket.orderId) {
        throw new BadRequestError('Ticket is reserved');
    }
    ticket.set({
        title: req.body.title,
        price: req.body.price
    });
    await ticket.save();
    await new TicketUpdatedPublisher(natsService.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    })
    res.send(ticket)
});

export {router as updateTicketRouter};