const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express =require('express');
const config=require("config");
const jwt = require('jsonwebtoken');
const cors=require('cors');
const empsRoutes = require('./routes/emps');
const adminRoutes=require('./routes/admin');
const loginRoutes= require('./routes/auth');
const businessRoutes = require('./routes/business');
const orderRoutes = require('./routes/orders');
const { ensureBusinessSchema } = require('./schema');

const app = express();
app.use(cors());
app.use(express.json());

app.use((request,response,next)=>{
    if (request.url.includes('login')) {
        next();  //if user asks for login ...allow user to login route
    }
    else 
    {
        //if anything else like/emps,/admin is asked -check jwt first
        if (request.headers.authorization != null && 
            request.headers.authorization !=undefined
        ) 
        {
            //check is valid
            //1. split auth header value by space as the auth will have format:
            //"bearer <token>"
            //after split we will get an array like 
            // ["bearer","token"]- we will need  1st value i.e.
            //[0    ,    1]

            var arr=request.headers.authorization.split(' ');
            var tokenReceived = arr[1];

            //now get a secreKey from config .
            var secreKey= config.get("jwt.secretKey");

            //3. Now decrypt the token to find more details about user / payLoad
            var payLoad = jwt.verify(tokenReceived,secreKey);
            request.user = payLoad;

            //4. check if user is logged in from the payload
            if (payLoad.isUserLoggedIn==true) {
                next();
            }
            else{
                response.send({"message": "Invalid Token!"});
            }

        }
        else
        {
            response.send({"message":"plse login and get token first"});
        }   
}})

app.use("/login",loginRoutes);
app.use("/emps",empsRoutes);
app.use("/admin",adminRoutes);
app.use("/business",businessRoutes);
app.use("/orders", orderRoutes);

const AppicationPort = Number(
    process.env.PORT || process.env.APP_PORT || config.get("AppicationPort")
);
ensureBusinessSchema()
    .then(() => {
        app.listen(AppicationPort,()=>{console.log("Server Started...:)")});
    })
    .catch((error) => {
        console.error('Database schema initialization failed:', error.message);
        process.exitCode = 1;
    });