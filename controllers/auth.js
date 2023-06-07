import { async } from '@firebase/util';
import User from '../Models/User.js';
import { app } from '../firebase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getAuth, createUserWithEmailAndPassword, EmailAuthProvider, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Otp from '../Models/Otp.js';
import moment from 'moment/moment.js';


//firebase
export const emailSignUp = async (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            // Signed in 
            const user = userCredential.user;

            res.status(200).json(user);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            res.status(200).send(errorMessage)
        });

    // res.status(200).json('signup')
}

export const signUp = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.body.email })
        //if email is already registered
        if (user) {
            res.status(300).send("user already exist with this email");
        } else {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,
            });

            await newUser.save();

            res.status(200).json(newUser);
        }


    } catch (error) {
        res.status(500).json(error)
    }


}

export const login = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(200).send("user not found");
    } else {
        //check password
        const isCorrect = bcrypt.compareSync(req.body.password, user.password); // true
        if (!isCorrect) {
            res.status(200).send("password is incorrect")
        } else {
            const data = {
                user
            }

            const token = jwt.sign(data, process.env.SECRET_KEY);
            res.status(200).json({ user, token });
        }


    }
}

export const emailSend = async (req, res) => {

    try {
        const user = await User.findOne({ email: req.body.email });
    if (user) {

        const codeData = Math.floor((Math.random() * 1000) + 23);

        const otp = new Otp({
            email: req.body.email,
            code: codeData,
            expireIn: new Date().getTime()+5*60000
        })

        otp.save();


        const mailer = async (mail, otp) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = await nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: 'syedurwahdev@gmail.com',
                    pass: "ksmthgilonbcklyg"
                },
            });



            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '<syedurwahedu@gmail.com>', // sender address
                to: mail, // list of receivers
                subject: "Reset Pasword OTP", // Subject line
                text: otp, // plain text body
                html: otp, // html body
            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        mailer(req.body.email, codeData.toString());


        res.status(200).send("OTP has been send to your email");
    } else {
        res.status(200).send("email not exist")
    }
    } catch (error) {
        res.status(400).json(error);
    }

    


}

export const changePassword = async (req, res) => {
    const otp = await Otp.findOne({ email: req.body.email, code: req.body.otp });
    if (otp) {
        let currentTime = new Date().getTime();
        if(currentTime < otp.expireIn){
            let diff = otp.expireIn - currentTime;
            let user = await User.findOne({ email: req.body.email });

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            user.password = hash;
            user.save();
            res.status(200).json(user);
        }else{
            res.status(200).send("token expired")
        }
        
        



    } else {
        res.status(200).send("Otp not valid")
    }
}


