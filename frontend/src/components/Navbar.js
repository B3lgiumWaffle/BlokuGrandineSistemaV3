import {
    AppBar,
    Toolbar,
    Button,
    Typography,
    Box,
    Paper,
    Menu,
    MenuItem,
    Divider,
    Badge,
    IconButton,
    ListItemText
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const API_URL = "https://localhost:7278";

export default function Navbar({ user, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const notifOpen = Boolean(notifAnchorEl);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const displayName = useMemo(() => {
        return user?.username ?? "User";
    }, [user]);

    function getUserRoleFromToken() {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            return (
                payload.role ||
                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                null
            );
        } catch {
            return null;
        }
    }

    const userRole = getUserRoleFromToken();
    const token = localStorage.getItem("token");

    const openMenu = (e) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const openNotifMenu = async (e) => {
        setNotifAnchorEl(e.currentTarget);
        await loadNotifications();
    };

    const closeNotifMenu = () => setNotifAnchorEl(null);

    const go = (path) => {
        closeMenu();
        navigate(path);
    };

    const handleLogout = () => {
        closeMenu();
        onLogout();
        navigate("/");
    };

    const loadNotifications = async () => {
        if (!token) return;

        try {
            const [listRes, countRes] = await Promise.all([
                fetch(`${API_URL}/api/notifications`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                fetch(`${API_URL}/api/notifications/unread-count`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            ]);

            if (listRes.ok) {
                const listData = await listRes.json();
                setNotifications(Array.isArray(listData) ? listData : []);
            }

            if (countRes.ok) {
                const countData = await countRes.json();
                setUnreadCount(countData?.count ?? 0);
            }
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    };

    const markAsReadAndGo = async (n) => {
        try {
            if (token && !n.isRead) {
                await fetch(`${API_URL}/api/notifications/${n.notificationId}/read`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            closeNotifMenu();
            await loadNotifications();

            if (n.type === "ListingRejected") {
                navigate(`/my-listings/edit/${n.referenceId}`);
                return;
            }

            if (n.type === "ListingApproved") {
                navigate(`/my-listings`);
                return;
            }

            if (n.type === "contract_message") {
                navigate(`/contracts/${n.referenceId}`);
                return;
            }

            navigate("/my-profile");
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        try {
            if (!token) return;

            const res = await fetch(`${API_URL}/api/notifications/read-all`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                await loadNotifications();
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (user) {
            loadNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ mr: 2 }}>
                    Blokų Grandinių Sistema
                </Typography>

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        color="inherit"
                        component={Link}
                        to="/"
                        variant={currentPath === "/" ? "outlined" : "text"}
                    >
                        Home
                    </Button>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/work"
                        variant={currentPath === "/work" ? "outlined" : "text"}
                    >
                        Work
                    </Button>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/my-contracts"
                        variant={currentPath === "/my-contracts" ? "outlined" : "text"}
                    >
                        My Contracts
                    </Button>

                    {(userRole === "Admin" || userRole === "Seller") && (
                        <Button
                            color="inherit"
                            component={Link}
                            to="/my-inquiries"
                            variant={currentPath === "/my-inquiries" ? "outlined" : "text"}
                        >
                            My Inquiries
                        </Button>
                    )}

                    <Button
                        color="inherit"
                        component={Link}
                        to="/my-mysentinquiries"
                        variant={currentPath === "/my-mysentinquiries" ? "outlined" : "text"}
                    >
                        My Sent Inquiries
                    </Button>

                    <Button
                        color="inherit"
                        component={Link}
                        to="/about"
                        variant={currentPath === "/about" ? "outlined" : "text"}
                    >
                        About
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {!user ? (
                    <Button
                        color="inherit"
                        component={Link}
                        to="/login"
                        variant={currentPath === "/login" ? "outlined" : "text"}
                    >
                        Login
                    </Button>
                ) : (
                    <>
                        <IconButton color="inherit" onClick={openNotifMenu}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <Paper
                            onClick={openMenu}
                            role="button"
                            tabIndex={0}
                            elevation={0}
                            sx={{
                                cursor: "pointer",
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.12)",
                                color: "inherit",
                                userSelect: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 1
                            }}
                        >
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Welcome,
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {displayName}
                            </Typography>
                        </Paper>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={closeMenu}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem onClick={() => go("/my-profile")}>My Profile</MenuItem>

                            {(userRole === "Admin" || userRole === "Seller") && (
                                <MenuItem onClick={() => go("/my-listings")}>My Listings</MenuItem>
                            )}

                            {userRole === "Admin" && <Divider />}

                            {userRole === "Admin" && (
                                <MenuItem onClick={() => go("/admin/listings")}>
                                    Listing Monitoring
                                </MenuItem>
                            )}

                            {userRole === "Admin" && (
                                <MenuItem onClick={() => go("/admin/users")}>
                                    User Profile Monitoring
                                </MenuItem>
                            )}

                            <Divider />
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>

                        <Menu
                            anchorEl={notifAnchorEl}
                            open={notifOpen}
                            onClose={closeNotifMenu}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem disabled>
                                <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
                            </MenuItem>

                            <MenuItem onClick={markAllAsRead}>Mark all as read</MenuItem>

                            <Divider />

                            {notifications.length === 0 ? (
                                <MenuItem disabled>No notifications</MenuItem>
                            ) : (
                                notifications.slice(0, 8).map((n) => (
                                    <MenuItem key={n.notificationId} onClick={() => markAsReadAndGo(n)}>
                                        <ListItemText
                                            primary={n.title}
                                            secondary={n.message || ""}
                                            primaryTypographyProps={{
                                                fontWeight: n.isRead ? 400 : 700
                                            }}
                                        />
                                    </MenuItem>
                                ))
                            )}
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}


//import { AppBar, Toolbar, Button, Typography, Box, Paper, Menu, MenuItem, Divider } from "@mui/material";
//import { Link, useLocation, useNavigate } from "react-router-dom";
//import { useMemo, useState } from "react";

//export default function Navbar({ user, onLogout }) {
//    const location = useLocation();
//    const navigate = useNavigate();
//    const currentPath = location.pathname;

//    const [anchorEl, setAnchorEl] = useState(null);
//    const menuOpen = Boolean(anchorEl);

//    const displayName = useMemo(() => {
//        // jei user turi username, rodau jį jei neturi – rodom "User"
//        return user?.username ?? "User";
//    }, [user]);

//    function getUserRoleFromToken() {
//        const token = localStorage.getItem("token");
//        if (!token) return null;

//        try {
//            const payload = JSON.parse(atob(token.split(".")[1]));

//            return (
//                payload.role ||
//                payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
//                null
//            );
//        } catch {
//            return null;
//        }
//    }

//    const openMenu = (e) => setAnchorEl(e.currentTarget);
//    const closeMenu = () => setAnchorEl(null);

//    const go = (path) => {
//        closeMenu();
//        navigate(path);
//    };

//    const handleLogout = () => {
//        closeMenu();
//        onLogout();
//        navigate("/");
//    };



//    const userRole = getUserRoleFromToken();

//    console.log("ROLE:", userRole);

//    return (
//        <AppBar position="static">
//            <Toolbar>
//                <Typography variant="h6" sx={{ mr: 2 }}>
//                    Blokų Grandinių Sistema
//                </Typography>

//                {/* Left menu */}
//                <Box sx={{ display: "flex", gap: 1 }}>
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/"
//                        variant={currentPath === "/" ? "outlined" : "text"}
//                    >
//                        Home
//                    </Button>
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/work"
//                        variant={currentPath === "/work" ? "outlined" : "text"}
//                    >
//                        Work
//                    </Button>
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/my-contracts"
//                        variant={currentPath === "/my-contracts" ? "outlined" : "text"}
//                    >
//                        My Contracts
//                    </Button>

//                    {(userRole === "Admin" || userRole === "Seller")  && (
//                        <Button
//                            color="inherit"
//                            component={Link}
//                            to="/my-inquiries"
//                            variant={currentPath === "/my-inquiries" ? "outlined" : "text"}
//                        >
//                            My Inquiries
//                        </Button>
//                    )}
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/my-mysentinquiries"
//                        variant={currentPath === "/my-mysentinquiries" ? "outlined" : "text"}
//                    >
//                        My Sent Inquiries
//                    </Button>
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/about"
//                        variant={currentPath === "/about" ? "outlined" : "text"}
//                    >
//                        About
//                    </Button>
//                </Box>

//                <Box sx={{ flexGrow: 1 }} />

//                {!user ? (
//                    <Button
//                        color="inherit"
//                        component={Link}
//                        to="/login"
//                        variant={currentPath === "/login" ? "outlined" : "text"}
//                    >
//                        Login
//                    </Button>
//                ) : (
//                    <>
//                        {/* Welcome box (clickable) */}
//                        <Paper
//                            onClick={openMenu}
//                            role="button"
//                            tabIndex={0}
//                            elevation={0}
//                            sx={{
//                                cursor: "pointer",
//                                px: 1.5,
//                                py: 0.75,
//                                borderRadius: 2,
//                                bgcolor: "rgba(255,255,255,0.12)",
//                                color: "inherit",
//                                userSelect: "none",
//                                display: "flex",
//                                alignItems: "center",
//                                gap: 1
//                            }}
//                        >
//                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                                Welcome,
//                            </Typography>
//                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
//                                {displayName}
//                            </Typography>
//                        </Paper>

//                        <Menu
//                            anchorEl={anchorEl}
//                            open={menuOpen}
//                            onClose={closeMenu}
//                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//                            transformOrigin={{ vertical: "top", horizontal: "right" }}
//                            >
//                                <MenuItem onClick={() => go("/my-profile")}>My Profile</MenuItem>
//                                {(userRole === "Admin" || userRole === "Seller") && (
//                                    <MenuItem onClick={() => go("/my-listings")}>My Listings</MenuItem>
//                                )}
//                                {userRole === "Admin" && <Divider />}

//                                {userRole === "Admin" && (
//                                    <MenuItem onClick={() => go("/admin/listings")}>
//                                        Listing Monitoring
//                                    </MenuItem>
//                                )}

//                                {userRole === "Admin" && (
//                                    <MenuItem onClick={() => go("/admin/users")}>
//                                        User Profile Monitoring
//                                    </MenuItem>
//                                )}
//                            <Divider />
//                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
//                        </Menu>
//                    </>
//                )}
//            </Toolbar>
//        </AppBar>
//    );
//}
