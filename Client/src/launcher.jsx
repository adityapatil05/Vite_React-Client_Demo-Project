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

const getProfile = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

function Launcher() 
{
    var navigate=useNavigate();
    const profile = getProfile();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
const Logout=()=>{
    sessionStorage.removeItem("token");
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
                <hr></hr>
                <Link to={"home"}>Home</Link> { " |  "}
                <Link to={"contact"}>Contact</Link> { " |  "}
                <Link to={"about"}>About Us</Link> { " |  "}
                <Link to={"db"}>Dashboard</Link> { " |  "}

                <hr></hr>
                <Routes>
                    <Route path='/' element={<Home/>}/>
                    <Route path='/home' element={<Home/>}/>
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
            </div>);
}

export default Launcher;