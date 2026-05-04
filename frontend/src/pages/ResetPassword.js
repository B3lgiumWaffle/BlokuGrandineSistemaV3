import { useState } from "react";
import { Alert, Box, Button, Grid, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { PageShell, SectionCard } from "../components/PageChrome";
import { apiPostJson } from "../api/api";

export default function ResetPassword() {
    const location = useLocation();
    const token = new URLSearchParams(location.search).get("token") || "";
    const [form, setForm] = useState({ newPassword: "", repeatPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const setField = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!token) return setError("Password reset link is invalid.");
        if (!form.newPassword || !form.repeatPassword) return setError("Please complete all fields.");
        if (form.newPassword.length < 6) return setError("Password must be at least 6 characters.");
        if (form.newPassword !== form.repeatPassword) return setError("Passwords do not match.");

        try {
            setSubmitting(true);
            const data = await apiPostJson("/api/auth/reset-password", { token, ...form });
            setSuccess(data?.message || "Password updated successfully. You can now sign in.");
            setForm({ newPassword: "", repeatPassword: "" });
        } catch (err) {
            setError(err.message || "Could not reset password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageShell maxWidth="lg" compact>
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12} md={5}>
                    <SectionCard sx={{ height: "100%", bgcolor: "#0f172a", color: "white" }}>
                        <Stack spacing={2}>
                            <Typography variant="h4" sx={{ color: "white" }}>Create a new password</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>
                                Choose a password you have not used before and sign in again after it is saved.
                            </Typography>
                        </Stack>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={7}>
                    <SectionCard title="Reset password" subtitle="Your new password must be at least 6 characters.">
                        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
                        <Box component="form" onSubmit={onSubmit}>
                            <TextField
                                fullWidth
                                label="New password"
                                type="password"
                                margin="normal"
                                value={form.newPassword}
                                onChange={setField("newPassword")}
                            />
                            <TextField
                                fullWidth
                                label="Repeat new password"
                                type="password"
                                margin="normal"
                                value={form.repeatPassword}
                                onChange={setField("repeatPassword")}
                            />
                            <Button type="submit" variant="contained" fullWidth disabled={submitting || !token} sx={{ mt: 2 }}>
                                {submitting ? "Saving..." : "Update password"}
                            </Button>
                            <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                                Ready to continue?{" "}
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
