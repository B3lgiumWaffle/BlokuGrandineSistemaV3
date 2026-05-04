import { useState } from "react";
import { Alert, Box, Button, Grid, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageShell, SectionCard } from "../components/PageChrome";
import { apiPostJson } from "../api/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            return setError("Enter a valid email address.");
        }

        try {
            setSubmitting(true);
            const data = await apiPostJson("/api/auth/forgot-password", { email: trimmedEmail });
            setSuccess(data?.message || "If this email exists, a password reset link has been sent.");
        } catch (err) {
            setError(err.message || "Could not send password reset email.");
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
                            <Typography variant="h4" sx={{ color: "white" }}>Reset access</Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>
                                Enter your account email and we will send you a secure link to create a new password.
                            </Typography>
                        </Stack>
                    </SectionCard>
                </Grid>
                <Grid item xs={12} md={7}>
                    <SectionCard title="Forgot password" subtitle="The reset link expires after 60 minutes.">
                        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
                        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
                        <Box component="form" onSubmit={onSubmit}>
                            <TextField
                                fullWidth
                                label="Email address"
                                margin="normal"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
                                {submitting ? "Sending..." : "Send reset link"}
                            </Button>
                            <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                                Remembered it?{" "}
                                <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
                                    Back to sign in
                                </MuiLink>
                            </Typography>
                        </Box>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageShell>
    );
}
