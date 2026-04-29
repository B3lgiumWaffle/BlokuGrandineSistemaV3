import { useEffect, useMemo, useState } from "react";
import {
    Box,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
    Divider,
    Button,
    TextField,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import { createDisplayNumberMap, formatContractLabel, formatStatusLabel, getDisplayNumber } from "../utils/displayNames";

function dateText(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

function shortText(s, max = 90) {
    const t = (s ?? "").trim();
    if (!t) return "—";
    return t.length > max ? t.slice(0, max) + "…" : t;
}

export default function MyCompletedContractsComments() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");

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

                const data = await apiGet("/api/comment/my-completed-contracts");
                if (!alive) return;

                const list = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
                setItems(list);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load completed contracts");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, token]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return items;

        return items.filter((x) => {
            return (
                (x.listingTitle ?? "").toLowerCase().includes(query) ||
                (x.otherPartyName ?? "").toLowerCase().includes(query) ||
                (x.status ?? "").toLowerCase().includes(query) ||
                formatStatusLabel(x.status).toLowerCase().includes(query) ||
                (x.commentText ?? "").toLowerCase().includes(query)
            );
        });
    }, [items, q]);

    const contractDisplayNumbers = useMemo(
        () => createDisplayNumberMap(items, (x) => x.contractId),
        [items]
    );

    const noCommentItems = useMemo(
        () => filtered.filter((x) => !x.hasComment),
        [filtered]
    );

    const commentedItems = useMemo(
        () => filtered.filter((x) => x.hasComment),
        [filtered]
    );

    const handleOpen = (x) => {
        if (x.hasComment) {
            navigate(`/listing/${x.listingId}`);
            return;
        }

        navigate(`/contract-comments/${x.contractId}`);
    };

    const renderContractCard = (x) => {
        const displayNumber = getDisplayNumber(contractDisplayNumbers, x.contractId);

        return (
        <Paper
            key={x.contractId}
            sx={{
                p: 2.2,
                borderRadius: 3,
                cursor: "pointer",
                transition: "0.15s",
                "&:hover": { transform: "translateY(-1px)" },
            }}
            onClick={() => handleOpen(x)}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                        {formatContractLabel(x, displayNumber)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        {x.myRole} • Other party: {x.otherPartyName || "—"}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ flex: "0 0 auto" }}>
                    <Chip label={formatStatusLabel(x.status)} color="success" variant="outlined" />
                    <Chip
                        label={x.hasComment ? "Comment written" : "Write comment"}
                        color={x.hasComment ? "success" : "primary"}
                        variant={x.hasComment ? "filled" : "outlined"}
                    />
                </Stack>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {x.hasComment
                            ? shortText(x.commentText, 140)
                            : "No comment yet. Click to open comment form."}
                    </Typography>
                </Box>

                <Typography variant="caption" sx={{ opacity: 0.7, flex: "0 0 auto" }}>
                    {x.hasComment ? dateText(x.commentCreatedAt) : dateText(x.contractCreatedAt)}
                </Typography>
            </Stack>
        </Paper>
        );
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Completed Contracts
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <TextField
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    fullWidth
                    label="Search by contract, listing, person, or comment"
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {err}
                    </Typography>
                </Paper>
            ) : filtered.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        No completed contracts found
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                        Completed contracts that can be commented will appear here.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                            Contracts without comments
                        </Typography>

                        {noCommentItems.length === 0 ? (
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                All visible contracts already have comments.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {noCommentItems.map(renderContractCard)}
                            </Stack>
                        )}
                    </Paper>

                    <Box sx={{ px: 1 }}>
                        <Divider
                            sx={{
                                borderBottomWidth: 2,
                                mb: 0.8,
                            }}
                        />
                        <Divider
                            sx={{
                                borderBottomWidth: 2,
                            }}
                        />
                    </Box>

                    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                            Contracts with comments
                        </Typography>

                        {commentedItems.length === 0 ? (
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                No commented contracts yet.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {commentedItems.map(renderContractCard)}
                            </Stack>
                        )}
                    </Paper>
                </Stack>
            )}
        </Container>
    );
}
