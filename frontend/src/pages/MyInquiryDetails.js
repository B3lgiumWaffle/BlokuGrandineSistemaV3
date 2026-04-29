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
    Chip,
    Grid,
    TextField,
    IconButton,
    InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiDelete, apiPutFormData, apiPostNoBody, apiPost } from "../api/api";
import { useAppDialog } from "../components/AppDialogProvider";
import { createDisplayNumberMap, getDisplayNumber, getInquiryStatusMeta } from "../utils/displayNames";
import { formatEthFixed } from "../utils/currency";

const API_BASE = process.env.REACT_APP_API_BASE ?? "http://localhost:8080";

function safeDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

function money(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return formatEthFixed(n);
}

function normalizeInquiry(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    const reqs = x.requirements ?? x.Requirements ?? [];
    const terms = x.contractTerms ?? x.ContractTerms ?? null;

    return {
        inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
        fkListingId: x.fkListingId ?? x.FkListingId ?? x.fk_listingId,
        fkUserId: x.fkUserId ?? x.FkUserId ?? null,

        proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
        description: x.description ?? x.Description ?? "",
        creationDate: x.creationDate ?? x.CreationDate ?? null,

        isConfirmed: x.isConfirmed ?? x.IsConfirmed ?? false,
        status: x.status ?? x.Status ?? "PENDING",

        lastModifiedBy: x.lastModifiedBy ?? x.LastModifiedBy ?? null,

        ownerSeen: x.ownerSeen ?? x.OwnerSeen ?? true,
        senderSeen: x.senderSeen ?? x.SenderSeen ?? true,

        requirements: (Array.isArray(reqs) ? reqs : []).map((r) => ({
            requirementId: r.requirementId ?? r.RequirementId ?? r.id,
            description: r.description ?? r.Description ?? "",
            fileUrl: r.fileUrl ?? r.FileUrl ?? null,
            forseenCompletionDate: r.forseenCompletionDate ?? r.ForseenCompletionDate ?? "",
        })),
        contractTerms: terms ? {
            fragmentSpeedMinScore: terms.fragmentSpeedMinScore ?? terms.FragmentSpeedMinScore ?? null,
            fragmentSpeedRefundPercent: terms.fragmentSpeedRefundPercent ?? terms.FragmentSpeedRefundPercent ?? null,
            revisionCountMaxAverage: terms.revisionCountMaxAverage ?? terms.RevisionCountMaxAverage ?? null,
            revisionCountRefundPercent: terms.revisionCountRefundPercent ?? terms.RevisionCountRefundPercent ?? null,
            contractSpeedMinScore: terms.contractSpeedMinScore ?? terms.ContractSpeedMinScore ?? null,
            contractSpeedRefundPercent: terms.contractSpeedRefundPercent ?? terms.ContractSpeedRefundPercent ?? null,
            messageResponseMinScore: terms.messageResponseMinScore ?? terms.MessageResponseMinScore ?? null,
            messageResponseRefundPercent: terms.messageResponseRefundPercent ?? terms.MessageResponseRefundPercent ?? null,
            rejectedFragmentsMaxCount: terms.rejectedFragmentsMaxCount ?? terms.RejectedFragmentsMaxCount ?? null,
            rejectedFragmentsRefundPercent: terms.rejectedFragmentsRefundPercent ?? terms.RejectedFragmentsRefundPercent ?? null,
        } : null,
    };
}

function newDraftReq() {
    return {
        requirementId: null,
        description: "",
        forseenCompletionDate: "",
        existingFileUrl: null,
        file: null,
    };
}

function defaultDraftTerms() {
    return {
        fragmentSpeedRefundPercent: "0",
        revisionCountMaxAverage: "3",
        revisionCountRefundPercent: "0",
        contractSpeedRefundPercent: "0",
    };
}

export default function MyInquiryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dialog = useAppDialog();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [draftPrice, setDraftPrice] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftReqs, setDraftReqs] = useState([]);
    const [draftTerms, setDraftTerms] = useState(defaultDraftTerms());
    const [saving, setSaving] = useState(false);
    const [displayNumber, setDisplayNumber] = useState(null);

    const statusMeta = getInquiryStatusMeta(item?.status, item?.isConfirmed);

    // Owner gali accept tik jei paskutinis modifikavo ne OWNER ir dar nėra confirmed
    const canAccept = item?.lastModifiedBy !== "OWNER" && !item?.isConfirmed;
    const canModifyOrDecline = !item?.isConfirmed;

    const load = async (aliveRef = { alive: true }) => {
        try {
            setLoading(true);
            setErr("");

            const [data, groupedInquiries] = await Promise.all([
                apiGet(`/api/inquiries/${id}`),
                apiGet("/api/inquiries/for-my-listings"),
            ]);
            if (!aliveRef.alive) return;

            const n = normalizeInquiry(data);
            setItem(n);

            const groupsRaw = Array.isArray(groupedInquiries)
                ? groupedInquiries
                : groupedInquiries?.items ?? groupedInquiries?.data ?? [];
            const flatInquiries = groupsRaw.flatMap((group) => {
                const inquiries = group?.inquiries ?? group?.Inquiries ?? [];
                return Array.isArray(inquiries) ? inquiries : [];
            });
            const displayMap = createDisplayNumberMap(
                flatInquiries.map((x) => ({ inquiryId: x.inquiryId ?? x.InquiryId ?? x.id })),
                (x) => x.inquiryId
            );
            setDisplayNumber(getDisplayNumber(displayMap, n.inquiryId));

            setDraftPrice(n.proposedSum ?? "");
            setDraftDesc(n.description ?? "");
            setDraftReqs(
                (n.requirements || []).map((r) => ({
                    requirementId: r.requirementId,
                    description: r.description ?? "",
                    forseenCompletionDate: r.forseenCompletionDate ?? "",
                    existingFileUrl: r.fileUrl ?? null,
                    file: null,
                }))
            );
            setDraftTerms({
                fragmentSpeedRefundPercent: String(n.contractTerms?.fragmentSpeedRefundPercent ?? 0),
                revisionCountMaxAverage: String(n.contractTerms?.revisionCountMaxAverage ?? 3),
                revisionCountRefundPercent: String(n.contractTerms?.revisionCountRefundPercent ?? 0),
                contractSpeedRefundPercent: String(n.contractTerms?.contractSpeedRefundPercent ?? 0),
            });
        } catch (e) {
            if (!aliveRef.alive) return;
            setErr(e?.message ?? "Couldn't load inquiry");
        } finally {
            if (!aliveRef.alive) return;
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const aliveRef = { alive: true };
        load(aliveRef);

        return () => {
            aliveRef.alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate, token]);

    const onAccept = async () => {
        try {
            await apiPostNoBody(`/api/inquiries/${id}/accept-owner`);

            let contract;
            try {
                contract = await apiGet(`/api/contracts/by-inquiry/${id}`);
            } catch {
                contract = await apiPost(`/api/contracts/from-inquiry/${id}`);
            }

            await dialog.alert({ variant: "success", title: "Inquiry accepted", message: "The inquiry was accepted successfully." });
            navigate(`/contracts/${contract.contractId}`);
        } catch (e) {
            await dialog.alert({ variant: "error", title: "Accept failed", message: e?.message ?? "Accept failed" });
        }
    };

    const onDecline = async () => {
        const ok = await dialog.confirm({
            title: `Decline inquiry${displayNumber ? ` #${displayNumber}` : ""}?`,
            message: "This will delete it.",
            confirmText: "Decline"
        });
        if (!ok) return;

        try {
            await apiDelete(`/api/inquiries/${id}`);
            await dialog.alert({ variant: "success", title: "Inquiry declined", message: "The inquiry was declined and deleted." });
            navigate("/my-inquiries");
        } catch (e) {
            console.error(e);
            await dialog.alert({ variant: "error", title: "Decline failed", message: e?.message ?? "Failed to decline (delete) inquiry" });
        }
    };

    const onModify = () => {
        setIsEditing(true);
    };

    const onCancelEdit = () => {
        if (item) {
            setDraftPrice(item.proposedSum ?? "");
            setDraftDesc(item.description ?? "");
            setDraftReqs(
                (item.requirements || []).map((r) => ({
                    requirementId: r.requirementId,
                    description: r.description ?? "",
                    forseenCompletionDate: r.forseenCompletionDate ?? "",
                    existingFileUrl: r.fileUrl ?? null,
                    file: null,
                }))
            );
            setDraftTerms({
                fragmentSpeedRefundPercent: String(item.contractTerms?.fragmentSpeedRefundPercent ?? 0),
                revisionCountMaxAverage: String(item.contractTerms?.revisionCountMaxAverage ?? 3),
                revisionCountRefundPercent: String(item.contractTerms?.revisionCountRefundPercent ?? 0),
                contractSpeedRefundPercent: String(item.contractTerms?.contractSpeedRefundPercent ?? 0),
            });
        }
        setIsEditing(false);
    };

    const setReqField = (idx, field, value) => {
        setDraftReqs((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
    };

    const addRequirement = () => setDraftReqs((prev) => [...prev, newDraftReq()]);

    const removeRequirement = (idx) => {
        setDraftReqs((prev) => prev.filter((_, i) => i !== idx));
    };

    const canSave =
        draftDesc.trim().length > 0 &&
        draftReqs.length > 0 &&
        draftReqs.every((r) => r.description.trim().length > 0);

    const onSave = async () => {
        try {
            setSaving(true);

            const fd = new FormData();

            if (draftPrice !== "" && draftPrice != null) {
                fd.append("ProposedSum", String(draftPrice));
            }

            fd.append("Description", draftDesc ?? "");
            fd.append("ModifiedNote", "Updated requirements");
            fd.append("ContractTerms.FragmentSpeedMinScore", "2");
            fd.append("ContractTerms.FragmentSpeedRefundPercent", String(draftTerms.fragmentSpeedRefundPercent || 0));
            fd.append("ContractTerms.RevisionCountMaxAverage", String(draftTerms.revisionCountMaxAverage || 3));
            fd.append("ContractTerms.RevisionCountRefundPercent", String(draftTerms.revisionCountRefundPercent || 0));
            fd.append("ContractTerms.ContractSpeedMinScore", "2");
            fd.append("ContractTerms.ContractSpeedRefundPercent", String(draftTerms.contractSpeedRefundPercent || 0));
            fd.append("ContractTerms.MessageResponseMinScore", "2");
            fd.append("ContractTerms.MessageResponseRefundPercent", "0");
            fd.append("ContractTerms.RejectedFragmentsMaxCount", "0");
            fd.append("ContractTerms.RejectedFragmentsRefundPercent", "0");

            draftReqs.forEach((r, i) => {
                if (r.requirementId != null) {
                    fd.append(`Requirements[${i}].RequirementId`, String(r.requirementId));
                }

                fd.append(`Requirements[${i}].Description`, r.description ?? "");

                if (r.forseenCompletionDate) {
                    fd.append(`Requirements[${i}].ForseenCompletionDate`, r.forseenCompletionDate);
                }

                if (r.file) {
                    fd.append(`Requirements[${i}].File`, r.file);
                } else if (r.existingFileUrl) {
                    fd.append(`Requirements[${i}].ExistingFileUrl`, r.existingFileUrl);
                }
            });

            await apiPutFormData(`/api/inquiries/${id}`, fd);

            const data = await apiGet(`/api/inquiries/${id}`);
            const n = normalizeInquiry(data);
            setItem(n);

            if (n.lastModifiedBy === "SENDER" && !n.ownerSeen) {
                await apiPostNoBody(`/api/inquiries/${id}/seen-owner`);
            }

            setDraftPrice(n.proposedSum ?? "");
            setDraftDesc(n.description ?? "");
            setDraftReqs(
                (n.requirements || []).map((r) => ({
                    requirementId: r.requirementId,
                    description: r.description ?? "",
                    forseenCompletionDate: r.forseenCompletionDate ?? "",
                    existingFileUrl: r.fileUrl ?? null,
                    file: null,
                }))
            );
            setDraftTerms({
                fragmentSpeedRefundPercent: String(n.contractTerms?.fragmentSpeedRefundPercent ?? 0),
                revisionCountMaxAverage: String(n.contractTerms?.revisionCountMaxAverage ?? 3),
                revisionCountRefundPercent: String(n.contractTerms?.revisionCountRefundPercent ?? 0),
                contractSpeedRefundPercent: String(n.contractTerms?.contractSpeedRefundPercent ?? 0),
            });

            setIsEditing(false);
            await dialog.alert({ variant: "success", title: "Inquiry updated", message: "The inquiry was updated successfully." });
        } catch (e) {
            console.error(e);
            await dialog.alert({ variant: "error", title: "Update failed", message: e?.message ?? "Failed to update inquiry" });
        } finally {
            setSaving(false);
        }
    };




    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Inquiry Details
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
                    <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {err}
                    </Typography>
                </Paper>
            ) : !item ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 700 }}>Inquiry not found</Typography>
                </Paper>
            ) : (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                Inquiry #{displayNumber ?? "—"}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Created: {safeDate(item.creationDate)}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`Offer: ${money(item.proposedSum)}`} variant="outlined" />
                            <Chip
                                label={statusMeta.label}
                                color={statusMeta.color}
                                variant={statusMeta.variant}
                            />
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {!isEditing ? (
                        <>
                            <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Description</Typography>
                            <Typography sx={{ whiteSpace: "pre-wrap", opacity: 0.92 }}>
                                {item.description || "—"}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            {item.contractTerms && (
                                <>
                                    <Typography sx={{ fontWeight: 900, mb: 1 }}>Refund rules</Typography>
                                    <Stack spacing={1.2} sx={{ mb: 2 }}>
                                        <Chip size="small" variant="outlined" label={`Refund if a fragment is late: ${item.contractTerms.fragmentSpeedRefundPercent}%`} />
                                        <Chip size="small" variant="outlined" label={`Same fragment submissions allowed: ${item.contractTerms.revisionCountMaxAverage}`} />
                                        <Chip size="small" variant="outlined" label={`Refund if submission limit exceeded: ${item.contractTerms.revisionCountRefundPercent}%`} />
                                        <Chip size="small" variant="outlined" label={`Refund if final contract deadline is missed: ${item.contractTerms.contractSpeedRefundPercent}%`} />
                                    </Stack>
                                    <Divider sx={{ my: 2 }} />
                                </>
                            )}

                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Requirements</Typography>

                            {item.requirements.length === 0 ? (
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    No requirements
                                </Typography>
                            ) : (
                                <Stack spacing={1.2}>
                                    {item.requirements.map((r, index) => (
                                        <Paper key={r.requirementId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                            <Stack spacing={0.6}>
                                                <Typography sx={{ fontWeight: 800 }}>
                                                    Requirement #{index + 1}
                                                </Typography>

                                                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                                    {r.description || "—"}
                                                </Typography>

                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                    <Chip
                                                        size="small"
                                                        variant="outlined"
                                                        label={`Wanted date: ${r.forseenCompletionDate || "—"}`}
                                                    />
                                                    {r.fileUrl ? (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => window.open(`${API_BASE}${r.fileUrl}`, "_blank")}
                                                        >
                                                            Open file
                                                        </Button>
                                                    ) : (
                                                        <Chip size="small" variant="outlined" label="No file" />
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}

                            <Divider sx={{ my: 2.2 }} />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={onModify} disabled={!canModifyOrDecline} sx={{ fontWeight: 800 }}>
                                    Modify
                                </Button>
                                <Button variant="contained" color="error" onClick={onDecline} disabled={!canModifyOrDecline} sx={{ fontWeight: 800 }}>
                                    Decline
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={onAccept}
                                    disabled={!canAccept}
                                    sx={{ fontWeight: 800 }}
                                >
                                    Accept
                                </Button>
                            </Stack>

                            {!canModifyOrDecline && (
                                <Typography variant="body2" sx={{ mt: 1.2, opacity: 0.7, textAlign: "right" }}>
                                    Accepted inquiries can no longer be modified or declined.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Edit Inquiry</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Offer (ETH)"
                                        value={draftPrice}
                                        onChange={(e) => setDraftPrice(e.target.value)}
                                        fullWidth
                                        type="number"
                                        inputProps={{ min: 0, step: "0.01" }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">ETH</InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <TextField
                                        label="Description"
                                        value={draftDesc}
                                        onChange={(e) => setDraftDesc(e.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={3}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Refund rules</Typography>
                            <Stack spacing={1.5}>
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 800, mb: 0.6 }}>
                                        Late fragment refund
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.72, mb: 1.5 }}>
                                        Set the refund percentage applied when any fragment is submitted after its own requirement deadline.
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Rule"
                                                value="Applied when fragment milestone deadline is missed"
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Refund if fragment is late"
                                                value={draftTerms.fragmentSpeedRefundPercent}
                                                onChange={(e) => setDraftTerms((prev) => ({ ...prev, fragmentSpeedRefundPercent: e.target.value }))}
                                                fullWidth
                                                type="number"
                                                inputProps={{ min: 0, max: 100, step: "0.01" }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 800, mb: 0.6 }}>
                                        Fragment resubmission limit
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.72, mb: 1.5 }}>
                                        Decide how many times the same fragment can be submitted and what refund applies after that limit is exceeded.
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Max same fragment submissions"
                                                value={draftTerms.revisionCountMaxAverage}
                                                onChange={(e) => setDraftTerms((prev) => ({ ...prev, revisionCountMaxAverage: e.target.value }))}
                                                fullWidth
                                                type="number"
                                                inputProps={{ min: 1, step: "1" }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Refund if limit exceeded"
                                                value={draftTerms.revisionCountRefundPercent}
                                                onChange={(e) => setDraftTerms((prev) => ({ ...prev, revisionCountRefundPercent: e.target.value }))}
                                                fullWidth
                                                type="number"
                                                inputProps={{ min: 0, max: 100, step: "0.01" }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Typography sx={{ fontWeight: 800, mb: 0.6 }}>
                                        Late final delivery refund
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.72, mb: 1.5 }}>
                                        Set the refund percentage applied if the last fragment misses the final contract deadline.
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Deadline rule"
                                                value="Applied when final contract deadline is missed"
                                                fullWidth
                                                InputProps={{ readOnly: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Refund if final deadline is missed"
                                                value={draftTerms.contractSpeedRefundPercent}
                                                onChange={(e) => setDraftTerms((prev) => ({ ...prev, contractSpeedRefundPercent: e.target.value }))}
                                                fullWidth
                                                type="number"
                                                inputProps={{ min: 0, max: 100, step: "0.01" }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography sx={{ fontWeight: 900 }}>Requirements</Typography>
                                <Button startIcon={<AddIcon />} onClick={addRequirement}>
                                    Add requirement
                                </Button>
                            </Stack>

                            <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                                {draftReqs.map((r, idx) => (
                                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                        <Stack spacing={1}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Typography sx={{ fontWeight: 800 }}>
                                                    Requirement #{idx + 1}
                                                </Typography>

                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeRequirement(idx)}
                                                    disabled={draftReqs.length === 1}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        label="Requirement description"
                                                        value={r.description}
                                                        onChange={(e) => setReqField(idx, "description", e.target.value)}
                                                        fullWidth
                                                        multiline
                                                        minRows={2}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <TextField
                                                        label="Wanted completion date"
                                                        type="date"
                                                        value={r.forseenCompletionDate || ""}
                                                        onChange={(e) => setReqField(idx, "forseenCompletionDate", e.target.value)}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} md={3}>
                                                    <Button
                                                        variant="outlined"
                                                        component="label"
                                                        fullWidth
                                                        sx={{ height: "56px" }}
                                                    >
                                                        {r.file ? "File chosen" : "Replace file"}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            onChange={(e) =>
                                                                setReqField(idx, "file", e.target.files?.[0] ?? null)
                                                            }
                                                        />
                                                    </Button>

                                                    <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.75 }}>
                                                        {r.file?.name
                                                            ? r.file.name
                                                            : r.existingFileUrl
                                                                ? "Current file attached"
                                                                : "No file"}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>

                            <Divider sx={{ my: 2.2 }} />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={onCancelEdit} sx={{ fontWeight: 800 }} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={onSave}
                                    sx={{ fontWeight: 900 }}
                                    disabled={!canSave || saving}
                                >
                                    {saving ? "Saving..." : "Save changes"}
                                </Button>
                            </Stack>
                        </>
                    )}
                </Paper>
            )}
        </Container>
    );
}
