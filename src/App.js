import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import BlankPage from "./components/BlankPage/BlankPage";
import InsertFoodPage from "./components/InsertFood/InsertFoodPage";
import SearchJobPage from "./components/SearchJob/SearchJobPage";
import SearchFoodPage from "./components/SearchFood/SearchFoodPage";
import SearchRoomPage from "./components/SearchRoom/SearchRoomPage";
import InsertJobPage from "./components/InsertJob/InsertJobPage";
import InsertRoomPage from "./components/InsertRoom/InsertRoomPage";
import FoodDetailsPage from "./components/SearchFood/FoodDetails/FoodDetailsPage";
import Profile from './components/BlankPage/Profile/Profile';
import UpdateFood from './components/BlankPage/Profile/UpdateFood/UpdateFood';
import UpdateRoom from './components/BlankPage/Profile/UpdateRoom/UpdateRoom';
import UpdateJob from './components/BlankPage/Profile/UpdateJob/updatejob';
import AdminPage from './components/AdminPage/AdminPage';
import AdminRooms from './components/AdminPage/Room/Room';
import AdminFoods from './components/AdminPage/Food/Food';
import AdminJobs from './components/AdminPage/Job/Job';
import AdminUsers from './components/AdminPage/Users/User';
import JobCart from "./components/SearchJob/JobCart/JobCart";
import RoomCart from "./components/SearchRoom/RoomCart/RoomCart";
import FoodCart from "./components/SearchFood/FoodCart/FoodCart";
import Help from "./components/BlankPage/Help/Help";
import HelpA from './components/AdminPage/HelpA/HelpA';
const App = () => {
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/register"
    ) {
      document.body.className = "login-register";
  
    } else {
      document.body.className = "";
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/blank" element={<BlankPage />} />
      <Route path="/search-job" element={<SearchJobPage />} />
      <Route path="/search-food" element={<SearchFoodPage />} />
      <Route path="/search-room" element={<SearchRoomPage />} />
      <Route path="/insert-job" element={<InsertJobPage />} />
      <Route path="/insert-food" element={<InsertFoodPage />} />
      <Route path="/insert-room" element={<InsertRoomPage />} />
      <Route path="/food-details" element={<FoodDetailsPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/update-food" element={<UpdateFood />} />
      <Route path="/update-room" element={<UpdateRoom />} />
      <Route path="/update-job" element={<UpdateJob />} /> 
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/rooms" element={<AdminRooms />} />
      <Route path="/admin/foods" element={<AdminFoods />} />  
      <Route path="/admin/jobs" element={<AdminJobs />} /> 
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/jobcart" element={<JobCart />} />
      <Route path="/roomcart" element={<RoomCart />} />
      <Route path="/foodcart" element={<FoodCart />} />
      <Route path="/Help" element={<Help />} />
      <Route path="/admin/help" element={<HelpA />} />
 

    </Routes>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;