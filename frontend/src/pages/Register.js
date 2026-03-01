import { useState } from "react";
import { Container, Typography, TextField, Button, Alert, Box } from "@mui/material";

const API_URL = "https://localhost:7278"; // tavo backend portas

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        repeatPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const setField = (name) => (e) => {
        setForm((p) => ({ ...p, [name]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.username || !form.email || !form.password || !form.repeatPassword) {
            setError("Užpildyk visus laukus.");
            return;
        }
        if (form.password !== form.repeatPassword) {
            setError("Slaptažodžiai nesutampa.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    repeatPassword: form.repeatPassword,
                    // roleName: "User" // nebūtina, backend defaultins
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.message || `Klaida: HTTP ${res.status}`);
                return;
            }

            setSuccess(data.message || "Registracija sėkminga.");
            setForm({ username: "", email: "", password: "", repeatPassword: "" });
        } catch {
            setError("Nepavyko prisijungti prie serverio. Patikrink ar backend veikia.");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Registracija
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={onSubmit}>
                <TextField fullWidth label="Username" margin="normal" value={form.username} onChange={setField("username")} />
                <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={setField("email")} />
                <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={setField("password")} />
                <TextField fullWidth label="Repeat password" type="password" margin="normal" value={form.repeatPassword} onChange={setField("repeatPassword")} />

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Registruotis
                </Button>
            </Box>
        </Container>
    );
}
