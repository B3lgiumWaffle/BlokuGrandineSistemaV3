import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, CircularProgress, Container, Paper, Stack, Typography, TextField, Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";

function normalize(raw) {
    const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
    return data.map(x => ({
        inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
        listingTitle: x.listingTitle ?? x.ListingTitle ?? "Untitled listing",
        proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
        description: x.description ?? x.Description ?? "",
        creationDate: x.creationDate ?? x.CreationDate ?? null,
        lastModifiedBy: x.lastModifiedBy ?? x.LastModifiedBy ?? null,
        senderSeen: x.senderSeen ?? x.SenderSeen ?? true,
    }));
}

function money(v) { if (v == null) return "—"; const n = Number(v); return Number.isNaN(n) ? "—" : `€${n.toFixed(2)}`; }
function dateText(v) { if (!v) return "—"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(); }

export default function MySentInquiries() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        let alive = true;
        (async () => {
            try {
                setLoading(true); setErr("");
                const data = await apiGet("/api/inquiries/my-sent");
                if (!alive) return;
                setItems(normalize(data));
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load sent inquiries");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [navigate, token]);

    const filtered = items.filter(x => {
        const t = q.trim().toLowerCase();
        if (!t) return true;
        return (
            String(x.inquiryId).includes(t) ||
            (x.listingTitle || "").toLowerCase().includes(t) ||
            (x.description || "").toLowerCase().includes(t) ||
            money(x.proposedSum).toLowerCase().includes(t)
        );
    });

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>My Sent Inquiries</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <TextField fullWidth label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
            ) : err ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography sx={{ opacity: 0.8 }}>{err}</Typography>
                </Paper>
            ) : filtered.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>No sent inquiries</Typography>
                    <Typography sx={{ opacity: 0.8, mt: 0.5 }}>When you send an inquiry, it will appear here.</Typography>
                </Paper>
            ) : (
                <Stack spacing={1.5}>
                    {filtered.map(x => {
                        const updated = x.lastModifiedBy === "OWNER" && !x.senderSeen;
                        return (
                            <Paper
                                key={x.inquiryId}
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 3, cursor: "pointer", "&:hover": { transform: "translateY(-1px)" } }}
                                onClick={() => navigate(`/my-mysentinquiriesdetails/${x.inquiryId}`)}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 900 }}>Inquiry #{x.inquiryId}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.85 }}>{x.listingTitle}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.3 }}>
                                            {(x.description || "—").slice(0, 120)}{(x.description || "").length > 120 ? "…" : ""}
                                        </Typography>
                                    </Box>

                                    <Stack alignItems="flex-end" spacing={0.6}>
                                        <Typography sx={{ fontWeight: 900 }}>{money(x.proposedSum)}</Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.7 }}>{dateText(x.creationDate)}</Typography>
                                        {updated ? <Chip size="small" color="warning" label="Updated" /> : <Chip size="small" variant="outlined" label="Sent" />}
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