import {useState} from "react";
import Router from 'next/router';
import {useRequest} from "../../hooks/use-request";


const SignIn = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { doRequest, errors}  = useRequest({url: '/api/users/signin', body: {email, password}, method: 'post', onSuccess: () => Router.push('/')})
    const onSubmit = async (e) => {
        e.preventDefault();
        await doRequest();
        setPassword('');
        setEmail('');
    }
    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            <div className="form-group">
                <label>Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="form-control"/>
                <label>Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control"/>
                {errors}
                <button className="btn btn-primary">Sign Up</button>
            </div>
        </form>
    )
}

export default SignIn;