import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPostJson } from "../api/api";
import { useAppDialog } from "../components/AppDialogProvider";
import { formatStatusLabel } from "../utils/displayNames";

function safeDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

function money(value) {
    if (value == null || value === "") return "—";
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return `€${n.toFixed(2)}`;
}

function eth(value) {
    if (value == null || value === "") return "—";
    const n = Number(value);
    if (Number.isNaN(n)) return "—";
    return `${n} ETH`;
}

function resolveFileHref(filePath) {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
    return `https://localhost:7278${filePath}`;
}

export default function AdminDisputes() {
    const navigate = useNavigate();
    const dialog = useAppDialog();

    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [detailErr, setDetailErr] = useState("");
    const [q, setQ] = useState("");
    const [adminComment, setAdminComment] = useState("");

    const loadList = async (preferredId = null) => {
        try {
            setLoading(true);
            setErr("");

            const data = await apiGet("/api/admin/disputes");
            const nextItems = Array.isArray(data) ? data : [];
            setItems(nextItems);

            const nextSelectedId =
                preferredId && nextItems.some((item) => Number(item.fragmentId) === Number(preferredId))
                    ? preferredId
                    : nextItems[0]?.fragmentId ?? null;

            setSelectedId(nextSelectedId);

            if (!nextSelectedId) {
                setDetail(null);
                setAdminComment("");
            }
        } catch (e) {
            setErr(e?.message ?? "Failed to load disputes");
        } finally {
            setLoading(false);
        }
    };

    const loadDetail = async (fragmentId) => {
        if (!fragmentId) {
            setDetail(null);
            return;
        }

        try {
            setDetailLoading(true);
            setDetailErr("");

            const data = await apiGet(`/api/admin/disputes/${fragmentId}`);
            setDetail(data);
            setAdminComment("");
        } catch (e) {
            setDetailErr(e?.message ?? "Failed to load dispute");
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        loadList();
    }, []);

    useEffect(() => {
        loadDetail(selectedId);
    }, [selectedId]);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return items;

        return items.filter((item) =>
            String(item.contractId ?? "").includes(query) ||
            String(item.fragmentId ?? "").includes(query) ||
            (item.title ?? "").toLowerCase().includes(query) ||
            (item.listingTitle ?? "").toLowerCase().includes(query) ||
            (item.providerName ?? "").toLowerCase().includes(query) ||
            (item.clientName ?? "").toLowerCase().includes(query)
        );
    }, [items, q]);

    const handleResolve = async (decision) => {
        if (!selectedId) return;

        const isApprove = decision === "approve";
        const confirmed = await dialog.confirm({
            title: isApprove ? "Approve dispute" : "Reject dispute",
            message: isApprove
                ? "Are you sure you want to approve this disputed fragment?"
                : "Are you sure you want to keep this disputed fragment rejected?",
            confirmText: isApprove ? "Approve" : "Reject"
        });

        if (!confirmed) return;

        try {
            setBusy(true);

            await apiPostJson(`/api/admin/disputes/${selectedId}/${decision}`, {
                reviewComment: adminComment.trim()
            });

            await dialog.alert({
                variant: "success",
                title: "Dispute resolved",
                message: isApprove
                    ? "Disputed fragment was approved successfully."
                    : "Disputed fragment was left rejected successfully."
            });

            await loadList(selectedId);
        } catch (e) {
            await dialog.alert({
                variant: "error",
                title: "Resolve failed",
                message: e?.message ?? "Failed to resolve dispute"
            });
        } finally {
            setBusy(false);
        }
    };

    const dispute = detail?.dispute ?? null;
    const relatedFragments = Array.isArray(detail?.relatedFragments) ? detail.relatedFragments : [];
    const fileHref = resolveFileHref(dispute?.fragment?.filePath);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Dispute Resolution
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Search by contract, fragment, listing, provider or client"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography>{err}</Typography>
                </Paper>
            ) : (
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                    <Paper sx={{ width: { xs: "100%", md: 360 }, p: 1.25, borderRadius: 3, alignSelf: "stretch" }}>
                        <Stack spacing={1}>
                            {!filtered.length ? (
                                <Typography sx={{ px: 1, py: 1.5, opacity: 0.75 }}>
                                    No active disputes.
                                </Typography>
                            ) : (
                                filtered.map((item) => (
                                    <Paper
                                        key={item.fragmentId}
                                        variant="outlined"
                                        onClick={() => setSelectedId(item.fragmentId)}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            cursor: "pointer",
                                            borderColor: Number(selectedId) === Number(item.fragmentId) ? "info.main" : "divider",
                                            bgcolor: Number(selectedId) === Number(item.fragmentId) ? "#ecfeff" : "#fff"
                                        }}
                                    >
                                        <Stack spacing={0.7}>
                                            <Typography sx={{ fontWeight: 900 }}>
                                                Contract #{item.contractId} • Fragment #{item.fragmentId}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {item.title || "Untitled fragment"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.78 }}>
                                                Milestone #{item.milestoneNo} • {item.providerName} vs {item.clientName}
                                            </Typography>
                                            <Chip
                                                label={formatStatusLabel(item.status, "fragment")}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                                sx={{ alignSelf: "flex-start" }}
                                            />
                                        </Stack>
                                    </Paper>
                                ))
                            )}
                        </Stack>
                    </Paper>

                    <Paper sx={{ flex: 1, p: 2.5, borderRadius: 3 }}>
                        {detailLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : detailErr ? (
                            <Typography>{detailErr}</Typography>
                        ) : !dispute ? (
                            <Typography sx={{ opacity: 0.75 }}>
                                Select a dispute to review its contract and fragment details.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                            Contract #{dispute.contract.contractId} dispute
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.78 }}>
                                            Listing: {dispute.contract.listingTitle || "—"}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        <Chip label={`Contract: ${formatStatusLabel(dispute.contract.status)}`} variant="outlined" />
                                        <Chip label={`Fragment: ${formatStatusLabel(dispute.fragment.status, "fragment")}`} color="info" variant="outlined" />
                                    </Stack>
                                </Stack>

                                <Divider />

                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, flex: 1 }}>
                                        <Typography sx={{ fontWeight: 800, mb: 1 }}>Participants</Typography>
                                        <Typography variant="body2">Provider: {dispute.provider.displayName}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{dispute.provider.email}</Typography>
                                        <Typography variant="body2" sx={{ mt: 1 }}>Client: {dispute.client.displayName}</Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{dispute.client.email}</Typography>
                                    </Paper>

                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, flex: 1 }}>
                                        <Typography sx={{ fontWeight: 800, mb: 1 }}>Contract snapshot</Typography>
                                        <Typography variant="body2">Agreed amount: {money(dispute.contract.agreedAmountEur)}</Typography>
                                        <Typography variant="body2">Funded: {eth(dispute.contract.fundedAmountEth)}</Typography>
                                        <Typography variant="body2">Milestones: {dispute.contract.milestoneCount ?? "—"}</Typography>
                                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                            Smart contract: {dispute.contract.smartContractAddress || "—"}
                                        </Typography>
                                    </Paper>
                                </Stack>

                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                                        Disputed fragment
                                    </Typography>
                                    <Stack spacing={1}>
                                        <Typography variant="body2"><strong>Title:</strong> {dispute.fragment.title || "—"}</Typography>
                                        <Typography variant="body2"><strong>Submitted:</strong> {safeDate(dispute.fragment.submittedAt)}</Typography>
                                        <Typography variant="body2"><strong>Milestone:</strong> #{dispute.milestone.milestoneNo}</Typography>
                                        <Typography variant="body2"><strong>Milestone status:</strong> {formatStatusLabel(dispute.milestone.status, "milestone")}</Typography>
                                        <Typography variant="body2"><strong>Amount:</strong> {money(dispute.milestone.amountEurSnapshot)} / {eth(dispute.milestone.amountEth)}</Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                            <strong>Description:</strong> {`\n`}{dispute.fragment.description || "—"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                            <strong>Review trail:</strong> {`\n`}{dispute.fragment.reviewComment || "—"}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>File:</strong>{" "}
                                            {fileHref ? <a href={fileHref} target="_blank" rel="noreferrer">Download fragment</a> : "—"}
                                        </Typography>
                                    </Stack>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                                        Related requirement
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                        {dispute.requirement?.description || "No requirement description."}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Deadline: {safeDate(dispute.requirement?.forseenCompletionDate)}
                                    </Typography>
                                    <Typography variant="body2">
                                        Requirement file:{" "}
                                        {dispute.requirement?.fileUrl ? (
                                            <a href={resolveFileHref(dispute.requirement.fileUrl)} target="_blank" rel="noreferrer">
                                                Open requirement file
                                            </a>
                                        ) : "—"}
                                    </Typography>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 900, mb: 1 }}>
                                        All fragments for this milestone
                                    </Typography>
                                    <Stack spacing={1}>
                                        {relatedFragments.map((fragment) => (
                                            <Paper key={fragment.fragmentId} variant="outlined" sx={{ p: 1.2, borderRadius: 2 }}>
                                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 800 }}>
                                                            Fragment #{fragment.fragmentId} - {fragment.title || "Untitled"}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                                            Submitted: {safeDate(fragment.submittedAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Chip label={formatStatusLabel(fragment.status, "fragment")} variant="outlined" />
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Paper>

                                <TextField
                                    label="Administrator comment"
                                    multiline
                                    minRows={4}
                                    fullWidth
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    disabled={busy}
                                    helperText="Optional comment that will be saved in the dispute review trail."
                                />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleResolve("reject")}
                                        disabled={busy}
                                        sx={{ fontWeight: 800 }}
                                    >
                                        {busy ? "Saving..." : "Keep rejected"}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleResolve("approve")}
                                        disabled={busy}
                                        sx={{ fontWeight: 800 }}
                                    >
                                        {busy ? "Saving..." : "Approve fragment"}
                                    </Button>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>
                </Stack>
            )}
        </Container>
    );
}
