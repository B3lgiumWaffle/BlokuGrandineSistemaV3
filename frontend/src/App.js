import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AppDialogProvider } from "./components/AppDialogProvider";

import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

import MyListings from "./pages/MyListings";
import AddListing from "./pages/AddListing";
import Listing from "./pages/listings";
import UpdateListing from "./pages/UpdateListing";

// Profile
import MyProfile from "./pages/MyProfile";

import MyInquiries from "./pages/MyInquiries";
import MyInquiryDetails from "./pages/MyInquiryDetails";
import MySentInquiries from "./pages/MySentInquiries";
import MySentInquiriesDetails from "./pages/SentInquiryDetails";

import ContractDetails from "./pages/ContractDetails";
import MyContracts from "./pages/MyContracts";

import AdminRoute from "./components/AdminRoute";
import ListingMonitoring from "./pages/ListingMonitoring";
import ListingMonitoringDetails from "./pages/ListingMonitoringDetails";
import UserProfileMonitoring from "./pages/UserProfileMonitoring";
import UserProfileMonitoringDetails from "./pages/UserProfileMonitoringDetails";
import AdminCategories from "./pages/AdminCategories";
import AdminDisputes from "./pages/AdminDisputes";

import MyCompletedContractsComments from "./pages/MyCompletedContractsComments";
import ContractCommentForm from "./pages/ContractCommentForm";

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
        <AppDialogProvider>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Navbar user={user} onLogout={onLogout} />

                <Box component="main" sx={{ flex: 1 }}>
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

                        <Route path="/my-profile" element={<MyProfile />} />

                        <Route path="/my-inquiries" element={<MyInquiries />} />
                        <Route path="/my-inquiries/:id" element={<MyInquiryDetails />} />

                        <Route path="/my-mysentinquiries" element={<MySentInquiries />} />
                        <Route path="/my-mysentinquiriesdetails/:id" element={<MySentInquiriesDetails />} />

                        <Route path="/my-contracts" element={<MyContracts />} />
                        <Route path="/contracts/:contractId" element={<ContractDetails />} />

                        <Route
                            path="/my-completed-contracts-comments"
                            element={<MyCompletedContractsComments />}
                        />
                        <Route
                            path="/contract-comments/:contractId"
                            element={<ContractCommentForm />}
                        />

                        <Route
                            path="/admin/listings"
                            element={
                                <AdminRoute>
                                    <ListingMonitoring />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/listings/:listingId"
                            element={
                                <AdminRoute>
                                    <ListingMonitoringDetails />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/users"
                            element={
                                <AdminRoute>
                                    <UserProfileMonitoring />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/users/:userId"
                            element={
                                <AdminRoute>
                                    <UserProfileMonitoringDetails />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <AdminRoute>
                                    <AdminCategories />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/disputes"
                            element={
                                <AdminRoute>
                                    <AdminDisputes />
                                </AdminRoute>
                            }
                        />
                    </Routes>
                </Box>

                <Footer />
            </Box>
        </AppDialogProvider>
    );
}
