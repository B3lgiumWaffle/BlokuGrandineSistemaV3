import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import MyListings from "./pages/MyListings";
import AddListing from "./pages/AddListing";
import Listing from "./pages/listings";

import UpdateListing from "./pages/UpdateListing";

//Profile
import MyProfile from "./pages/MyProfile";
//import EditProfile from "./pages/EditProfile";


import MyInquiries from "./pages/MyInquiries";
import MyInquiryDetails from "./pages/MyInquiryDetails";
import MySentInquiries from "./pages/MySentInquiries";
import MySentInquiriesDetails from "./pages/SentInquiryDetails";

import { useEffect, useState } from "react";

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem("user");
        if (saved) setUser(JSON.parse(saved));
    }, []);

    const onLogin = (u) => setUser(u);

    const onLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <>
            <Navbar user={user} onLogout={onLogout} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/work" element={<Work />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login onLogin={onLogin} />} />
                <Route path="/register" element={<Register />} />


                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/my-listings/new" element={<AddListing />} />

                <Route path="/my-listings/edit/:id" element={<UpdateListing />} />
                <Route path="/listing/:id" element={<Listing />} />

                {/* Profile */}
                <Route path="/my-profile" element={<MyProfile />} />


                <Route path="/my-inquiries" element={<MyInquiries />} />
                <Route path="/my-inquiries/:id" element={<MyInquiryDetails />} />

                <Route path="/my-mysentinquiries" element={<MySentInquiries />} />
                <Route path="/my-mysentinquiriesdetails/:id" element={<MySentInquiriesDetails />} />
            </Routes>
        </>
    );
}
