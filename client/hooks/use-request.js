import {useState} from "react";
import axios from "axios";

export const useRequest = ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (extraProps = {}) => {
        try {
            setErrors(null);
            const resp = await axios[method](url, {...body, ...extraProps})
            onSuccess && onSuccess(resp.data);
            return resp.data;
        } catch (err) {
            console.log(err)
            setErrors(
                <div className="alert alert-danger">
                    <h4>Oooops...</h4>
                    <ul className="my-0">
                    {err.response.data.errors.map(err => (<li key={err.message}>{err.message}</li>))}
                    </ul>
                </div>
            )
            ;
        }
    }

    return {
        errors, doRequest
    }
}