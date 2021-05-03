import mongoose from "mongoose";
import {Order} from "./order";
import {OrderStatus} from "@dfaber/common";
import { updateIfCurrentPlugin} from "mongoose-update-if-current";

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    isReserved(): Promise<boolean>;
    version: number;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByIdAndPrevVersion(data: {id: string, version: number}): Promise<TicketDoc | null>;
};

const ticketScheema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});
ticketScheema.set('versionKey', 'version');
ticketScheema.plugin(updateIfCurrentPlugin);

ticketScheema.statics.build = ({id, title, price}: TicketAttrs) => {
    return new Ticket({
        _id: id,
        title,
        price
    });
};
ticketScheema.statics.findByIdAndPrevVersion = ({id, version}: {id: string; version: number}) => {
    return Ticket.findOne({
        __id: id,
        version: version - 1
    });
}

ticketScheema.methods.isReserved = async function() {
    const order = await Order.findOne({
        ticket: (this as TicketDoc),
        status: {
            $in: [
                OrderStatus.CREATED,
                OrderStatus.AWAITING_PAYMENT,
                OrderStatus.COMPLETED
            ]
        }
    });
    return !!order;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketScheema);

export { Ticket };