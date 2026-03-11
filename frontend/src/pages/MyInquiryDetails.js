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

const API_BASE = process.env.REACT_APP_API_BASE ?? "https://localhost:7278";

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
    return `€${n.toFixed(2)}`;
}

function getInquiryStatusMeta(status, isConfirmed) {
    const s = String(status ?? "").toUpperCase();

    if (s === "ACCEPTED" || isConfirmed) {
        return { label: "Accepted", color: "success", variant: "filled" };
    }

    if (s === "PENDING") {
        return { label: "Pending", color: "default", variant: "outlined" };
    }

    if (s === "FUNDED") {
        return { label: "Funded", color: "primary", variant: "filled" };
    }

    if (s === "IN_PROGRESS") {
        return { label: "In Progress", color: "warning", variant: "filled" };
    }

    if (s === "COMPLETED") {
        return { label: "Completed", color: "success", variant: "filled" };
    }

    if (s === "CANCELLED") {
        return { label: "Cancelled", color: "error", variant: "outlined" };
    }

    return {
        label: isConfirmed ? "Accepted" : "Pending",
        color: isConfirmed ? "success" : "default",
        variant: isConfirmed ? "filled" : "outlined",
    };
}

function normalizeInquiry(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    const reqs = x.requirements ?? x.Requirements ?? [];

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

export default function MyInquiryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [draftPrice, setDraftPrice] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftReqs, setDraftReqs] = useState([]);
    const [saving, setSaving] = useState(false);

    const statusMeta = getInquiryStatusMeta(item?.status, item?.isConfirmed);

    // Owner gali accept tik jei paskutinis modifikavo ne OWNER ir dar nėra confirmed
    const canAccept = item?.lastModifiedBy !== "OWNER" && !item?.isConfirmed;

    const load = async (aliveRef = { alive: true }) => {
        try {
            setLoading(true);
            setErr("");

            const data = await apiGet(`/api/inquiries/${id}`);
            if (!aliveRef.alive) return;

            const n = normalizeInquiry(data);
            setItem(n);

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

            alert("Accepted.");
            navigate(`/contracts/${contract.contractId}`);
        } catch (e) {
            alert(e?.message ?? "Accept failed");
        }
    };

    const onDecline = async () => {
        const ok = window.confirm(`Decline inquiry #${id}? This will delete it.`);
        if (!ok) return;

        try {
            await apiDelete(`/api/inquiries/${id}`);
            alert("Inquiry declined (deleted).");
            navigate("/my-inquiries");
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to decline (delete) inquiry");
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

            setIsEditing(false);
            alert("Inquiry updated.");
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to update inquiry");
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
                                Inquiry #{item.inquiryId}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                Listing ID: {item.fkListingId ?? "—"} • Created: {safeDate(item.creationDate)}
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

                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Requirements</Typography>

                            {item.requirements.length === 0 ? (
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    No requirements
                                </Typography>
                            ) : (
                                <Stack spacing={1.2}>
                                    {item.requirements.map((r) => (
                                        <Paper key={r.requirementId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                            <Stack spacing={0.6}>
                                                <Typography sx={{ fontWeight: 800 }}>
                                                    Requirement #{r.requirementId}
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
                                <Button variant="outlined" onClick={onModify} sx={{ fontWeight: 800 }}>
                                    Modify
                                </Button>
                                <Button variant="contained" color="error" onClick={onDecline} sx={{ fontWeight: 800 }}>
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
                        </>
                    ) : (
                        <>
                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Edit Inquiry</Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        label="Offer (EUR)"
                                        value={draftPrice}
                                        onChange={(e) => setDraftPrice(e.target.value)}
                                        fullWidth
                                        type="number"
                                        inputProps={{ min: 0, step: "0.01" }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">€</InputAdornment>
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
                                                    Requirement {r.requirementId ? `#${r.requirementId}` : "(new)"}
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