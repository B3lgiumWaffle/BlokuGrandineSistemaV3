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

function normalizeContracts(raw) {
    const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];

    return data.map((x) => ({
        contractId: x.contractId ?? x.ContractId,
        inquiryId: x.inquiryId ?? x.InquiryId,
        clientUserId: x.clientUserId ?? x.ClientUserId,
        providerUserId: x.providerUserId ?? x.ProviderUserId,
        clientWalletAddress: x.clientWalletAddress ?? x.ClientWalletAddress ?? null,
        providerWalletAddress: x.providerWalletAddress ?? x.ProviderWalletAddress ?? null,
        network: x.network ?? x.Network ?? "",
        smartContractAddress: x.smartContractAddress ?? x.SmartContractAddress ?? null,
        chainProjectId: x.chainProjectId ?? x.ChainProjectId ?? null,
        agreedAmountEur: x.agreedAmountEur ?? x.AgreedAmountEur ?? null,
        fundedAmountEth: x.fundedAmountEth ?? x.FundedAmountEth ?? null,
        milestoneCount: x.milestoneCount ?? x.MilestoneCount ?? 0,
        milestoneAmountEth: x.milestoneAmountEth ?? x.MilestoneAmountEth ?? null,
        fundingTxHash: x.fundingTxHash ?? x.FundingTxHash ?? null,
        status: x.status ?? x.Status ?? "",
        createdAt: x.createdAt ?? x.CreatedAt ?? null,
        listingTitle: x.listingTitle ?? x.ListingTitle ?? "Untitled listing",
        otherPartyName: x.otherPartyName ?? x.OtherPartyName ?? "",
        myRole: x.myRole ?? x.MyRole ?? "",
    }));
}

function money(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `€${n.toFixed(2)}`;
}

function eth(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `${n} ETH`;
}

function dateText(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
}

function shortText(s, max = 70) {
    const t = (s ?? "").trim();
    if (!t) return "—";
    return t.length > max ? t.slice(0, max) + "…" : t;
}

function statusColor(status) {
    const s = (status ?? "").toLowerCase();

    if (s === "completed") return "success";
    if (s === "funded" || s === "inprogress") return "primary";
    if (s === "pendingfunding") return "warning";

    return "default";
}

export default function MyContracts() {
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

                const data = await apiGet("/api/contracts/my");
                if (!alive) return;

                setItems(normalizeContracts(data));
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load contracts");
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
                String(x.contractId ?? "").includes(query) ||
                String(x.inquiryId ?? "").includes(query) ||
                (x.status ?? "").toLowerCase().includes(query) ||
                (x.network ?? "").toLowerCase().includes(query) ||
                (x.listingTitle ?? "").toLowerCase().includes(query) ||
                (x.otherPartyName ?? "").toLowerCase().includes(query) ||
                money(x.agreedAmountEur).toLowerCase().includes(query) ||
                eth(x.fundedAmountEth).toLowerCase().includes(query)
            );
        });
    }, [items, q]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    My Contracts
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
                    label="Search by contract ID, inquiry ID, listing, status, network, or amount"
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
                        No contracts found
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                        Accepted inquiries that become contracts will appear here.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {filtered.map((x) => (
                        <Paper
                            key={x.contractId}
                            sx={{
                                p: 2.2,
                                borderRadius: 3,
                                cursor: "pointer",
                                transition: "0.15s",
                                "&:hover": { transform: "translateY(-1px)" },
                            }}
                            onClick={() => navigate(`/contracts/${x.contractId}`)}
                        >
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                        Contract #{x.contractId}
                                    </Typography>

                                    <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.3 }}>
                                        Listing: {shortText(x.listingTitle, 90)}
                                    </Typography>

                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Inquiry ID: {x.inquiryId ?? "—"} • Role: {x.myRole || "—"}
                                    </Typography>

                                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                        Other party: {x.otherPartyName || "—"}
                                    </Typography>
                                </Box>

                                <Stack alignItems="flex-end" spacing={0.7} sx={{ flex: "0 0 auto" }}>
                                    <Chip
                                        label={x.status || "Unknown"}
                                        color={statusColor(x.status)}
                                        variant="outlined"
                                    />
                                    <Typography sx={{ fontWeight: 900 }}>
                                        {money(x.agreedAmountEur)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                        {dateText(x.createdAt)}
                                    </Typography>
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip label={`Network: ${x.network || "localhost"}`} variant="outlined" />
                                <Chip label={`Funded: ${eth(x.fundedAmountEth)}`} variant="outlined" />
                                <Chip label={`Milestones: ${x.milestoneCount ?? 0}`} variant="outlined" />
                                <Chip
                                    label={`Chain ID: ${x.chainProjectId ?? "—"}`}
                                    variant="outlined"
                                />
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}