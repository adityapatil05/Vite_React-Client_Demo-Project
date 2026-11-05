import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
const [credentials,setCredentials]=useState({username:"",password:""})
const [message,setMessage] =useState("");

const navigate =useNavigate();


useEffect(()=>{
    if (message!="") {
        setTimeout(()=>{
            setMessage("");  //cleans the msg on screen after 3 sec.
        },3000);
    }
},[message])

const OnTextChange=(args)=>{
    var copyOfCredentials ={...credentials};
    copyOfCredentials[args.target.name]=args.target.value;
    setCredentials(copyOfCredentials);
}

const SignIn=()=>{
    // console.log(credentials);
    axios.post(`http://127.0.0.1:9999/login`,credentials)
    .then((result)=>{
        if(result.data.jwt!=undefined && 
            result.data.jwt!=null
        )
        {
            //succes
            console.log(result.data.jwt);
            sessionStorage.setItem("token",result.data.jwt)
            navigate("/db",{replace:true});
            
        }
        else{
            //fail
            console.log(result.data.Message);
            setMessage(result.data.Message);
        }
    })
    .catch((error)=>{
        setMessage("Something went Wrong!");
        console.log(error)
    })
}

return ( <>
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Sign in</h2>
                    <table className="table table-borderless login-table">
                    <tbody>
                    <tr>
                        <td className="text-center">UserName :</td>
                        <td>
                            <input 
                            className="form-field"
                            type="text"
                            name="username"        
                                   value={credentials.username}
                                   onChange={OnTextChange} />
                        </td>
                    </tr>
                    <tr>
                        <td className="text-center">Password :</td>
                        <td>
                            <input type="password" 
                            className="form-field" 
                            name="password"
                            value={credentials.password}
                            onChange={OnTextChange} />
                        </td>
                    </tr>
                    </tbody>
                    </table>
                    <button
                        className="btn btn-outline-info btn-dark login-button"
                        onClick={SignIn}
                    >
                        Sign In
                    </button>
                    {message && <div className="alert alert-warning login-alert">{message}</div>}
                </div>
            </div>
             
        </> );
}

export default Login;