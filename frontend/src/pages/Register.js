import { useState } from "react";
import { Alert, Box, Button, Grid, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageShell, SectionCard } from "../components/PageChrome";

const API_URL = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

export default function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "", repeatPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const setField = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!form.username || !form.email || !form.password || !form.repeatPassword) return setError("Please complete all fields.");
        if (form.password !== form.repeatPassword) return setError("Passwords do not match.");

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) return setError(data.message || `Error: HTTP ${res.status}`);
            setSuccess(data.message || "Registration completed successfully.");
            setForm({ username: "", email: "", password: "", repeatPassword: "" });
        } catch {
            setError("Could not connect to the server.");
        }
    };

    return (
        <PageShell maxWidth="lg" compact>
            <Grid container spacing={2.5}>
                <Grid item xs={12} md={5}>
                    <SectionCard sx={{ height: "100%", bgcolor: "#0f766e", color: "white" }}>
                        <Stack spacing={2}>
                            <Typography variant="h4" sx={{ color: "white" }}>Create your account</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>
                                Join the platform to publish services, communicate with clients, and work through secure contract flows.
                            </Typography>
                        </Stack>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={7}>
                    <SectionCard title="Register" subtitle="Set up a new account in English-only system mode.">
                        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
                        <Box component="form" onSubmit={onSubmit}>
                            <TextField fullWidth label="Username" margin="normal" value={form.username} onChange={setField("username")} />
                            <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={setField("email")} />
                            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={setField("password")} />
                            <TextField fullWidth label="Repeat password" type="password" margin="normal" value={form.repeatPassword} onChange={setField("repeatPassword")} />
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Create account</Button>
                            <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                                Already registered?{" "}
                                <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
                                    Sign in
                                </MuiLink>
                            </Typography>
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageShell>
    );
}
