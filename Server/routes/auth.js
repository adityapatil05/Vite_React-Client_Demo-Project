const express = require('express');
const jwt = require('jsonwebtoken');
const config=require('config');

const app = express.Router();
const checkCredentialsWithDatabase=(username,password)=>{
    //comparing username and password against database table -user
    //as of now, we will do hard coded username, password check for time being and testing

    return(username=="test" && password=="test@666");
}
app.post("/",(request,response)=>{
    console.log(request.body)
var isCredentialsValid =checkCredentialsWithDatabase(request.body.username,request.body.password);

if (isCredentialsValid) 
    {
    //create token and return in response
    //1. Get secret key from config file i.e. default.json
    var secretKey= config.get("jwt.secretKey");

    //2. create a payload to be used.
    var payload={
                    username: request.body.username,
                    isUserLoggedIn: true,
                    whenUserLoggedIn: new Date(),
                    browserDetails: request.headers['user-agent'],
                    role:"here_goes_role_received_from_database",
                }

    //3. create a jwt token using sign method of jwt
    var token =jwt.sign(payload,secretKey);

    //4. send a response to end client.
    response.send({"jwt": token});

    }
else
{
    response.send({Message:"Invalid Credentials"});
}

})

module.exports=app;