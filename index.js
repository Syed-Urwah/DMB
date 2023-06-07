
const app = express();
import express from 'express';
import mongoose from 'mongoose';
import Auth from './routes/auth.js';
import dotenv from 'dotenv'

dotenv.config();


//connecting to mongodb
// const client = new MongoClient('mongodb+srv://syedurwahdev:OHsuoQgH8u2Ivgfs@cluster0.rgz7exd.mongodb.net/')
mongoose.connect(process.env.MONGODB_STRING);

//middle-wares
app.use(express.json());

//routes
app.use('/auth', Auth);


app.get('/', (res,req)=>{
    console.log("hello");
})

app.listen('8000', ()=>{
    console.log('server running')
})