const express=require('express');
const app=express.Router();

app.get("/",(request,response)=>{
    response.send("Get call Received /Admin");
})

app.post("/",(request,response)=>{
    response.send("POST call Received");
})
app.put("/",(request,response)=>{
    response.send("PUT call Received");
})

app.delete("/",(request,response)=>{
    response.send("DELETE call Received");
})

module.exports=app;