import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from './assets/logoavg-removebg-preview1.png';
import logo2 from './assets/logout2-.png';
import Home from './home';
import AboutUs from './about';
import ContactUs from './contact';
import NotFound from './notfound';
import Dashboard from './dashboard';
import Login from './login';
import Signup from './signup';
import ResetPassword from './reset-password';
import ProtectedRoute from './protectedRoute';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './profile.css';
import './public.css';
import { clearToken, getTokenPayload } from './authStorage';

const getProfile = () => {
    return getTokenPayload();
};

function Launcher() 
{
    var navigate=useNavigate();
    const profile = getProfile();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
const Logout=()=>{
    clearToken();
    setIsProfileOpen(false);
    navigate("/login",{replace:true});
}

    console.log("launcher rendering...")
    return (<div className='container'>
                <div className="app-header">
                <img src={logo} alt="" width="70" className='img-fluid' />
                <div className="profile-area">
                    {profile && <button
                        className="profile-card"
                        onClick={() => setIsProfileOpen(true)}
                        aria-label="Open profile"
                    >
                        <span className="profile-avatar">
                            {profile.username?.charAt(0).toUpperCase()}
                        </span>
                        <span className="profile-details">
                            <strong>{profile.username}</strong>
                        </span>
                    </button>}
                </div>
                </div>
                {profile && isProfileOpen && <>
                    <div className="profile-backdrop" onClick={() => setIsProfileOpen(false)} />
                    <aside className="profile-sidebar" aria-label="Profile sidebar">
                        <button
                            className="profile-close"
                            onClick={() => setIsProfileOpen(false)}
                            aria-label="Close profile"
                        >
                            &times;
                        </button>
                        <div className="profile-sidebar-avatar">
                            {profile.username?.charAt(0).toUpperCase()}
                        </div>
                        <h2>{profile.username}</h2>
                        <p className="profile-sidebar-role">{profile.role || 'user'}</p>
                        <hr />
                        <p><strong>Username:</strong> {profile.username}</p>
                        <p><strong>Role:</strong> {profile.role || 'user'}</p>
                        <button onClick={Logout} className="btn btn-outline-danger profile-logout">
                            <span>Logout</span>
                            <img src={logo2} style={{width:'18px',height:'18px'}} alt="" />
                        </button>
                    </aside>
                </>}
                <nav className="public-nav" aria-label="Main navigation">
                    <Link className="public-nav-brand" to="/home">Avengers</Link>
                    <div className="public-nav-links">
                        <Link to="/home">Home</Link>
                        <Link to="/about">About us</Link>
                        <Link to="/contact">Contact</Link>
                        {profile && <Link to="/db">Dashboard</Link>}
                        {!profile && <Link className="btn btn-outline-info btn-sm nav-login-button" to="/login">Log in</Link>}
                    </div>
                </nav>
                <Routes>
                    <Route path='/' element={<Home isLoggedIn={Boolean(profile)} />}/>
                    <Route path='/home' element={<Home isLoggedIn={Boolean(profile)} />}/>
                    <Route path='/contact' element={<ContactUs/>}/>
                    <Route path='/about' element={<AboutUs/>}/>
                    <Route path='/login' element={<Login/>}/>
                    <Route path='/signup' element={<Signup/>}/>
                    <Route path='/reset-password' element={<ResetPassword/>}/>
                    <Route path='/db' element={ <ProtectedRoute>
                                                  <Dashboard/>
                                                </ProtectedRoute>}/>
                    <Route path='*' element={<NotFound/>}/>
                </Routes>
                <footer className="creator-credit">
                    <span>Made by <strong>Aditya Mhatarmare</strong></span>
                    <a
                        href="https://www.linkedin.com/in/aditya-mhatarmare0101"
                        target="_blank"
                        rel="noreferrer"
                    >
                        LinkedIn
                    </a>
                </footer>
            </div>);
}

export default Launcher;