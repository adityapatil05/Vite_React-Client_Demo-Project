import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import API_URL from "./api";

function Signup() {
    const [details, setDetails] = useState({
        username: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        accountType: ""
    });
    const [otp, setOtp] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const onChange = (event) => {
        setDetails({ ...details, [event.target.name]: event.target.value });
    };

    const requestOtp = () => {
        axios.post(`${API_URL}/login/signup/request-otp`, details)
            .then((result) => {
                setOtpRequested(true);
                setMessage(result.data.Message);
            })
            .catch((error) => {
                setMessage(error.response?.data?.Message || "Could not start signup.");
            });
    };

    const verifyOtp = () => {
        axios.post(`${API_URL}/login/signup/verify-otp`, {
            username: details.username,
            otp
        })
            .then((result) => {
                setMessage(result.data.Message);
                setTimeout(() => navigate("/login", { replace: true }), 1200);
            })
            .catch((error) => {
                setMessage(error.response?.data?.Message || "Could not verify OTP.");
            });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Sign up</h2>
                {!otpRequested ? <>
                    <label className="otp-label" htmlFor="signup-username">Username</label>
                    <input id="signup-username" className="form-field" name="username"
                        value={details.username} onChange={onChange} />
                    <label className="otp-label" htmlFor="signup-email">Email</label>
                    <input id="signup-email" className="form-field" type="email" name="email"
                        value={details.email} onChange={onChange} />
                    <label className="otp-label" htmlFor="signup-password">Password</label>
                    <input id="signup-password" className="form-field" type="password" name="password"
                        value={details.password} onChange={onChange} />
                    <label className="otp-label" htmlFor="signup-confirmation">Confirm password</label>
                    <input id="signup-confirmation" className="form-field" type="password"
                        name="passwordConfirmation" value={details.passwordConfirmation} onChange={onChange} />
                    <label className="otp-label" htmlFor="signup-account-type">Account type</label>
                    <select id="signup-account-type" className="form-field" name="accountType"
                        value={details.accountType || ""} onChange={onChange}>
                        <option value="">Choose account type</option>
                        <option value="retailer">Retailer</option>
                        <option value="customer">Customer</option>
                    </select>
                    <button className="btn btn-outline-info btn-dark login-button" onClick={requestOtp}>
                        Send verification OTP
                    </button>
                </> : <>
                    <p>Enter the OTP sent to your email.</p>
                    <input className="form-field" type="text" inputMode="numeric" maxLength="6"
                        value={otp} onChange={(event) => setOtp(event.target.value)} />
                    <button className="btn btn-outline-info btn-dark login-button" onClick={verifyOtp}>
                        Verify email and create account
                    </button>
                </>}
                <button className="btn btn-link login-button" onClick={() => navigate("/login")}>
                    Back to login
                </button>
                {message && <div className="alert alert-warning login-alert">{message}</div>}
            </div>
        </div>
    );
}

export default Signup;
