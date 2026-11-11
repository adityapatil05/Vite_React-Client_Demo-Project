import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import API_URL from "./api";
import { saveToken } from "./authStorage";

function Login() {
const [credentials,setCredentials]=useState({username:"",password:""})
const [otp,setOtp] = useState("");
const [otpRequested,setOtpRequested] = useState(false);
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
    axios.post(`${API_URL}/login/request-otp`,credentials)
    .then((result)=>{
        setOtpRequested(true);
        setMessage(result.data.Message);
    })
    .catch((error)=>{
        setMessage(error.response?.data?.Message || "Something went Wrong!");
        console.log(error)
    })
}

const VerifyOtp=()=>{
    axios.post(`${API_URL}/login/verify-otp`, {
        username: credentials.username,
        otp
    })
    .then((result)=>{
        saveToken(result.data.jwt);
        navigate("/db",{replace:true});
    })
    .catch((error)=>{
        setMessage(error.response?.data?.Message || "Something went Wrong!");
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
                    {!otpRequested ? <button
                        className="btn btn-outline-info btn-dark login-button"
                        onClick={SignIn}
                    >
                        Send OTP
                    </button> : <>
                        <label className="otp-label" htmlFor="otp">Email OTP:</label>
                        <input
                            id="otp"
                            className="form-field"
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value)}
                        />
                        <button
                            className="btn btn-outline-info btn-dark login-button"
                            onClick={VerifyOtp}
                        >
                            Verify OTP
                        </button>
                    </>}
                    {message && <div className="alert alert-warning login-alert">{message}</div>}
                    <button className="btn btn-link login-button" onClick={() => navigate("/signup")}>
                        Create an account
                    </button>
                    <button className="btn btn-link login-button" onClick={() => navigate("/reset-password")}>
                        Forgot password?
                    </button>
                </div>
            </div>
             
        </> );
}

export default Login;