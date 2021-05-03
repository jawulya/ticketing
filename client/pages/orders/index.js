const Orders = ({orders}) => {
    console.log(orders)
    return <div>My Orders
    <ul>
        {orders.map(order => (
            <li key={order.id}>{order.ticket.title} - {order.status}</li>
        ))}
    </ul>
    </div>
}
Orders.getInitialProps = async (context, client) => {
    const { data } = await client.get(`/api/orders`);
    return {orders: data}
}
export default Orders;