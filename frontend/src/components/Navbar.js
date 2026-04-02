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

    const navButtonSx = {
        color: "#f9fafb",
        px: 1.5,
        py: 0.8,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 500,
        minWidth: "auto",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
        },
    };

    const activeNavButtonSx = {
        ...navButtonSx,
        backgroundColor: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.16)",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.16)",
        },
    };

    const menuPaperSx = {
        mt: 1,
        borderRadius: 2.5,
        minWidth: 220,
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        "& .MuiMenuItem-root": {
            fontSize: 14,
            borderRadius: 1.5,
            mx: 0.5,
            my: 0.25,
        },
        "& .MuiMenuItem-root:hover": {
            backgroundColor: "rgba(255,255,255,0.08)",
        },
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "#111827",
                color: "#f9fafb",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <Toolbar sx={{ minHeight: 72, gap: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        mr: 1,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        color: "#f9fafb",
                    }}
                >
                    Blockchain Service Platform
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        gap: 0.75,
                        flexWrap: "wrap",
                        alignItems: "center",
                    }}
                >
                    <Button
                        component={Link}
                        to="/"
                        variant="text"
                        sx={currentPath === "/" ? activeNavButtonSx : navButtonSx}
                    >
                        Home
                    </Button>

                    <Button
                        component={Link}
                        to="/work"
                        variant="text"
                        sx={currentPath === "/work" ? activeNavButtonSx : navButtonSx}
                    >
                        Work
                    </Button>

                    <Button
                        component={Link}
                        to="/my-contracts"
                        variant="text"
                        sx={currentPath === "/my-contracts" ? activeNavButtonSx : navButtonSx}
                    >
                        My Contracts
                    </Button>

                    {(userRole === "Admin" || userRole === "Seller") && (
                        <Button
                            component={Link}
                            to="/my-inquiries"
                            variant="text"
                            sx={currentPath === "/my-inquiries" ? activeNavButtonSx : navButtonSx}
                        >
                            My Inquiries
                        </Button>
                    )}

                    <Button
                        component={Link}
                        to="/my-mysentinquiries"
                        variant="text"
                        sx={currentPath === "/my-mysentinquiries" ? activeNavButtonSx : navButtonSx}
                    >
                        My Sent Inquiries
                    </Button>

                    <Button
                        component={Link}
                        to="/my-completed-contracts-comments"
                        variant="text"
                        sx={currentPath === "/my-completed-contracts-comments" ? activeNavButtonSx : navButtonSx}
                    >
                        My Comments
                    </Button>

                    <Button
                        component={Link}
                        to="/about"
                        variant="text"
                        sx={currentPath === "/about" ? activeNavButtonSx : navButtonSx}
                    >
                        About
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {!user ? (
                    <Button
                        component={Link}
                        to="/login"
                        variant="text"
                        sx={currentPath === "/login" ? activeNavButtonSx : navButtonSx}
                    >
                        Login
                    </Button>
                ) : (
                    <>
                        <IconButton
                            onClick={openNotifMenu}
                            sx={{
                                color: "#f9fafb",
                                borderRadius: 2,
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                },
                            }}
                        >
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
                                py: 0.9,
                                borderRadius: 2,
                                bgcolor: "rgba(255,255,255,0.10)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                color: "#f9fafb",
                                userSelect: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                transition: "0.15s",
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.14)",
                                },
                            }}
                        >
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Welcome,
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {displayName}
                            </Typography>
                        </Paper>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={closeMenu}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{ sx: menuPaperSx }}
                        >
                            <MenuItem onClick={() => go("/my-profile")}>My Profile</MenuItem>

                            {(userRole === "Admin" || userRole === "Seller") && (
                                <MenuItem onClick={() => go("/my-listings")}>My Listings</MenuItem>
                            )}

                            {userRole === "Admin" && <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />}

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

                            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>

                        <Menu
                            anchorEl={notifAnchorEl}
                            open={notifOpen}
                            onClose={closeNotifMenu}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{
                                sx: {
                                    ...menuPaperSx,
                                    minWidth: 320,
                                    maxWidth: 380,
                                }
                            }}
                        >
                            <MenuItem disabled sx={{ opacity: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: "#f9fafb" }}>
                                    Notifications
                                </Typography>
                            </MenuItem>

                            <MenuItem onClick={markAllAsRead}>Mark all as read</MenuItem>

                            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

                            {notifications.length === 0 ? (
                                <MenuItem disabled>No notifications</MenuItem>
                            ) : (
                                notifications.slice(0, 8).map((n) => (
                                    <MenuItem
                                        key={n.notificationId}
                                        onClick={() => markAsReadAndGo(n)}
                                        sx={{
                                            alignItems: "flex-start",
                                            py: 1.2,
                                        }}
                                    >
                                        <ListItemText
                                            primary={n.title}
                                            secondary={n.message || ""}
                                            primaryTypographyProps={{
                                                fontWeight: n.isRead ? 500 : 700,
                                                color: "#f9fafb",
                                                fontSize: 14,
                                            }}
                                            secondaryTypographyProps={{
                                                color: "rgba(249,250,251,0.72)",
                                                fontSize: 13,
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