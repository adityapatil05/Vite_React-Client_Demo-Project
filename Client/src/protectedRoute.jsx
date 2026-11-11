import { Navigate } from "react-router-dom";
import { getToken } from "./authStorage";

function ProtectedRoute(props) {
    if (getToken() != null)
    //it means user has logged in and received token
    {
     return <>{props.children}</>   
    }
    else{//redirect user to login
        return <Navigate to={"/login"} replace="true"/>
    }
    
}

export default ProtectedRoute;