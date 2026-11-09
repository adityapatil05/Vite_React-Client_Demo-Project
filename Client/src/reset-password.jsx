import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import API_URL from "./api";

function ResetPassword() {
    const [details, setDetails] = useState({
        username: "",
        email: "",
        newPassword: "",
        passwordConfirmation: ""
    });
    const [otp, setOtp] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const onChange = (event) => {
        setDetails({ ...details, [event.target.name]: event.target.value });
    };

    const requestOtp = () => {
        axios.post(`${API_URL}/login/password-reset/request-otp`, {
            username: details.username,
            email: details.email
        }).then((result) => {
            setOtpRequested(true);
            setMessage(result.data.Message);
        }).catch((error) => {
            setMessage(error.response?.data?.Message || "Could not start password reset.");
        });
    };

    const resetPassword = () => {
        axios.post(`${API_URL}/login/password-reset/verify-otp`, {
            username: details.username,
            otp,
            newPassword: details.newPassword,
            passwordConfirmation: details.passwordConfirmation
        }).then((result) => {
            setMessage(result.data.Message);
            setTimeout(() => navigate("/login", { replace: true }), 1200);
        }).catch((error) => {
            setMessage(error.response?.data?.Message || "Could not reset password.");
        });
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Reset password</h2>
                {!otpRequested ? <>
                    <label className="otp-label" htmlFor="reset-username">Username</label>
                    <input id="reset-username" className="form-field" name="username"
                        autoComplete="username"
                        value={details.username} onChange={onChange} />
                    <label className="otp-label" htmlFor="reset-email">Registered email</label>
                    <input id="reset-email" className="form-field" type="email" name="email"
                        autoComplete="email"
                        value={details.email} onChange={onChange} />
                    <button className="btn btn-outline-info btn-dark login-button" onClick={requestOtp}>
                        Send reset OTP
                    </button>
                </> : <>
                    <p>Enter the OTP sent to your registered email.</p>
                    <input id="reset-otp" className="form-field" type="text" inputMode="numeric"
                        name="otp" autoComplete="one-time-code" maxLength="6"
                        value={otp} onChange={(event) => setOtp(event.target.value)} />
                    <label className="otp-label" htmlFor="new-password">New password</label>
                    <input id="new-password" className="form-field" type="password"
                        name="newPassword" autoComplete="new-password"
                        value={details.newPassword} onChange={onChange} />
                    <label className="otp-label" htmlFor="password-confirmation">Confirm password</label>
                    <input id="password-confirmation" className="form-field" type="password"
                        name="passwordConfirmation" autoComplete="new-password"
                        value={details.passwordConfirmation} onChange={onChange} />
                    <button className="btn btn-outline-info btn-dark login-button" onClick={resetPassword}>
                        Reset password
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

export default ResetPassword;
