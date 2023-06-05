// const express = require('express');
import express from 'express';
import {changePassword, emailSend, emailSignUp, login, signUp} from '../controllers/auth.js';
import verifyToken from '../middle-ware/verifyToken.js';
const router = express.Router();


router.post('/firebase-signUp',  emailSignUp);

// router.post('/reset', resetPassword);

router.post('/signup', signUp);

router.post('/login', login);

router.get('/emailSend', emailSend);

router.put('/changePassword', changePassword);



export default  router;