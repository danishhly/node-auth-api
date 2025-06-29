const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postsRouter');

const app = express();

app.use(express.json());
app.use(cors())
app.use(helmet())
app.use(cookieParser())
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

app.use('/api/auth', authRouter)
app.use('/api/posts', postsRouter)

app.use(express.urlencoded({extended:true}));
app.get('/', (req, res) => {
    res.send({message:"Hello from the server"});
});

app.listen(process.env.PORT,() => {
    console.log("listening....")
});