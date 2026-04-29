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
import { useAppDialog } from "../components/AppDialogProvider";
import { createDisplayNumberMap, getDisplayNumber } from "../utils/displayNames";

const API_URL = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

function ratingValue(v) {
    if (v === null || v === undefined) return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return n.toFixed(2);
}

export default function UserProfileMonitoringDetails() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dialog = useAppDialog();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [displayNumber, setDisplayNumber] = useState(null);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const [detailsRes, usersRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/users/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                    fetch(`${API_URL}/api/admin/users`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                ]);

                if (!detailsRes.ok) {
                    const txt = await detailsRes.text().catch(() => "");
                    throw new Error(`${detailsRes.status} ${txt}`);
                }

                const data = await detailsRes.json();
                const usersData = usersRes.ok ? await usersRes.json() : [];
                if (!alive) return;
                setItem(data);

                const displayMap = createDisplayNumberMap(
                    Array.isArray(usersData) ? usersData : [],
                    (x) => x.userId
                );
                setDisplayNumber(getDisplayNumber(displayMap, data?.user?.userId ?? userId));
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
    }, [token, userId]);

    async function handleDeleteUser() {
        const ok = await dialog.confirm({
            title: "Delete this user?",
            message: "Related data will also be removed.",
            confirmText: "Delete"
        });
        if (!ok) return;

        try {
            setDeleting(true);
            setErr("");

            const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`${res.status} ${txt}`);
            }

            navigate("/admin/users");
        } catch (e) {
            setErr(e?.message ?? "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    }

    const dangerLabel = item?.ratings?.dangerLabel ?? "Safe";

    const dangerChipColor =
        dangerLabel === "ExtraDangerous"
            ? "error"
            : dangerLabel === "Dangerous"
                ? "warning"
                : "success";

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
                        User #{displayNumber ?? "—"} - {item.user?.username}
                    </Typography>

                    <Typography variant="body2">Email: {item.user?.email}</Typography>
                    <Typography variant="body2">Role: {item.user?.role}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                        Ratings Information
                    </Typography>

                    <Stack spacing={0.8}>
                        <Typography variant="body2">
                            System rating average: {ratingValue(item.ratings?.systemRatingAverage)}
                        </Typography>
                        <Typography variant="body2">
                            User rating average: {ratingValue(item.ratings?.userRatingAverage)}
                        </Typography>
                        <Typography variant="body2">
                            Total ratings: {item.ratings?.totalRatings ?? 0}
                        </Typography>
                        <Typography variant="body2">
                            Danger points: {item.ratings?.dangerPoints ?? 0}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip
                                label={
                                    dangerLabel === "ExtraDangerous"
                                        ? "Extra dangerous"
                                        : dangerLabel === "Dangerous"
                                            ? "Dangerous"
                                            : "Safe"
                                }
                                color={dangerChipColor}
                                variant={dangerLabel === "Safe" ? "outlined" : "filled"}
                            />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                    >
                        <Typography sx={{ fontWeight: 900 }}>
                            User Listings
                        </Typography>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteUser}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete profile"}
                        </Button>
                    </Stack>

                    <Stack spacing={1.2}>
                        {(item.listings ?? []).length === 0 ? (
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                <Typography variant="body2">No listings found.</Typography>
                            </Paper>
                        ) : (
                            (item.listings ?? []).map((l, index) => (
                                <Paper key={l.listingId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 800 }}>Listing #{index + 1} - {l.title}</Typography>
                                    <Typography variant="body2">
                                        Uploaded: {l.uploadTime ? new Date(l.uploadTime).toLocaleString() : "—"}
                                    </Typography>

                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                        <Chip
                                            label={Number(l.isActivated) === 1 ? "Approved" : "Inactive"}
                                            variant="outlined"
                                        />
                                    </Stack>

                                    {l.adminComment ? (
                                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                                            Admin comment: {l.adminComment}
                                        </Typography>
                                    ) : null}
                                </Paper>
                            ))
                        )}
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
