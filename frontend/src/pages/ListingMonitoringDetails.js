import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDialog } from "../components/AppDialogProvider";
import { createDisplayNumberMap, getDisplayNumber } from "../utils/displayNames";

const API_URL = "https://localhost:7278";

export default function ListingMonitoringDetails() {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const dialog = useAppDialog();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [comment, setComment] = useState("");
    const [displayNumber, setDisplayNumber] = useState(null);

    const load = async () => {
        try {
            setLoading(true);
            setErr("");

            const [listingRes, pendingRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/listings/${listingId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                fetch(`${API_URL}/api/admin/listings/pending`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
            ]);

            if (!listingRes.ok) {
                const txt = await listingRes.text().catch(() => "");
                throw new Error(`${listingRes.status} ${txt}`);
            }

            const data = await listingRes.json();
            const pendingData = pendingRes.ok ? await pendingRes.json() : [];
            setItem(data?.item ?? null);
            setPhotos(Array.isArray(data?.photos) ? data.photos : []);
            setComment(data?.item?.adminComment ?? "");

            const displayMap = createDisplayNumberMap(
                Array.isArray(pendingData) ? pendingData : [],
                (x) => x.listingId
            );
            setDisplayNumber(getDisplayNumber(displayMap, data?.item?.listingId ?? listingId));
        } catch (e) {
            setErr(e?.message ?? "Failed to load listing");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [listingId, navigate, token]);

    const onApprove = async () => {
        try {
            setBusy(true);

            const res = await fetch(`${API_URL}/api/admin/listings/${listingId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`${res.status} ${txt}`);
            }

            await dialog.alert({ variant: "success", title: "Listing approved", message: "The listing was approved successfully." });
            navigate("/admin/listings");
        } catch (e) {
            await dialog.alert({ variant: "error", title: "Approval failed", message: e?.message ?? "Approve failed" });
        } finally {
            setBusy(false);
        }
    };

    const onReject = async () => {
        try {
            if (!comment.trim()) {
                await dialog.alert({ variant: "warning", title: "Comment required", message: "Comment is required." });
                return;
            }

            setBusy(true);

            const res = await fetch(`${API_URL}/api/admin/listings/${listingId}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    comment
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(`${res.status} ${txt}`);
            }

            await dialog.alert({ variant: "success", title: "Listing rejected", message: "The listing was rejected successfully." });
            navigate("/admin/listings");
        } catch (e) {
            await dialog.alert({ variant: "error", title: "Rejection failed", message: e?.message ?? "Reject failed" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Listing Review
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
                    <Typography sx={{ fontWeight: 800 }}>Listing not found</Typography>
                </Paper>
            ) : (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            Listing #{displayNumber ?? "—"} - {item.title}
                        </Typography>
                        <Typography variant="body2">Price from: {item.priceFrom ?? "—"}</Typography>
                        <Typography variant="body2">Price to: {item.priceTo ?? "—"}</Typography>
                        <Typography variant="body2">Completion time: {item.completionTime ?? "—"}</Typography>

                        <Divider sx={{ my: 1 }} />

                        <Typography sx={{ fontWeight: 800 }}>Description</Typography>
                        <Typography variant="body2">
                            {item.description || "No description"}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Typography sx={{ fontWeight: 800 }}>Photos</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {photos.length === 0 ? (
                                <Typography variant="body2">No photos</Typography>
                            ) : (
                                photos.map((p) => (
                                    <Box
                                        key={p.photoId}
                                        component="img"
                                        src={p.photoUrl}
                                        alt="listing"
                                        sx={{
                                            width: 130,
                                            height: 100,
                                            objectFit: "cover",
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "divider"
                                        }}
                                    />
                                ))
                            )}
                        </Stack>

                        <Divider sx={{ my: 1 }} />

                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Comment for user if rejecting"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <Stack direction="row" spacing={1.2} sx={{ mt: 1 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={onApprove}
                                disabled={busy}
                            >
                                Approve
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={onReject}
                                disabled={busy}
                            >
                                Reject with Comment
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            )}
        </Container>
    );
}
