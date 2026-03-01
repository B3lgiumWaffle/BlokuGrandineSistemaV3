import { useState } from "react";
import { Container, Typography, TextField, Button, Alert, Box } from "@mui/material";
import { Link } from "react-router-dom";


const API_URL = "https://localhost:7278";

export default function Login({ onLogin }) {
    const [form, setForm] = useState({
        usernameOrEmail: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const setField = (name) => (e) => {
        setForm((p) => ({ ...p, [name]: e.target.value }));
    };

    const validate = () => {
        if (!form.usernameOrEmail || !form.password) return "Please fill all fields";
        if (form.password.length < 6) return "Password needs to be at least 6 characters";
        return "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const v = validate();
        if (v) return setError(v);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usernameOrEmail: form.usernameOrEmail,
                    password: form.password,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data.message || `Error: HTTP ${res.status}`);
                return;
            }

            // ✅ išsisaugom user
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            onLogin(data.user);


            //setSuccess(`Logged in: ${data.username} (${data.role})`);
            setSuccess(`Logged in: ${data.user.username} (${data.user.role})`);
            setForm({ usernameOrEmail: "", password: "" });
        } catch {
            setError("Could not connect to server (is backend working?)");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Log-in
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={onSubmit}>
                <TextField
                    fullWidth
                    label="Email or Username"
                    margin="normal"
                    value={form.usernameOrEmail}
                    onChange={setField("usernameOrEmail")}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    margin="normal"
                    value={form.password}
                    onChange={setField("password")}
                />

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Log-in
                </Button>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Typography variant="body2">
                        If you are not registered,{" "}
                        <Link to="/register" style={{ textDecoration: "none", fontWeight: 600 }}>
                            register here
                        </Link>
                    </Typography>
                </Box>

            </Box>
        </Container>
    );
}
