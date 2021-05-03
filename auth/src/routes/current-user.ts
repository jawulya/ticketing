import express from "express";
import {currentUser} from "@dfaber/common";

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    console.log("session", req.session?.jwt)
    res.status(200).send({currentUser: req.currentUser || null});
});

export {router as currentUserRouter};