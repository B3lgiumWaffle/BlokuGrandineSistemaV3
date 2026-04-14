import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    Divider,
    TextField,
    Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import { BackButton, EmptyState, PageHero, PageShell, SectionCard } from "../components/PageChrome";
import { createDisplayNumberMap, formatContractLabel, formatStatusLabel, getDisplayNumber } from "../utils/displayNames";

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

function statusColor(status) {
    const s = (status ?? "").toLowerCase();

    if (s === "completed" || s === "closed") return "success";
    if (s === "funded" || s === "inprogress") return "primary";
    if (s === "pendingfunding") return "warning";

    return "default";
}

function isCompletedStatus(status) {
    const normalized = (status ?? "").toLowerCase();
    return normalized === "completed" || normalized === "closed";
}

function getRoleGroup(role) {
    const normalized = (role ?? "").trim().toLowerCase();

    if (normalized === "provider") {
        return {
            key: "provider",
            title: "As Service Provider",
            description: "Contracts where you deliver the service.",
        };
    }

    return {
        key: "client",
        title: "As Client",
        description: "Contracts where you ordered the service.",
    };
}

export default function MyContracts() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");
    const [expandedCompleted, setExpandedCompleted] = useState({});

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
                (x.status ?? "").toLowerCase().includes(query) ||
                formatStatusLabel(x.status).toLowerCase().includes(query) ||
                (x.network ?? "").toLowerCase().includes(query) ||
                (x.listingTitle ?? "").toLowerCase().includes(query) ||
                (x.otherPartyName ?? "").toLowerCase().includes(query) ||
                money(x.agreedAmountEur).toLowerCase().includes(query) ||
                eth(x.fundedAmountEth).toLowerCase().includes(query)
            );
        });
    }, [items, q]);

    const contractDisplayNumbers = useMemo(
        () => createDisplayNumberMap(items, (x) => x.contractId),
        [items]
    );

    const grouped = useMemo(() => {
        const base = {
            provider: {
                key: "provider",
                title: "As Service Provider",
                description: "Contracts where you deliver the service.",
                ongoing: [],
                completed: [],
            },
            client: {
                key: "client",
                title: "As Client",
                description: "Contracts where you ordered the service.",
                ongoing: [],
                completed: [],
            },
        };

        for (const item of filtered) {
            const role = getRoleGroup(item.myRole);
            if (isCompletedStatus(item.status)) {
                base[role.key].completed.push(item);
            } else {
                base[role.key].ongoing.push(item);
            }
        }

        return [base.provider, base.client];
    }, [filtered]);

    const totalCompleted = useMemo(
        () => items.filter((x) => isCompletedStatus(x.status)).length,
        [items]
    );

    const totalOngoing = useMemo(
        () => items.filter((x) => !isCompletedStatus(x.status)).length,
        [items]
    );

    const toggleCompleted = (roleKey) => {
        setExpandedCompleted((prev) => ({
            ...prev,
            [roleKey]: !prev[roleKey],
        }));
    };

    const renderContractCard = (x) => {
        const displayNumber = getDisplayNumber(contractDisplayNumbers, x.contractId);

        return (
        <Paper
            key={x.contractId}
            variant="outlined"
            sx={{
                p: 2,
                borderRadius: 2.5,
                cursor: "pointer",
                transition: "0.15s",
                "&:hover": { transform: "translateY(-1px)" },
            }}
            onClick={() => navigate(`/contracts/${x.contractId}`)}
        >
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                        {formatContractLabel(x, displayNumber)}
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        Role: {x.myRole || "—"}
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                        Other party: {x.otherPartyName || "—"}
                    </Typography>
                </Box>

                <Stack alignItems="flex-end" spacing={0.7} sx={{ flex: "0 0 auto" }}>
                    <Chip
                        label={formatStatusLabel(x.status)}
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
        );
    };

    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Contracts"
                    title="Track contracts by role and delivery stage."
                    subtitle="Browse contracts as a service provider or as a client, then separate ongoing work from completed agreements."
                    actions={[<BackButton key="back" onClick={() => navigate(-1)} />]}
                    stats={[
                        { label: "All contracts", value: items.length },
                        { label: "Ongoing", value: totalOngoing },
                        { label: "Completed", value: totalCompleted },
                        { label: "Matching search", value: filtered.length }
                    ]}
                />
            }
        >

            <SectionCard sx={{ mb: 2 }}>
                <TextField
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    fullWidth
                    label="Search by contract, listing, status, network, or amount"
                />
            </SectionCard>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <SectionCard>
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {err}
                    </Typography>
                </SectionCard>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No contracts found"
                    subtitle="Accepted inquiries that become contracts will appear here."
                />
            ) : (
                <Stack spacing={2}>
                    {grouped.map((group) => {
                        const showCompleted = !!expandedCompleted[group.key];

                        return (
                            <Paper key={group.key} sx={{ p: 2.2, borderRadius: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                                            {group.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                            {group.description}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip
                                            label={`${group.ongoing.length} ongoing`}
                                            color={group.ongoing.length ? "primary" : "default"}
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`${group.completed.length} completed`}
                                            color={group.completed.length ? "success" : "default"}
                                            variant={group.completed.length ? "filled" : "outlined"}
                                        />
                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 1.5 }} />

                                <Stack spacing={1.2}>
                                    <Typography sx={{ fontWeight: 800 }}>
                                        Ongoing Contracts
                                    </Typography>

                                    {group.ongoing.length === 0 ? (
                                        <Paper
                                            variant="outlined"
                                            sx={{ p: 1.4, borderRadius: 2.5, bgcolor: "#fafafa" }}
                                        >
                                            <Typography variant="body2" sx={{ opacity: 0.72 }}>
                                                No ongoing contracts in this role right now.
                                            </Typography>
                                        </Paper>
                                    ) : (
                                        <Stack spacing={1.2}>
                                            {group.ongoing.map(renderContractCard)}
                                        </Stack>
                                    )}
                                </Stack>

                                <Divider sx={{ my: 1.5 }} />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                >
                                    <Box>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            Completed Contracts
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.72 }}>
                                            Archived below so active contracts stay easier to scan.
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        onClick={() => toggleCompleted(group.key)}
                                        sx={{ fontWeight: 800 }}
                                    >
                                        {showCompleted
                                            ? "Hide completed"
                                            : `Expand completed (${group.completed.length})`}
                                    </Button>
                                </Stack>

                                {showCompleted && (
                                    <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                                        {group.completed.length === 0 ? (
                                            <Paper
                                                variant="outlined"
                                                sx={{ p: 1.4, borderRadius: 2.5, bgcolor: "#fafafa" }}
                                            >
                                                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                                                    No completed contracts in this role yet.
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            group.completed.map(renderContractCard)
                                        )}
                                    </Stack>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>
            )}
        </PageShell>
    );
}
