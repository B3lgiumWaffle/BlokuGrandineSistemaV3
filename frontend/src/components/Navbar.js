import { AppBar, Toolbar, Button, Typography, Box, Paper, Menu, MenuItem, Divider } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

export default function Navbar({ user, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    const displayName = useMemo(() => {
        // jei user turi username, rodom jį; jei neturi – rodom "User"
        return user?.username ?? "User";
    }, [user]);

    const openMenu = (e) => setAnchorEl(e.currentTarget);
    const closeMenu = () => setAnchorEl(null);

    const go = (path) => {
        closeMenu();
        navigate(path);
    };

    const handleLogout = () => {
        closeMenu();
        onLogout();
        navigate("/");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ mr: 2 }}>
                    Blokų Grandinių Sistema
                </Typography>

                {/* Left menu */}
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
                        {/* Welcome box (clickable) */}
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
                                <MenuItem onClick={() => go("/my-listings")}>My Listings</MenuItem>
                                <MenuItem onClick={() => go("/my-inquiries")}>My Inquiries</MenuItem>
                                <MenuItem onClick={() => go("/my-mysentinquiries")}>My Sent Inquiries</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
