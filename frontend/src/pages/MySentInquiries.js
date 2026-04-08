import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
    TextField,
    Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import { BackButton, EmptyState, PageHero, PageShell, SectionCard } from "../components/PageChrome";

function normalize(raw) {
    const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];
    return data.map((x) => ({
        inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
        listingTitle: x.listingTitle ?? x.ListingTitle ?? "Untitled listing",
        proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
        description: x.description ?? x.Description ?? "",
        creationDate: x.creationDate ?? x.CreationDate ?? null,
        isConfirmed: x.isConfirmed ?? x.IsConfirmed ?? false,
        lastModifiedBy: x.lastModifiedBy ?? x.LastModifiedBy ?? null,
        senderSeen: x.senderSeen ?? x.SenderSeen ?? true,
    }));
}

function money(v) {
    if (v == null) return "—";
    const n = Number(v);
    return Number.isNaN(n) ? "—" : `€${n.toFixed(2)}`;
}

function dateText(v) {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function shortText(s, max = 120) {
    const t = (s ?? "").trim();
    if (!t) return "—";
    return t.length > max ? t.slice(0, max) + "…" : t;
}

export default function MySentInquiries() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [showAccepted, setShowAccepted] = useState(false);

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

        return () => {
            alive = false;
        };
    }, [navigate, token]);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return items;

        return items.filter((x) => (
            String(x.inquiryId).includes(t) ||
            (x.listingTitle || "").toLowerCase().includes(t) ||
            (x.description || "").toLowerCase().includes(t) ||
            money(x.proposedSum).toLowerCase().includes(t)
        ));
    }, [items, q]);

    const openItems = useMemo(
        () => filtered.filter((x) => !x.isConfirmed),
        [filtered]
    );

    const acceptedItems = useMemo(
        () => filtered.filter((x) => x.isConfirmed),
        [filtered]
    );

    const totalOpen = useMemo(
        () => items.filter((x) => !x.isConfirmed).length,
        [items]
    );

    const totalAccepted = useMemo(
        () => items.filter((x) => x.isConfirmed).length,
        [items]
    );

    const renderInquiryCard = (x, variant = "open") => {
        const updated = x.lastModifiedBy === "OWNER" && !x.senderSeen && !x.isConfirmed;
        const isAccepted = variant === "accepted";

        return (
            <Paper
                key={x.inquiryId}
                variant="outlined"
                sx={{
                    p: 1.8,
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "0.15s",
                    bgcolor: isAccepted ? "#f0fdf4" : updated ? "#fff7ed" : "#fffdf4",
                    borderColor: isAccepted ? "#86efac" : updated ? "#fdba74" : "#fcd34d",
                    "&:hover": { transform: "translateY(-1px)" }
                }}
                onClick={() => navigate(`/my-mysentinquiriesdetails/${x.inquiryId}`)}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.6 }}>
                            <Typography sx={{ fontWeight: 900 }}>
                                Inquiry #{x.inquiryId}
                            </Typography>
                            <Chip
                                size="small"
                                color={isAccepted ? "success" : updated ? "warning" : "default"}
                                variant={isAccepted || updated ? "filled" : "outlined"}
                                label={isAccepted ? "Accepted" : updated ? "Updated" : "Open"}
                            />
                        </Stack>

                        <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>
                            {x.listingTitle}
                        </Typography>

                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.45 }}>
                            {shortText(x.description, 140)}
                        </Typography>
                    </Box>

                    <Stack
                        direction={{ xs: "row", md: "column" }}
                        alignItems={{ xs: "center", md: "flex-end" }}
                        spacing={0.6}
                        sx={{ flex: "0 0 auto", width: { xs: "100%", md: "auto" }, justifyContent: "space-between" }}
                    >
                        <Typography sx={{ fontWeight: 900 }}>
                            {money(x.proposedSum)}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {dateText(x.creationDate)}
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>
        );
    };

    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Sent inquiries"
                    title="Follow the inquiries you sent to service providers."
                    subtitle="See active responses first, keep accepted conversations grouped below, and manage your client inbox more clearly."
                    actions={[<BackButton key="back" onClick={() => navigate(-1)} />]}
                    stats={[
                        { label: "All inquiries", value: items.length },
                        { label: "Open", value: totalOpen },
                        { label: "Accepted", value: totalAccepted }
                    ]}
                />
            }
        >
            <SectionCard sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label="Search by listing, description, price, or ID"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </SectionCard>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <SectionCard>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography sx={{ opacity: 0.8 }}>{err}</Typography>
                </SectionCard>
            ) : filtered.length === 0 ? (
                <EmptyState title="No sent inquiries" subtitle="When you send an inquiry to a listing, it will appear here." />
            ) : (
                <Stack spacing={2}>
                    <SectionCard>
                        <Stack spacing={1.4}>
                            <Box>
                                <Typography sx={{ fontWeight: 900, mb: 0.35 }}>
                                    Open inquiries
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.74 }}>
                                    Active conversations stay here so you can quickly spot new updates and pending responses.
                                </Typography>
                            </Box>

                            {openItems.length === 0 ? (
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#fafafa" }}>
                                    <Typography variant="body2" sx={{ opacity: 0.72 }}>
                                        No open sent inquiries match this search.
                                    </Typography>
                                </Paper>
                            ) : (
                                <Stack spacing={1.2}>
                                    {openItems.map((x) => renderInquiryCard(x, "open"))}
                                </Stack>
                            )}
                        </Stack>
                    </SectionCard>

                    {acceptedItems.length > 0 && (
                        <SectionCard>
                            <Stack spacing={1.4}>
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1}
                                >
                                    <Box>
                                        <Typography sx={{ fontWeight: 900, mb: 0.35 }}>
                                            Accepted inquiries
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.74 }}>
                                            Grouped below so completed negotiation threads do not clutter the active inbox.
                                        </Typography>
                                    </Box>

                                    <Button variant="outlined" onClick={() => setShowAccepted((prev) => !prev)} sx={{ fontWeight: 800 }}>
                                        {showAccepted ? "Hide accepted" : `Expand accepted (${acceptedItems.length})`}
                                    </Button>
                                </Stack>

                                {showAccepted && (
                                    <>
                                        <Divider />
                                        <Stack spacing={1.2}>
                                            {acceptedItems.map((x) => renderInquiryCard(x, "accepted"))}
                                        </Stack>
                                    </>
                                )}
                            </Stack>
                        </SectionCard>
                    )}
                </Stack>
            )}
        </PageShell>
    );
}
