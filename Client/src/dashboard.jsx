import axios from "axios";
import { useEffect, useState } from "react";
import "./dashboard.css";

function Dashboard() {

const [emps, setEmps]=useState([]);
const [emp,setEmp]=useState({No:0,Name:"", Address:"" });
const [message,setMessage]=useState("");
const token = sessionStorage.getItem("token");

var url='http://127.0.0.1:9999/emps';

useEffect(()=>{
    if(message!=""){
        setTimeout(()=>{
            setMessage("")
        },3000)
    }
},[message]);

const getData=()=>{
      axios.get(url,{headers:{Authorization:`bearer ${token}`} })
    .then(result=>{
        console.log(result.data);
        setEmps(result.data);
    })
    .catch(error=>{
        console.log(error);
        setMessage("Somethong went wrong!");
    })
}
useEffect(()=>{
  getData();
},[]);

const Add=()=>{
    console.log("Add Record called");
    console.log(emp);

    axios.post(url,emp,{headers:{Authorization:`bearer ${token}`} })
    .then(result=>{
        console.log(result.data);
        if (result.data.affectedRows>0) {
            setMessage("Record Added Successfully!!");
            setEmp({No:0, Name:"", Address:""})
            getData();
        }else{
            setMessage("No Record Affected...");
           
        }
    })
    .catch(error=>{
        console.log(error);
        setMessage("Somethong went wrong!");
    })

}

const Update=()=>{
    console.log("Update Record called");
    console.log(emp);
    var modifiedUrl=url+"/"+emp.No;
    axios.put(modifiedUrl,emp,{headers:{Authorization:`bearer ${token}`} })
    .then(result=>{
        console.log(result.data);
        if (result.data.affectedRows>0) {
            setMessage("Record Updated Successfully!!");
            setEmp({No:0, Name:"", Address:""})
            getData();
        }else{
            setMessage("No Record Affected...");
           
        }
    })
    .catch(error=>{
        console.log(error);
        setMessage("Somethong went wrong!");
    })
}

const Delete=(No)=>{
   console.log("Delete Record called");
    console.log(emp);
    var modifiedUrl=url+"/"+No;
    axios.delete(modifiedUrl,{headers:{Authorization:`bearer ${token}`} })
    .then(result=>{
        console.log(result.data);
        if (result.data.affectedRows>0) {
            setMessage("Record Deleted Successfully!!");
            getData();
        }else{
            setMessage("No Record Affected...");
           
        }
    })
    .catch(error=>{
        console.log(error);
        setMessage("Somethong went wrong!");
    })
}

const OnTextChange=(args)=>{
    var copyOfEmp={...emp};
    copyOfEmp[args.target.name]=args.target.value;
    setEmp(copyOfEmp);
}


return ( <>
            <h1>Dashboard</h1>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <input type="text" 
                                name="Name"
                                value={emp.Name} 
                                onChange={OnTextChange}
                                className="form-field"/>
                            </td>
                        </tr>
                          <tr>
                            <td>Address:</td>
                            <td>
                                <input type="text" name="Address"
                                value={emp.Address} 
                                onChange={OnTextChange}
                                className="form-field"/>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <button onClick={Add} className="btn btn-sm btn-outline-primary">Add Record</button>
                            </td>
                            <td>
                                <button onClick={Update} className="btn btn-sm btn-outline-success">Update</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr />
            <div className="alert alert-warning">
                {message}
            </div>
            <hr />
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m16.5 16.5 4 4" />
                    </svg>
                    <input type="text" placeholder="Search Here"></input>
                </div>
            <hr />

            <div className="table-responsive">
                <table className="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            emps.map((e)=>{
                                return <tr key={e.No}>
                                    <td>{e.No}</td>
                                    <td>{e.Name}</td>
                                    <td>{e.Address}</td>
                                    <td>
                                        <button variant="outline-dark" className="btn btn-sm btn-outline-dark" onClick={()=>{setEmp(e)}}>Edit</button>
                                        {" "}
                                        <button className="btn btn-sm btn-outline-danger" onClick={()=>{Delete(e.No)}}>  Delete</button>
                                    </td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>

            </> );
}

export default Dashboard;