import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Link as MuiLink,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { Link } from "react-router-dom";
import { PageShell, SectionCard } from "../components/PageChrome";
import { termsOfServiceSections } from "./TermsOfService";

const API_URL = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

export default function Register() {
    const [form, setForm] = useState({ username: "", email: "", password: "", repeatPassword: "" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [termsOpen, setTermsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const setField = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

    const validateForm = () => {
        setError("");
        setSuccess("");
        if (!form.username || !form.email || !form.password || !form.repeatPassword) {
            setError("Please complete all fields.");
            return false;
        }
        if (form.password !== form.repeatPassword) {
            setError("Passwords do not match.");
            return false;
        }
        return true;
    };

    const registerAccount = async () => {
        try {
            setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setTermsOpen(true);
    };

    const acceptTerms = async () => {
        setTermsOpen(false);
        await registerAccount();
    };

    const declineTerms = () => {
        setTermsOpen(false);
        setError("You must accept the Terms of Service to create an account.");
    };

    const termsDialog = (
        <Dialog
            open={termsOpen}
            onClose={declineTerms}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 0 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Terms of Service
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
                    Please review and accept the terms before creating your account.
                </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ maxHeight: "70vh" }}>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Last updated: May 14, 2026
                </Typography>
                <Stack spacing={2.25}>
                    {termsOfServiceSections.map((section, index) => (
                        <Box key={section.title}>
                            {index > 0 ? <Divider sx={{ mb: 2.25 }} /> : null}
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 850 }}>
                                {section.title}
                            </Typography>
                            <Stack spacing={1}>
                                {section.body.map((paragraph) => (
                                    <Typography key={paragraph} sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                                        {paragraph}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={declineTerms} disabled={submitting}>
                    Decline
                </Button>
                <Button variant="contained" onClick={acceptTerms} disabled={submitting}>
                    {submitting ? "Creating..." : "Accept"}
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <PageShell maxWidth="lg" compact>
            {termsDialog}
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
                            <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
                                {submitting ? "Creating..." : "Create account"}
                            </Button>
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
