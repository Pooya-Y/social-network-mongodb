const express = require("express");
const mongoose = require("mongoose")
const users = require("./routes/users");
const posts = require("./routes/posts");

const app = express();

const cors = require("cors");
require('dotenv/config');

app.use(cors());
app.options("*", cors);
app.use(express.json());


app.use('/uploads', express.static(__dirname + '/uploads'));

const port = process.env.PORT || 3000;

app.use("/api/users", users);
app.use("/api/posts", posts);


mongoose.connect(process.env.MONGO_SRV, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(()=>{
    console.log("Connected to database ...");
}).catch((err)=>{
    console.log(err);
});
app.listen(port, ()=>{
    console.log("listening to " + port);
});