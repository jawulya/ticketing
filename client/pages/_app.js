import 'bootstrap/dist/css/bootstrap.css';
import {buildClient} from "../api/build-client";
import Header from "../components/header";

 const Wrapper = ({Component, pageProps, currentUser}) => {
    return <>
        <Header currentUser={currentUser}/>
        <div className='container'>
            <Component {...pageProps} currentUser={currentUser} />
        </div>
        </>
}
Wrapper.getInitialProps = async (context) => {
     const client = buildClient(context.ctx);
        const {data} = await client.get('/api/users/currentuser');
     const pageProps = await context.Component?.getInitialProps?.(context.ctx, client, data.currentUser) || {};

    return {pageProps, currentUser: data.currentUser};
}
export default Wrapper;