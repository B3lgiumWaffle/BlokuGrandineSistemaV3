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
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    TextField,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPostFormData } from "../api/api";

function normalizeListing(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    return {
        title: x.title ?? x.Title ?? "",
        description: x.description ?? x.Description ?? "",
        priceFrom: x.priceFrom ?? x.PriceFrom ?? null,
        priceTo: x.priceTo ?? x.PriceTo ?? null,
        completionTime: x.completionTime ?? x.CompletionTime ?? "",
        categoryId: x.categoryId ?? x.CategoryId ?? null,
    };
}

function normalizeComments(raw) {
    const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.data ?? [];

    return data.map((x, index) => ({
        commentId: x.commentId ?? x.CommentId ?? index,
        commentText: x.commentText ?? x.CommentText ?? "",
        createdAt: x.createdAt ?? x.CreatedAt ?? null,
        username:
            x.username ??
            x.Username ??
            x.userName ??
            x.UserName ??
            x.fullName ??
            x.FullName ??
            "User",
        avatar:
            x.avatar ??
            x.Avatar ??
            x.avatarUrl ??
            x.AvatarUrl ??
            null,
    }));
}

function normalizePhotos(rawPhotos) {
    const arr = Array.isArray(rawPhotos) ? rawPhotos : [];
    const mapped = arr
        .map((p) => ({
            photoId: p.photoId ?? p.PhotoId ?? p.id ?? Math.random(),
            photoUrl: p.photoUrl ?? p.PhotoUrl ?? p.url ?? "",
            isPrimary: p.isPrimary ?? p.IsPrimary ?? false,
        }))
        .filter((x) => !!x.photoUrl);

    mapped.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    return mapped;
}

function moneyRangeText(priceFrom, priceTo) {
    if (priceFrom != null && priceTo != null) return `€${priceFrom} – €${priceTo}`;
    if (priceFrom != null) return `From €${priceFrom}`;
    if (priceTo != null) return `Up to €${priceTo}`;
    return "Not specified";
}

function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
}

function newReq() {
    return { description: "", forseenCompletionDate: "", file: null };
}

function defaultContractTerms() {
    return {
        fragmentSpeedMinScore: "2",
        fragmentSpeedRefundPercent: "0",
        revisionCountMaxAverage: "3",
        revisionCountRefundPercent: "0",
        contractSpeedMinScore: "2",
        contractSpeedRefundPercent: "0",
        messageResponseMinScore: "2",
        messageResponseRefundPercent: "0",
        rejectedFragmentsMaxCount: "0",
        rejectedFragmentsRefundPercent: "0",
    };
}

function legacyContractTermsPreset() {
    return {
        fragmentSpeedMinScore: "2",
        fragmentSpeedRefundPercent: "0",
        revisionCountMaxAverage: "3",
        revisionCountRefundPercent: "50",
        contractSpeedMinScore: "2",
        contractSpeedRefundPercent: "50",
        messageResponseMinScore: "2",
        messageResponseRefundPercent: "0",
        rejectedFragmentsMaxCount: "0",
        rejectedFragmentsRefundPercent: "0",
    };
}

function InquiryModal({
    open,
    onClose,
    onSubmit,
    listingId,
    listingPriceFrom,
    listingPriceTo,
    continueLabel = "Continue",
}) {
    const suggestedText = useMemo(
        () => moneyRangeText(listingPriceFrom, listingPriceTo),
        [listingPriceFrom, listingPriceTo]
    );

    const [proposedSum, setProposedSum] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState([newReq()]);
    const [contractTerms, setContractTerms] = useState(defaultContractTerms());
    const [contractTermsPreset, setContractTermsPreset] = useState("custom");

    useEffect(() => {
        if (open) {
            setProposedSum("");
            setDescription("");
            setRequirements([newReq()]);
            setContractTerms(defaultContractTerms());
            setContractTermsPreset("custom");
        }
    }, [open]);

    const addRequirement = () => setRequirements((prev) => [...prev, newReq()]);
    const removeRequirement = (idx) =>
        setRequirements((prev) => prev.filter((_, i) => i !== idx));

    const setReqField = (idx, field, value) => {
        setRequirements((prev) =>
            prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
        );
    };

    const setContractTermField = (field, value) => {
        setContractTerms((prev) => ({ ...prev, [field]: value }));
        setContractTermsPreset("custom");
    };

    const applyContractTermsPreset = (preset) => {
        setContractTermsPreset(preset);

        if (preset === "legacy") {
            setContractTerms(legacyContractTermsPreset());
            return;
        }

        if (preset === "empty") {
            setContractTerms(defaultContractTerms());
            return;
        }
    };

    const handleSubmit = () => {
        const payload = {
            fkListingId: Number(listingId),
            proposedSum: proposedSum === "" ? null : Number(proposedSum),
            description,
            contractTerms: {
                fragmentSpeedMinScore: Number(contractTerms.fragmentSpeedMinScore),
                fragmentSpeedRefundPercent: Number(contractTerms.fragmentSpeedRefundPercent),
                revisionCountMaxAverage: Number(contractTerms.revisionCountMaxAverage),
                revisionCountRefundPercent: Number(contractTerms.revisionCountRefundPercent),
                contractSpeedMinScore: Number(contractTerms.contractSpeedMinScore),
                contractSpeedRefundPercent: Number(contractTerms.contractSpeedRefundPercent),
                messageResponseMinScore: Number(contractTerms.messageResponseMinScore),
                messageResponseRefundPercent: Number(contractTerms.messageResponseRefundPercent),
                rejectedFragmentsMaxCount: Number(contractTerms.rejectedFragmentsMaxCount),
                rejectedFragmentsRefundPercent: Number(contractTerms.rejectedFragmentsRefundPercent),
            },
            requirements: requirements.map((r) => ({
                description: r.description,
                forseenCompletionDate: r.forseenCompletionDate || null,
                file: r.file || null,
            })),
        };

        onSubmit?.(payload);
        onClose?.();
    };

    const canSubmit =
        listingId != null &&
        description.trim().length > 0 &&
        requirements.every((r) => r.description.trim().length > 0);

    const contractTermRows = [
        {
            key: "revisionCount",
            title: "Fragment resubmission limit",
            description: "How many times the same fragment can be submitted before the payout is penalized.",
            limitField: "revisionCountMaxAverage",
            limitLabel: "Max submissions",
            limitProps: { min: 1, step: "1" },
            refundField: "revisionCountRefundPercent",
        },
        {
            key: "lateDelivery",
            title: "Late delivery refund",
            description: "Refund applied if the provider delivers after the agreed requirement or final contract deadline.",
            limitField: "contractSpeedMinScore",
            limitLabel: "Rule",
            limitProps: { min: 0, max: 2, step: "0.01" },
            refundField: "contractSpeedRefundPercent",
        },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Send inquiry</DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Box>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Suggested price per listing creator
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {suggestedText}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Your price"
                                value={proposedSum}
                                onChange={(e) => setProposedSum(e.target.value)}
                                fullWidth
                                type="number"
                                inputProps={{ min: 0, step: "0.01" }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                }}
                            />
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                (Later this can be shown in ETH)
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Write a short description..."
                            />
                        </Grid>
                    </Grid>

                    <Divider />

                    <Box>
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "center" }}
                            justifyContent="space-between"
                            sx={{ mb: 1.5 }}
                        >
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Contract terms
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.72 }}>
                                    Configure each rule and the refund percent applied if it is violated.
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.62, display: "block", mt: 0.4 }}>
                                    Message response remains a system rating metric and is not configurable here.
                                </Typography>
                            </Box>

                            <FormControl size="small" sx={{ minWidth: { xs: "100%", md: 260 } }}>
                                <InputLabel id="contract-terms-preset-label">Preset</InputLabel>
                                <Select
                                    labelId="contract-terms-preset-label"
                                    label="Preset"
                                    value={contractTermsPreset}
                                    onChange={(e) => applyContractTermsPreset(e.target.value)}
                                >
                                    <MenuItem value="custom">Custom</MenuItem>
                                    <MenuItem value="legacy">Legacy 50% rules</MenuItem>
                                    <MenuItem value="empty">Empty / no penalties</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <Box
                            sx={{
                                border: "1px solid rgba(15,23,42,0.12)",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <Grid
                                sx={{
                                    px: 2,
                                    py: 1.25,
                                    bgcolor: "rgba(15,23,42,0.04)",
                                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.3, display: "block" }}>
                                    Set each rule value and the refund percent for that category.
                                </Typography>
                            </Grid>

                            {contractTermRows.map((row, index) => (
                                <Box
                                    key={row.key}
                                    sx={{
                                        px: 2,
                                        py: 2,
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700, mb: 1.25 }}>
                                        {row.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.72, mb: 1.5 }}>
                                        {row.description}
                                    </Typography>

                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} md={6}>
                                            {row.key === "lateDelivery" ?
                                                (
                                                <TextField
                                                    label={row.limitLabel}
                                                    value="Applid when late "
                                                    fullWidth
                                                    size="small"
                                                    InputProps={{ readOnly: true }}
                                                />
                                            )
                                                :
                                                (
                                                <TextField
                                                    label={row.limitLabel}
                                                    value={contractTerms[row.limitField]}
                                                    onChange={(e) => setContractTermField(row.limitField, e.target.value)}
                                                    fullWidth
                                                    type="number"
                                                    inputProps={row.limitProps}
                                                    size="small"
                                                />
                                            )}
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Refund percent"
                                                value={contractTerms[row.refundField]}
                                                onChange={(e) => setContractTermField(row.refundField, e.target.value)}
                                                fullWidth
                                                type="number"
                                                size="small"
                                                inputProps={{ min: 0, max: 100, step: "0.01" }}
                                                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>

                                    {index !== contractTermRows.length - 1 && (
                                        <Divider sx={{ mt: 2, borderColor: "rgba(15,23,42,0.08)" }} />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Requirements
                        </Typography>

                        <Button onClick={addRequirement} startIcon={<AddIcon />}>
                            Add requirement
                        </Button>
                    </Box>

                    <Stack spacing={2}>
                        {requirements.map((req, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    border: "1px solid rgba(0,0,0,0.12)",
                                    borderRadius: 2,
                                    p: 2,
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        Requirement #{idx + 1}
                                    </Typography>

                                    <IconButton
                                        onClick={() => removeRequirement(idx)}
                                        disabled={requirements.length === 1}
                                        size="small"
                                        aria-label="remove requirement"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Requirement description"
                                            value={req.description}
                                            onChange={(e) => setReqField(idx, "description", e.target.value)}
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            placeholder="E.g. I want X, Y, Z..."
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            label="When you want it complete"
                                            type="date"
                                            value={req.forseenCompletionDate}
                                            onChange={(e) =>
                                                setReqField(idx, "forseenCompletionDate", e.target.value)
                                            }
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
                                            {req.file ? "File chosen" : "Upload file"}
                                            <input
                                                type="file"
                                                hidden
                                                onChange={(e) =>
                                                    setReqField(idx, "file", e.target.files?.[0] ?? null)
                                                }
                                            />
                                        </Button>

                                        {req.file && (
                                            <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.75 }}>
                                                {req.file.name}
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
                    {continueLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function CommentAvatar({ username, avatar }) {
    const [imageFailed, setImageFailed] = useState(false);
    const hasAvatar = !!avatar && !imageFailed;

    if (hasAvatar) {
        return (
            <Box
                component="img"
                src={avatar}
                alt={username}
                onError={() => setImageFailed(true)}
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flex: "0 0 auto",
                }}
            />
        );
    }

    return (
        <Box
            sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "#e5e7eb",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid",
                borderColor: "#d1d5db",
                flex: "0 0 auto",
            }}
        >
            <PersonRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
    );
}

export default function Listing() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [listing, setListing] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [activePhoto, setActivePhoto] = useState(null);

    const [openInquiry, setOpenInquiry] = useState(false);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr("");

                const l = await apiGet(`/api/BrowseListings/${id}`);
                if (!alive) return;
                setListing(normalizeListing(l));

                let p = [];
                try {
                    const ph = await apiGet(`/api/BrowseListings/${id}/photos`);
                    if (!alive) return;
                    p = normalizePhotos(ph?.items ?? ph?.data ?? ph);
                } catch {
                    p = [];
                }

                setPhotos(p);
                setActivePhoto(p?.[0]?.photoUrl ?? null);

                let c = [];
                try {
                    const commentsRes = await apiGet(`/api/comment/listing/${id}`);
                    if (!alive) return;
                    c = normalizeComments(commentsRes);
                } catch (e) {
                    console.error("Comments load failed:", e);
                    c = [];
                }

                setComments(c);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load listing");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    const primary = activePhoto ?? photos?.[0]?.photoUrl ?? null;
    const thumbs = photos.slice(0, 6);

    const priceText =
        listing?.priceFrom != null || listing?.priceTo != null
            ? `€ ${listing?.priceFrom ?? "-"} – ${listing?.priceTo ?? "-"}`
            : "Price not set";

    const onInquirySubmit = async (payload) => {
        try {
            const fd = new FormData();

            fd.append("FkListingId", String(payload.fkListingId));
            if (payload.proposedSum != null) fd.append("ProposedSum", String(payload.proposedSum));
            fd.append("Description", payload.description ?? "");
            fd.append("ContractTerms.FragmentSpeedMinScore", String(payload.contractTerms.fragmentSpeedMinScore));
            fd.append("ContractTerms.FragmentSpeedRefundPercent", String(payload.contractTerms.fragmentSpeedRefundPercent));
            fd.append("ContractTerms.RevisionCountMaxAverage", String(payload.contractTerms.revisionCountMaxAverage));
            fd.append("ContractTerms.RevisionCountRefundPercent", String(payload.contractTerms.revisionCountRefundPercent));
            fd.append("ContractTerms.ContractSpeedMinScore", String(payload.contractTerms.contractSpeedMinScore));
            fd.append("ContractTerms.ContractSpeedRefundPercent", String(payload.contractTerms.contractSpeedRefundPercent));
            fd.append("ContractTerms.MessageResponseMinScore", String(payload.contractTerms.messageResponseMinScore));
            fd.append("ContractTerms.MessageResponseRefundPercent", String(payload.contractTerms.messageResponseRefundPercent));
            fd.append("ContractTerms.RejectedFragmentsMaxCount", String(payload.contractTerms.rejectedFragmentsMaxCount));
            fd.append("ContractTerms.RejectedFragmentsRefundPercent", String(payload.contractTerms.rejectedFragmentsRefundPercent));

            (payload.requirements || []).forEach((r, i) => {
                fd.append(`Requirements[${i}].Description`, r.description ?? "");

                if (r.forseenCompletionDate) {
                    fd.append(`Requirements[${i}].ForseenCompletionDate`, r.forseenCompletionDate);
                }

                if (r.file) {
                    fd.append(`Requirements[${i}].File`, r.file);
                }
            });

            const res = await apiPostFormData("/api/Inquiries", fd);
            console.log("Created inquiry:", res);
            alert("Inquiry sent!");
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to send inquiry");
        }
    };

    return (
        <Container maxWidth={false} disableGutters sx={{ py: 4, width: "100%" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Box sx={{ width: "100%", maxWidth: 1000, px: 2 }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : err ? (
                        <Paper sx={{ p: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                Error
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                                {err}
                            </Typography>
                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </Button>
                        </Paper>
                    ) : !listing ? (
                        <Paper sx={{ p: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                                Listing not found
                            </Typography>
                            <Button
                                sx={{ mt: 2 }}
                                variant="contained"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </Button>
                        </Paper>
                    ) : (
                        <>
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Typography variant="h5" sx={{ fontWeight: 950, lineHeight: 1.15 }}>
                                    {listing.title}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    {listing.categoryId != null ? (
                                        <Chip size="small" label={`Category #${listing.categoryId}`} />
                                    ) : null}

                                    {listing.completionTime ? (
                                        <Chip size="small" variant="outlined" label={`⏱ ${listing.completionTime}`} />
                                    ) : null}

                                    {(listing.priceFrom != null || listing.priceTo != null) && (
                                        <Chip size="small" variant="outlined" label={priceText} />
                                    )}
                                </Stack>
                            </Stack>

                            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                                <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                                    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                borderRadius: 3,
                                                overflow: "hidden",
                                                border: "1px solid",
                                                borderColor: "divider",
                                                bgcolor: "background.default",
                                                position: "relative",
                                                height: 520,
                                            }}
                                        >
                                            {primary ? (
                                                <Box
                                                    component="img"
                                                    src={primary}
                                                    alt="listing"
                                                    sx={{
                                                        position: "absolute",
                                                        inset: 0,
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block",
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        height: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    <Typography variant="body2">No photos yet</Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ mt: 1.5, height: 105 }}>
                                            {thumbs.length > 1 ? (
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{
                                                        height: "100%",
                                                        flexWrap: "nowrap",
                                                        overflowX: "auto",
                                                        pb: 0.5,
                                                    }}
                                                >
                                                    {thumbs.map((p) => {
                                                        const isActive =
                                                            (activePhoto ?? photos?.[0]?.photoUrl) === p.photoUrl;
                                                        return (
                                                            <Box
                                                                key={p.photoId}
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => setActivePhoto(p.photoUrl)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" || e.key === " ")
                                                                        setActivePhoto(p.photoUrl);
                                                                }}
                                                                sx={{
                                                                    width: 150,
                                                                    height: 95,
                                                                    flex: "0 0 auto",
                                                                    borderRadius: 2,
                                                                    overflow: "hidden",
                                                                    border: "2px solid",
                                                                    borderColor: isActive ? "primary.main" : "divider",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <Box
                                                                    component="img"
                                                                    src={p.photoUrl}
                                                                    alt="thumb"
                                                                    sx={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        display: "block",
                                                                    }}
                                                                />
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            ) : null}
                                        </Box>

                                        <Divider sx={{ my: 2.5 }} />

                                        <Typography variant="h6" sx={{ fontWeight: 950, mb: 1 }}>
                                            About this listing
                                        </Typography>

                                        {listing.description ? (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    whiteSpace: "pre-wrap",
                                                    lineHeight: 1.7,
                                                    opacity: 0.92,
                                                }}
                                            >
                                                {listing.description}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                No description provided.
                                            </Typography>
                                        )}
                                    </Paper>
                                </Box>

                                <Box
                                    sx={{
                                        width: 320,
                                        flex: "0 0 320px",
                                        position: "sticky",
                                        top: 88,
                                        alignSelf: "flex-start",
                                    }}
                                >
                                    <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                                        <Typography variant="overline" sx={{ opacity: 0.75 }}>
                                            Price range
                                        </Typography>

                                        <Typography variant="h5" sx={{ fontWeight: 950, mt: 0.5 }}>
                                            {priceText}
                                        </Typography>

                                        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                                            Completion time: <b>{listing.completionTime || "-"}</b>
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />

                                        <Stack spacing={1.2}>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                sx={{ fontWeight: 900, borderRadius: 2 }}
                                                onClick={() => setOpenInquiry(true)}
                                            >
                                                Send Inquiry
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                size="large"
                                                sx={{ fontWeight: 800, borderRadius: 2 }}
                                                onClick={() => navigate(-1)}
                                            >
                                                Back
                                            </Button>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 0.8 }}>
                                            Summary
                                        </Typography>

                                        <Stack spacing={0.6} sx={{ opacity: 0.9 }}>
                                            <Typography variant="body2">
                                                • Category: {listing.categoryId ?? "-"}
                                            </Typography>
                                            <Typography variant="body2">
                                                • Delivery: {listing.completionTime || "-"}
                                            </Typography>
                                            <Typography variant="body2">• Photos: {photos.length}</Typography>
                                            <Typography variant="body2">• Comments: {comments.length}</Typography>
                                        </Stack>
                                    </Paper>
                                </Box>
                            </Box>

                            <Paper sx={{ mt: 4, p: 2.5, borderRadius: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>
                                    Comments
                                </Typography>

                                {comments.length === 0 ? (
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                        No comments yet.
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {comments.map((c) => (
                                            <Paper
                                                key={c.commentId}
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                                    <CommentAvatar
                                                        username={c.username}
                                                        avatar={c.avatar}
                                                    />

                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            alignItems="center"
                                                            flexWrap="wrap"
                                                            sx={{ mb: 0.5 }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ fontWeight: 800 }}
                                                            >
                                                                {c.username}
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                sx={{ opacity: 0.65 }}
                                                            >
                                                                {formatDate(c.createdAt)}
                                                            </Typography>
                                                        </Stack>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                whiteSpace: "pre-wrap",
                                                                lineHeight: 1.7,
                                                                opacity: 0.92,
                                                            }}
                                                        >
                                                            {c.commentText || "—"}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>

                            <InquiryModal
                                open={openInquiry}
                                onClose={() => setOpenInquiry(false)}
                                onSubmit={onInquirySubmit}
                                listingId={id}
                                listingPriceFrom={listing.priceFrom}
                                listingPriceTo={listing.priceTo}
                                continueLabel="Continue"
                            />
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
}
