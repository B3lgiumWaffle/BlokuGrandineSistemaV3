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
    Chip,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPostJson } from "../api/api";

function dateText(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

export default function ContractCommentForm() {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState("");
    const [data, setData] = useState(null);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const res = await apiGet(`/api/comment/contract/${contractId}`);
                if (!alive) return;

                setData(res);
                setCommentText(res?.commentText ?? "");
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load contract");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [contractId, navigate, token]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setErr("");

            await apiPostJson(`/api/comment/contract/${contractId}`, {
                commentText,
            });

            navigate("/my-completed-contracts-comments");
        } catch (e) {
            setErr(e?.message ?? "Couldn't save comment");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (err) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                        {err}
                    </Typography>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!data) return null;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Contract Comment
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            {data.listingTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Contract ID: {data.contractId} • Listing ID: {data.listingId}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={data.status || "—"} color="success" variant="outlined" />
                        <Chip label={data.myRole || "—"} variant="outlined" />
                        <Chip label={`Other party: ${data.otherPartyName || "—"}`} variant="outlined" />
                    </Stack>

                    {data.hasComment ? (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                            <Typography sx={{ fontWeight: 800, mb: 0.8 }}>
                                Comment already written
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                {data.commentText || "—"}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 1 }}>
                                {dateText(data.commentCreatedAt)}
                            </Typography>

                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                onClick={() => navigate(`/listing/${data.listingId}`)}
                            >
                                Go to listing
                            </Button>
                        </Paper>
                    ) : (
                        <>
                            <TextField
                                label="Write comment"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                fullWidth
                                multiline
                                minRows={5}
                            />

                            <Stack direction="row" spacing={1.2}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving || !commentText.trim()}
                                >
                                    {saving ? "Saving..." : "Save comment"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/listing/${data.listingId}`)}
                                >
                                    Go to listing
                                </Button>
                            </Stack>
                        </>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}