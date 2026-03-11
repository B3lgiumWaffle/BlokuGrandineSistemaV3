import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = "https://localhost:7278";

export default function UserProfileMonitoring() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [q, setQ] = useState("");

    useEffect(() => {

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(`${API_URL}/api/admin/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`${res.status} ${txt}`);
                }

                const data = await res.json();
                if (!alive) return;

                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Failed to load users");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, token]);

    const filtered = items.filter((x) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;

        return (
            String(x.userId ?? "").includes(s) ||
            (x.username ?? "").toLowerCase().includes(s) ||
            (x.email ?? "").toLowerCase().includes(s) ||
            (x.role ?? "").toLowerCase().includes(s)
        );
    });

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    User Profile Monitoring
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Search by user ID, username, email, role"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography>{err}</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {filtered.map((x) => (
                        <Paper
                            key={x.userId}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                cursor: "pointer",
                                "&:hover": { transform: "translateY(-1px)" },
                                transition: "0.15s"
                            }}
                            onClick={() => navigate(`/admin/users/${x.userId}`)}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                {x.username}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                User ID: {x.userId}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Email: {x.email}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Role: {x.role ?? "—"}
                            </Typography>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}