import express from 'express';
import 'express-async-errors';
import {json} from "body-parser";
import {currentUserRouter} from "./routes/current-user";
import {signInRouter} from "./routes/signin";
import {signUpRouter} from "./routes/signup";
import {signOutRouter} from "./routes/signout";
import {errorHandler, NotFoundError} from "@dfaber/common";
import cookieSession from "cookie-session";

const app = express();

app.set('trust proxy', true);

app.use(cookieSession({
    signed: false,
    secure: false,
    // secure: process.env.NODE_ENV !== 'test',
}))

app.use(json());

app.use(currentUserRouter);

app.use(signInRouter);
app.use(signUpRouter);
app.use(signOutRouter);


app.all('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export {app};