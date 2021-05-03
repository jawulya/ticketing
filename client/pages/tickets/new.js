import {useState} from "react";
import {useRequest} from "../../hooks/use-request";
import Router from "next/router";

const NewTicket = () => {
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const { doRequest, errors}  = useRequest({url: '/api/tickets', body: {title, price}, method: 'post', onSuccess: () => Router.push('/')})

    const onSubmit = async (e) => {
        e.preventDefault();
        await doRequest();
        setTitle('');
        setPrice('');
    }
    return (
        <form onSubmit={onSubmit}>
            <h1>Create Ticket</h1>
            <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="form-control"/>
                <label>Price</label>
                <input value={price} onChange={e => setPrice(e.target.value)} className="form-control"/>
                {errors}
            </div>
            <button className="btn btn-primary">Create Ticket</button>
        </form>
    )
}

export default NewTicket;