import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, CircularProgress, Container, Divider, Paper, Stack, Typography, Chip,
    Grid, TextField, IconButton, InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiDelete, apiPutFormData, apiPostNoBody } from "../api/api";

const API_BASE = process.env.REACT_APP_API_BASE ?? "https://localhost:7278";

function normalize(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    const reqs = x.requirements ?? x.Requirements ?? [];
    return {
        inquiryId: x.inquiryId ?? x.InquiryId ?? x.id,
        listingTitle: x.listingTitle ?? x.ListingTitle ?? "Untitled listing",
        fkListingId: x.fkListingId ?? x.FkListingId ?? null,
        proposedSum: x.proposedSum ?? x.ProposedSum ?? null,
        description: x.description ?? x.Description ?? "",
        creationDate: x.creationDate ?? x.CreationDate ?? null,
        lastModifiedBy: x.lastModifiedBy ?? x.LastModifiedBy ?? null,
        senderSeen: x.senderSeen ?? x.SenderSeen ?? true,
        requirements: (Array.isArray(reqs) ? reqs : []).map(r => ({
            requirementId: r.requirementId ?? r.RequirementId ?? r.id,
            description: r.description ?? r.Description ?? "",
            fileUrl: r.fileUrl ?? r.FileUrl ?? null,
            forseenCompletionDate: r.forseenCompletionDate ?? r.ForseenCompletionDate ?? ""
        }))
    };
}

function money(v) { if (v == null || v === "") return "—"; const n = Number(v); return Number.isNaN(n) ? "—" : `€${n.toFixed(2)}`; }
function safeDate(v) { if (!v) return "—"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(); }

function newReq() {
    return { requirementId: null, description: "", forseenCompletionDate: "", existingFileUrl: null, file: null };
}

export default function SentInquiryDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [draftPrice, setDraftPrice] = useState("");
    const [draftDesc, setDraftDesc] = useState("");
    const [draftReqs, setDraftReqs] = useState([newReq()]);
    const [saving, setSaving] = useState(false);

    const reload = async () => {
        const data = await apiGet(`/api/inquiries/${id}`);
        const n = normalize(data);
        setItem(n);

        setDraftPrice(n.proposedSum ?? "");
        setDraftDesc(n.description ?? "");
        setDraftReqs(
            (n.requirements?.length ? n.requirements : [newReq()]).map(r => ({
                requirementId: r.requirementId,
                description: r.description ?? "",
                forseenCompletionDate: r.forseenCompletionDate ?? "",
                existingFileUrl: r.fileUrl ?? null,
                file: null
            }))
        );

        // mark seen if updated by owner
        if (n.lastModifiedBy === "OWNER" && !n.senderSeen) {
            await apiPostNoBody(`/api/inquiries/${id}/seen-sender`);
        }
    };

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        let alive = true;
        (async () => {
            try {
                setLoading(true); setErr("");
                await reload();
                if (!alive) return;
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load inquiry");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate, token]);

    const onDecline = async () => {
        const ok = window.confirm(`Decline inquiry #${id}? This will delete it.`);
        if (!ok) return;
        try {
            await apiDelete(`/api/inquiries/${id}`);
            alert("Inquiry declined (deleted).");
            navigate("/sent-inquiries");
        } catch (e) {
            alert(e?.message ?? "Delete failed");
        }
    };

    const onAccept = async () => {
        try {
            await apiPostNoBody(`/api/inquiries/${id}/accept-sender`);
            alert("Accepted.");
            await reload();
        } catch (e) {
            alert(e?.message ?? "Accept failed");
        }
    };

    const onModify = () => setIsEditing(true);

    const onCancel = () => {
        setIsEditing(false);
        if (item) {
            setDraftPrice(item.proposedSum ?? "");
            setDraftDesc(item.description ?? "");
            setDraftReqs(item.requirements.map(r => ({
                requirementId: r.requirementId,
                description: r.description ?? "",
                forseenCompletionDate: r.forseenCompletionDate ?? "",
                existingFileUrl: r.fileUrl ?? null,
                file: null
            })));
        }
    };

    const setReqField = (idx, field, value) => {
        setDraftReqs(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
    };

    const addReq = () => setDraftReqs(prev => [...prev, newReq()]);
    const removeReq = (idx) => setDraftReqs(prev => prev.filter((_, i) => i !== idx));

    const canAccept = item?.lastModifiedBy === "OWNER";

    const canSave =
        draftDesc.trim().length > 0 &&
        draftReqs.length > 0 &&
        draftReqs.every(r => r.description.trim().length > 0);

    const onSave = async () => {
        try {
            setSaving(true);
            const fd = new FormData();

            if (draftPrice !== "" && draftPrice != null) fd.append("ProposedSum", String(draftPrice));
            fd.append("Description", draftDesc ?? "");

            draftReqs.forEach((r, i) => {
                if (r.requirementId != null) fd.append(`Requirements[${i}].RequirementId`, String(r.requirementId));
                fd.append(`Requirements[${i}].Description`, r.description ?? "");
                if (r.forseenCompletionDate) fd.append(`Requirements[${i}].ForseenCompletionDate`, r.forseenCompletionDate);

                if (r.file) fd.append(`Requirements[${i}].File`, r.file);
                else if (r.existingFileUrl) fd.append(`Requirements[${i}].ExistingFileUrl`, r.existingFileUrl);
            });

            await apiPutFormData(`/api/inquiries/${id}/sender`, fd);
            alert("Inquiry updated.");
            setIsEditing(false);
            await reload();
        } catch (e) {
            alert(e?.message ?? "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Sent Inquiry Details</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Stack>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
            ) : err ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800 }}>Error</Typography>
                    <Typography sx={{ opacity: 0.8 }}>{err}</Typography>
                </Paper>
            ) : !item ? (
                <Paper sx={{ p: 2, borderRadius: 3 }}><Typography sx={{ fontWeight: 800 }}>Not found</Typography></Paper>
            ) : (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>Inquiry #{item.inquiryId}</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                {item.listingTitle} • Created: {safeDate(item.creationDate)}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`Offer: ${money(item.proposedSum)}`} variant="outlined" />
                            {(item.lastModifiedBy === "OWNER" && !item.senderSeen) ? (
                                <Chip label="Updated" color="warning" />
                            ) : (
                                <Chip label="Seen" variant="outlined" />
                            )}
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    {!isEditing ? (
                        <>
                            <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Description</Typography>
                            <Typography sx={{ whiteSpace: "pre-wrap", opacity: 0.92 }}>{item.description || "—"}</Typography>

                            <Divider sx={{ my: 2 }} />

                            <Typography sx={{ fontWeight: 900, mb: 1 }}>Requirements</Typography>
                            <Stack spacing={1.2}>
                                {item.requirements.map(r => (
                                    <Paper key={r.requirementId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                        <Typography sx={{ fontWeight: 800 }}>Requirement #{r.requirementId}</Typography>
                                        <Typography sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{r.description || "—"}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
                                            <Chip size="small" variant="outlined" label={`Wanted date: ${r.forseenCompletionDate || "—"}`} />
                                            {r.fileUrl ? (
                                                <Button size="small" variant="outlined" onClick={() => window.open(`${API_BASE}${r.fileUrl}`, "_blank")}>
                                                    Open file
                                                </Button>
                                            ) : (
                                                <Chip size="small" variant="outlined" label="No file" />
                                            )}
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>

                            <Divider sx={{ my: 2.2 }} />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={onModify} sx={{ fontWeight: 800 }}>Modify</Button>
                                <Button variant="contained" color="error" onClick={onDecline} sx={{ fontWeight: 800 }}>Decline</Button>
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
                                        InputProps={{ startAdornment: <InputAdornment position="start">€</InputAdornment> }}
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

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography sx={{ fontWeight: 900 }}>Requirements</Typography>
                                <Button startIcon={<AddIcon />} onClick={addReq}>Add requirement</Button>
                            </Stack>

                            <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                                {draftReqs.map((r, idx) => (
                                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontWeight: 800 }}>
                                                Requirement {r.requirementId ? `#${r.requirementId}` : "(new)"}
                                            </Typography>
                                            <IconButton size="small" onClick={() => removeReq(idx)} disabled={draftReqs.length === 1}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>

                                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
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
                                                <Button variant="outlined" component="label" fullWidth sx={{ height: "56px" }}>
                                                    {r.file ? "File chosen" : "Replace file"}
                                                    <input hidden type="file" onChange={(e) => setReqField(idx, "file", e.target.files?.[0] ?? null)} />
                                                </Button>
                                                <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.75 }}>
                                                    {r.file?.name ? r.file.name : r.existingFileUrl ? "Current file attached" : "No file"}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>

                            <Divider sx={{ my: 2.2 }} />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="flex-end">
                                <Button variant="outlined" onClick={onCancel} disabled={saving} sx={{ fontWeight: 800 }}>Cancel</Button>
                                <Button variant="contained" onClick={onSave} disabled={!canSave || saving} sx={{ fontWeight: 900 }}>
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