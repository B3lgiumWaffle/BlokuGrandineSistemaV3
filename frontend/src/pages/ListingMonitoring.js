import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createDisplayNumberMap, getDisplayNumber, getListingReviewStatusLabel } from "../utils/displayNames";

const API_URL = "https://localhost:7278";

export default function ListingMonitoring() {
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

                const res = await fetch(`${API_URL}/api/admin/listings/pending`, {
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
                setErr(e?.message ?? "Failed to load listings");
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
            String(x.listingId ?? "").includes(s) ||
            String(x.ownerUserId ?? "").includes(s) ||
            (x.title ?? "").toLowerCase().includes(s) ||
            (x.description ?? "").toLowerCase().includes(s)
        );
    });

    const listingDisplayNumbers = useMemo(
        () => createDisplayNumberMap(items, (x) => x.listingId),
        [items]
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Listing Monitoring
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Search by listing title or description"
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
            ) : filtered.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>No pending listings</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {filtered.map((x) => {
                        const displayNumber = getDisplayNumber(listingDisplayNumbers, x.listingId);
                        return (
                        <Paper
                            key={x.listingId}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                cursor: "pointer",
                                "&:hover": { transform: "translateY(-1px)" },
                                transition: "0.15s"
                            }}
                            onClick={() => navigate(`/admin/listings/${x.listingId}`)}
                        >
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                        Listing #{displayNumber ?? "—"} - {x.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.7 }}>
                                        {x.description || "No description"}
                                    </Typography>
                                </Box>

                                <Stack alignItems="flex-end" spacing={1}>
                                    <Chip
                                        label={getListingReviewStatusLabel(x.isActivated)}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                        );
                    })}
                </Stack>
            )}
        </Container>
    );
}
