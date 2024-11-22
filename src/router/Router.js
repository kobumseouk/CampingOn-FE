import {Navigate, Route, Routes} from "react-router-dom";
import Home from "../pages/home/Home";
import NotFound from "../pages/error/NotFound";
import Keyword from "../pages/keyword/Keyword";

function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/keyword" element={<Keyword/>}/>

            <Route path="*" element={<Navigate to="/not-found" replace/>}/>
            <Route path="/not-found" element={<NotFound/>}/>
        </Routes>
    );
}

export default Router;