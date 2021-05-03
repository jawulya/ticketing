import {useEffect, useState} from "react";
import StripeCheckout from "react-stripe-checkout";
import {useRequest} from "../../hooks/use-request";
import {Router} from "next/router";

const OrderShow = ({order, currentUser}) => {
    const [timeLeft, setTimeLeft] = useState(0);
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000) )
        }
        findTimeLeft();
        const id = setInterval(findTimeLeft, 1000);
        return () => {
            clearInterval(id);
        }
    }, [])
    if (timeLeft < 0) {
        return <div>order expired</div>
    }
    const {doRequest, errors } = useRequest({
        url: '/api/payments',
        body: {
            orderId: order.id,
        },
        method: 'post',
        onSuccess: (payment) => {
            Router.push('/orders')
        }
    })
    const onToken = ({id}) => {
        doRequest({token: id})
    }
    return <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout
            token={onToken}
            stripeKey={'pk_test_51IkqfKHEr0dxCxHcPWdbI41uDFXVVBYeK59SsUP6DG1RpJs685eNtgth4cuSad2ljEd26UztpDUCuNdj2O91dx7h00LI8L2r8r'}
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>
}
OrderShow.getInitialProps = async (context, client) => {
    const {orderId} = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return {order: data}
}
export default OrderShow;