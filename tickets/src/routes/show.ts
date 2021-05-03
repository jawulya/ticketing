import express, {Request, Response} from "express";
import {Ticket} from "../models/ticket";
import {NotFoundError} from "@dfaber/common";

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    let ticket;
    try {
        ticket = await Ticket.findById(req.params.id);
    } catch {}

    if (!ticket) {
        throw new NotFoundError();
    }
        res.status(200).send(ticket);
});

export {router as showTicketRouter}