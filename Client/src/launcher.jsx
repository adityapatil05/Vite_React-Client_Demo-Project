import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import logo from './assets/logoavg-removebg-preview1.png';
import logo2 from './assets/logout2-.png';
import Home from './home';
import AboutUs from './about';
import ContactUs from './contact';
import NotFound from './notfound';
import Dashboard from './dashboard';
import Login from './login';
import ProtectedRoute from './protectedRoute';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
function Launcher() 
{
    var navigate=useNavigate();
const Logout=()=>{
    sessionStorage.removeItem("token");
    navigate("/login",{replace:true});
}

    console.log("launcher rendering...")
    return (<div className='container'>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'20px'}}>
                <img src={logo} alt="" width="70" className='img-fluid' />
                <button onClick={Logout} className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2">
                    <span>  Logout</span> <img src={logo2} style={{width:'18px',height:'18px'}} alt="logo"/> </button>
                </div>
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
                    <Route path='/db' element={ <ProtectedRoute>
                                                  <Dashboard/>
                                                </ProtectedRoute>}/>
                    <Route path='*' element={<NotFound/>}/>
                </Routes>
            </div>);
}

export default Launcher;