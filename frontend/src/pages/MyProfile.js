import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Divider,
    Grid,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

export default function EditProfile() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [active, setActive] = useState("details");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [website, setWebsite] = useState("");
    const [walletAddress, setWalletAddress] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");

    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);

    const API_BASE = "https://localhost:7278";
    const GET_ME = `${API_BASE}/api/users/me`;
    const PUT_ME = `${API_BASE}/api/users/me`;
    const UPLOAD_AVATAR = `${API_BASE}/api/users/me/avatar`;

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(GET_ME, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`${res.status} ${txt}`);
                }

                const data = await res.json();
                if (!alive) return;

                setEmail(data?.email ?? "");
                setFirstName(data?.firstName ?? "");
                setLastName(data?.lastName ?? "");
                setWebsite(data?.website ?? "");
                setWalletAddress(data?.walletAddress ?? "");
                setAvatarUrl(data?.avatarUrl ?? data?.avatar ?? "");
            } catch (e) {
                console.error(e);
                if (alive) setErr("Couldn't load profile data");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [token, navigate]);

    const onPickAvatar = (e) => {
        const file = e.target.files?.[0] ?? null;
        setAvatarFile(file);
        if (file) {
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const uploadAvatarIfNeeded = async () => {
        if (!avatarFile) return;

        const fd = new FormData();
        fd.append("File", avatarFile);

        const res = await fetch(UPLOAD_AVATAR, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Avatar upload failed: ${res.status} ${txt}`);
        }
    };

    const isValidWalletAddress = (value) => {
        if (!value) return true;
        return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
    };

    const onSaveDetails = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (!email.trim()) {
            alert("Must provide email");
            return;
        }

        if (!isValidWalletAddress(walletAddress)) {
            alert("Wallet address format is invalid");
            return;
        }

        try {
            setLoading(true);
            setErr("");

            const payload = {
                email: email.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                website: website.trim(),
                walletAddress: walletAddress.trim()
            };

            const res = await fetch(PUT_ME, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                alert(`Error: ${res.status} ${txt}`);
                return;
            }

            await uploadAvatarIfNeeded();
            alert("Profile updated");
        } catch (e) {
            console.error(e);
            setErr("Couldn't save profile");
        } finally {
            setLoading(false);
        }
    };

    const onSavePassword = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (!currentPassword || !newPassword || !repeatNewPassword) {
            alert("Please fill all password fields");
            return;
        }

        if (newPassword !== repeatNewPassword) {
            alert("New password doesnt match");
            return;
        }

        if (newPassword.length < 6) {
            alert("Password is too short (must be atleast 6 symbols)");
            return;
        }

        try {
            setLoading(true);
            setErr("");

            const payload = { currentPassword, newPassword };

            const res = await fetch(`${PUT_ME}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                alert(`Error: ${res.status} ${txt}`);
                return;
            }

            setCurrentPassword("");
            setNewPassword("");
            setRepeatNewPassword("");
            alert("Password changed");
        } catch (e) {
            console.error(e);
            setErr("Password couldn't be changed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Profile"
                    title="Manage your account settings."
                    subtitle="Update your public details, wallet information, avatar, and password from one account workspace."
                />
            }
        >
            <SectionCard>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} lg={3}>
                        <Stack spacing={2} alignItems="center">
                            <Avatar
                                src={avatarUrl || ""}
                                sx={{ width: 84, height: 84 }}
                            />
                            <Button variant="outlined" component="label" size="small" disabled={loading}>
                                Change photo
                                <input hidden type="file" accept="image/*" onChange={onPickAvatar} />
                            </Button>
                        </Stack>

                        <Box sx={{ mt: 2 }}>
                            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
                                <List disablePadding>
                                    <ListItemButton onClick={() => navigate("/")}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <DashboardIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Dashboard" />
                                    </ListItemButton>

                                    <Divider />

                                    <ListItemButton
                                        selected={active === "details"}
                                        onClick={() => setActive("details")}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <PersonIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Account Details" />
                                    </ListItemButton>

                                    <ListItemButton
                                        selected={active === "password"}
                                        onClick={() => setActive("password")}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <LockIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Change Password" />
                                    </ListItemButton>
                                </List>
                            </Paper>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8} lg={9}>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                            Account Settings
                        </Typography>

                        {err ? (
                            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                                {err}
                            </Typography>
                        ) : null}

                        {active === "details" ? (
                            <Stack spacing={2}>
                                <TextField
                                    label="Email address"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="First name"
                                    fullWidth
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="Last name"
                                    fullWidth
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="Website"
                                    fullWidth
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="Wallet address"
                                    fullWidth
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    disabled={loading}
                                    placeholder="0x..."
                                    helperText="Enter your Ethereum wallet address"
                                />

                                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
                                    <Button variant="text" onClick={() => navigate("/my-profile")} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button variant="contained" onClick={onSaveDetails} disabled={loading}>
                                        Save
                                    </Button>
                                </Stack>
                            </Stack>
                        ) : (
                            <Stack spacing={2}>
                                <TextField
                                    label="Current password"
                                    type="password"
                                    fullWidth
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="New password"
                                    type="password"
                                    fullWidth
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={loading}
                                />
                                <TextField
                                    label="Repeat new password"
                                    type="password"
                                    fullWidth
                                    value={repeatNewPassword}
                                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                                    disabled={loading}
                                />

                                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
                                    <Button variant="text" onClick={() => setActive("details")} disabled={loading}>
                                        Back
                                    </Button>
                                    <Button variant="contained" onClick={onSavePassword} disabled={loading}>
                                        Save
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </SectionCard>
        </PageShell>
    );
}
