import {
    AppBar, Toolbar, Button, Typography, Box, Menu, MenuItem, Divider, Badge, IconButton, ListItemText, Stack, Chip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

const API_URL = "https://localhost:7278";

export default function Navbar({ user, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const token = localStorage.getItem("token");
    const menuOpen = Boolean(anchorEl);
    const notifOpen = Boolean(notifAnchorEl);

    const displayName = useMemo(() => user?.username ?? "Account", [user]);
    const currentPath = location.pathname;

    const userRole = (() => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
        } catch {
            return null;
        }
    })();

    const loadNotifications = async () => {
        if (!token) return;
        try {
            const [listRes, countRes] = await Promise.all([
                fetch(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
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

    useEffect(() => {
        if (user) {
            loadNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const markAllAsRead = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/notifications/read-all`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) await loadNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    const markAsReadAndGo = async (n) => {
        try {
            if (token && !n.isRead) {
                await fetch(`${API_URL}/api/notifications/${n.notificationId}/read`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setNotifAnchorEl(null);
            await loadNotifications();
            if (n.type === "ListingRejected") return navigate(`/my-listings/edit/${n.referenceId}`);
            if (n.type === "ListingApproved") return navigate("/my-listings");
            if (n.type === "contract_message") return navigate(`/contracts/${n.referenceId}`);
            navigate("/my-profile");
        } catch (e) {
            console.error(e);
        }
    };

    const navItems = [
        { to: "/", label: "Home" },
        { to: "/work", label: "Marketplace" },
        { to: "/my-contracts", label: "Contracts", auth: true },
        { to: "/my-inquiries", label: "Incoming Inquiries", auth: true, roles: ["Admin", "Seller"] },
        { to: "/my-mysentinquiries", label: "Sent Inquiries", auth: true },
        { to: "/my-completed-contracts-comments", label: "Reviews", auth: true },
        { to: "/about", label: "About" }
    ].filter((item) => {
        if (item.auth && !user) return false;
        if (item.roles && !item.roles.includes(userRole)) return false;
        return true;
    });

    const navButtonSx = (active) => ({
        color: active ? "#052e2b" : "#e2e8f0",
        px: 1.6,
        py: 0.9,
        borderRadius: 0,
        fontWeight: 700,
        bgcolor: active ? "#ccfbf1" : "transparent",
        "&:hover": {
            bgcolor: active ? "#ccfbf1" : "rgba(255,255,255,0.08)"
        }
    });

    return (
        <AppBar position="sticky" elevation={0} sx={{ background: "rgba(15, 23, 42, 0.86)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <Toolbar sx={{ minHeight: 78, gap: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mr: 1 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 0, display: "grid", placeItems: "center", bgcolor: "#14b8a6", color: "#042f2e", fontWeight: 900 }}>
                        BS
                    </Box>
                    <Box>
                        <Typography sx={{ color: "white", fontWeight: 900, lineHeight: 1.1 }}>Blockchain Service Platform</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.64)", fontSize: 12 }}>Secure freelance workflow system</Typography>
                    </Box>
                </Stack>

                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                    {navItems.map((item) => (
                        <Button key={item.to} component={Link} to={item.to} sx={navButtonSx(currentPath === item.to)}>
                            {item.label}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {!user ? (
                    <Stack direction="row" spacing={1}>
                        <Button component={Link} to="/register" variant="text" sx={{ color: "#e2e8f0" }}>Register</Button>
                        <Button component={Link} to="/login" variant="contained" sx={{ borderRadius: 0, bgcolor: "#14b8a6", color: "#042f2e", "&:hover": { bgcolor: "#2dd4bf" } }}>
                            Sign in
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <IconButton onClick={async (e) => { setNotifAnchorEl(e.currentTarget); await loadNotifications(); }} sx={{ color: "white" }}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <Button onClick={(e) => setAnchorEl(e.currentTarget)} variant="outlined" sx={{ borderRadius: 0, color: "white", borderColor: "rgba(255,255,255,0.18)", px: 1.7 }}>
                            {displayName}
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{ sx: { mt: 1, minWidth: 250, borderRadius: 0, border: "1px solid rgba(15,23,42,0.08)" } }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography sx={{ fontWeight: 800 }}>{displayName}</Typography>
                                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{userRole || "User account"}</Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={() => { setAnchorEl(null); navigate("/my-profile"); }}>My profile</MenuItem>
                            {(userRole === "Admin" || userRole === "Seller") ? <MenuItem onClick={() => { setAnchorEl(null); navigate("/my-listings"); }}>My listings</MenuItem> : null}
                            {userRole === "Admin" ? <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin/listings"); }}>Admin listings</MenuItem> : null}
                            {userRole === "Admin" ? <MenuItem onClick={() => { setAnchorEl(null); navigate("/admin/users"); }}>Admin users</MenuItem> : null}
                            <Divider />
                            <MenuItem onClick={() => { setAnchorEl(null); onLogout(); navigate("/"); }}>Sign out</MenuItem>
                        </Menu>

                        <Menu
                            anchorEl={notifAnchorEl}
                            open={notifOpen}
                            onClose={() => setNotifAnchorEl(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{ sx: { mt: 1, width: 360, maxWidth: "calc(100vw - 24px)", borderRadius: 0, border: "1px solid rgba(15,23,42,0.08)" } }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontWeight: 900 }}>Notifications</Typography>
                                    <Chip label={`${unreadCount} unread`} size="small" />
                                </Stack>
                            </Box>
                            <Divider />
                            <MenuItem onClick={markAllAsRead}>Mark all as read</MenuItem>
                            <Divider />
                            {notifications.length === 0 ? (
                                <MenuItem disabled>No notifications yet</MenuItem>
                            ) : notifications.slice(0, 8).map((n) => (
                                <MenuItem key={n.notificationId} onClick={() => markAsReadAndGo(n)} sx={{ alignItems: "flex-start", py: 1.2 }}>
                                    <ListItemText
                                        primary={n.title}
                                        secondary={n.message || ""}
                                        primaryTypographyProps={{ fontWeight: n.isRead ? 600 : 800, fontSize: 14 }}
                                        secondaryTypographyProps={{ fontSize: 13 }}
                                    />
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
}
