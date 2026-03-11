import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
    Chip
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "https://localhost:7278";

export default function UserProfileMonitoringDetails() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);

    useEffect(() => {

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
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
                setItem(data);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Failed to load user");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, token, userId]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    User Profile Details
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography>{err}</Typography>
                </Paper>
            ) : !item ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>User not found</Typography>
                </Paper>
            ) : (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {item.user?.username}
                    </Typography>
                    <Typography variant="body2">User ID: {item.user?.userId}</Typography>
                    <Typography variant="body2">Email: {item.user?.email}</Typography>
                    <Typography variant="body2">Role: {item.user?.role}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                        User Listings
                    </Typography>

                    <Stack spacing={1.2}>
                        {(item.listings ?? []).map((l) => (
                            <Paper key={l.listingId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                <Typography sx={{ fontWeight: 800 }}>{l.title}</Typography>
                                <Typography variant="body2">Listing ID: {l.listingId}</Typography>
                                <Typography variant="body2">
                                    Uploaded: {l.uploadTime ? new Date(l.uploadTime).toLocaleString() : "—"}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip
                                        label={l.isActivated ? "Approved" : "Inactive"}
                                        variant="outlined"
                                    />
                                </Stack>
                                {l.adminComment ? (
                                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                                        Admin comment: {l.adminComment}
                                    </Typography>
                                ) : null}
                            </Paper>
                        ))}
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}