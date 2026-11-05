const config=require("config");
const mysql=require('mysql2');
const express =require('express');
const app=express.Router();


const connectiondetails=config.get("ConnectionDetails");

const executeQuery=(queryText,request,response)=>{
        var connection= mysql.createConnection(connectiondetails)
        connection.query(queryText,(error,result)=>{
        console.log(result);
        console.log(error);

        if (error==null) {
            response.send(result);
        }
        else{
            response.send(error);
        }
        connection.end();
    })
}

app.get("/",(request,response)=>{
    var queryText=`select * from emp`;
    executeQuery(queryText,request,response);
    // response.send("GET request received for /emps");
})

app.post("/",(request,response)=>{
    console.log(request.body);
    var Name=request.body.Name;
    var Address=request.body.Address;
    var queryText=`insert into emp(Name,Address) values('${Name}','${Address}')`;
    console.log(queryText);
    executeQuery(queryText,request,response);
})

app.put("/:No",(request,response)=>{
    var No=request.params.No;
    var Name=request.body.Name;
    var Address=request.body.Address;
    var queryText=`update emp set Name='${Name}',Address='${Address}' where No =${No}`;
    executeQuery(queryText,request,response);
})

app.delete("/:No",(request,response)=>{
    var No=request.params.No;
    var queryText=`delete from emp where No=${No}`;
    executeQuery(queryText,request,response);
})

module.exports=app;