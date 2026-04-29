import { useState } from "react";
import { Alert, Box, Button, Grid, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell, SectionCard } from "../components/PageChrome";
import { getSessionExpiredMessage, startSession } from "../utils/authSession";

const API_URL = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has("expired")) return "";

        return getSessionExpiredMessage() || "Your session expired after 60 minutes. Please sign in again.";
    });

    const setField = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!form.usernameOrEmail || !form.password) return setError("Please complete all fields.");
        if (form.password.length < 6) return setError("Password must be at least 6 characters.");

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return setError(data.message || `Error: HTTP ${res.status}`);
            startSession(data.token, data.user);
            onLogin(data.user);
            navigate("/");
        } catch {
            setError("Could not connect to the server.");
        }
    };

    return (
        <PageShell maxWidth="lg" compact>
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12} md={5}>
                    <SectionCard sx={{ height: "100%", bgcolor: "#0f172a", color: "white" }}>
                        <Stack spacing={2}>
                            <Typography variant="h4" sx={{ color: "white" }}>Welcome back</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>
                                Sign in to manage listings, view inquiries, follow contracts, and keep your profile up to date.
                            </Typography>
                        </Stack>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={7}>
                    <SectionCard title="Sign in" subtitle="Use your email or username to access your workspace.">
                        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
                        <Box component="form" onSubmit={onSubmit}>
                            <TextField fullWidth label="Email or username" margin="normal" value={form.usernameOrEmail} onChange={setField("usernameOrEmail")} />
                            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={setField("password")} />
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Sign in</Button>
                            <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                                Need an account?{" "}
                                <MuiLink component={Link} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
                                    Register here
                                </MuiLink>
                            </Typography>
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageShell>
    );
}
