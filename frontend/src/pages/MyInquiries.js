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

/**
 * Expected API shapes supported:
 * A) [{ listingId, listingTitle, inquiries: [...] }, ...]
 * B) flat list: [{ inquiryId, fkListingId, listingTitle, ... }, ...]
 */
function normalizeGroups(raw) {
    const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];

    // If it already looks grouped
    const looksGrouped =
        Array.isArray(data) &&
        data.length > 0 &&
        (data[0].inquiries || data[0].Inquiries);

    if (looksGrouped) {
        return data.map((g) => {
            const inquiries = g.inquiries ?? g.Inquiries ?? [];
            return {
                listingId: g.listingId ?? g.ListingId ?? g.fk_listingId ?? g.FkListingId ?? g.fkListingId,
                listingTitle: g.listingTitle ?? g.ListingTitle ?? g.title ?? g.Title ?? "Untitled listing",
                inquiries: (Array.isArray(inquiries) ? inquiries : []).map((x) => ({
                    inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
                    proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
                    description: x.description ?? x.Description ?? "",
                    creationDate: x.creationDate ?? x.CreationDate ?? x.createdAt ?? null,
                    isConfirmed: x.isConfirmed ?? x.IsConfirmed ?? false,
                    fkUserId: x.fkUserId ?? x.FkUserId ?? null,
                })),
            };
        });
    }

    // Otherwise group client-side
    const byListing = new Map();

    for (const x of data) {
        const listingId = x.fkListingId ?? x.FkListingId ?? x.fk_listingId ?? x.listingId ?? x.ListingId;
        const listingTitle = x.listingTitle ?? x.ListingTitle ?? x.title ?? x.Title ?? "Untitled listing";

        const inquiry = {
            inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
            proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
            description: x.description ?? x.Description ?? "",
            creationDate: x.creationDate ?? x.CreationDate ?? x.createdAt ?? null,
            isConfirmed: x.isConfirmed ?? x.IsConfirmed ?? false,
            fkUserId: x.fkUserId ?? x.FkUserId ?? null,
        };

        if (!byListing.has(listingId)) {
            byListing.set(listingId, { listingId, listingTitle, inquiries: [] });
        }
        byListing.get(listingId).inquiries.push(inquiry);
    }

    return Array.from(byListing.values()).sort((a, b) =>
        (a.listingTitle || "").localeCompare(b.listingTitle || "")
    );
}

function priceText(x) {
    if (x?.proposedSum == null) return "—";
    // Keep it simple (EUR for now)
    return `€${Number(x.proposedSum).toFixed(2)}`;
}

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

export default function MyInquiries() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [groups, setGroups] = useState([]);
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

                // ✅ endpoint for "inquiries for listings I own"
                const data = await apiGet("/api/inquiries/for-my-listings");
                if (!alive) return;

                const g = normalizeGroups(data);
                setGroups(g);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load inquiries");
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
        if (!query) return groups;

        return groups
            .map((g) => {
                const hitListing = (g.listingTitle ?? "").toLowerCase().includes(query);
                const inquiries = g.inquiries.filter((x) => {
                    return (
                        String(x.inquiryId ?? "").includes(query) ||
                        (x.description ?? "").toLowerCase().includes(query) ||
                        priceText(x).toLowerCase().includes(query)
                    );
                });

                if (hitListing) return g; // show all inquiries if listing title matches
                if (inquiries.length === 0) return null;
                return { ...g, inquiries };
            })
            .filter(Boolean);
    }, [groups, q]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    My Inquiries
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
                    label="Search by listing, description, price, or ID"
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
                        No inquiries found
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                        When someone sends an inquiry to your listings, it will appear here.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {filtered.map((g) => (
                        <Paper key={g.listingId} sx={{ p: 2.2, borderRadius: 3 }}>
                            {/* Listing header */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                        {g.listingTitle}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Listing ID: {g.listingId ?? "—"} • Inquiries: {g.inquiries.length}
                                    </Typography>
                                </Box>

                                <Chip
                                    label={`${g.inquiries.length} inquiry${g.inquiries.length === 1 ? "" : "ies"}`}
                                    variant="outlined"
                                />
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            {/* Inquiries cards (Fiverr-ish list) */}
                            <Stack spacing={1.2}>
                                {g.inquiries.map((x) => (
                                    <Paper
                                        key={x.inquiryId}
                                        variant="outlined"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            cursor: "pointer",
                                            transition: "0.15s",
                                            "&:hover": { transform: "translateY(-1px)" },
                                        }}
                                        onClick={() => navigate(`/my-inquiries/${x.inquiryId}`)}
                                    >
                                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 900 }}>
                                                    Inquiry #{x.inquiryId}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    {shortText(x.description, 120)}
                                                </Typography>
                                            </Box>

                                            <Stack alignItems="flex-end" spacing={0.4} sx={{ flex: "0 0 auto" }}>
                                                <Typography sx={{ fontWeight: 900 }}>
                                                    {priceText(x)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                    {dateText(x.creationDate)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}