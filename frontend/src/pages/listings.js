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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
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
    if (priceFrom != null) return `Nuo €${priceFrom}`;
    if (priceTo != null) return `Iki €${priceTo}`;
    return "Nenurodyta";
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

    useEffect(() => {
        if (open) {
            setProposedSum("");
            setDescription("");
            setRequirements([newReq()]);
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

    const handleSubmit = () => {
        const payload = {
            fkListingId: Number(listingId),
            proposedSum: proposedSum === "" ? null : Number(proposedSum),
            description,
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
                                (Vėliau čia bus ETH)
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
    const firstLetter = (username ?? "U").trim().charAt(0).toUpperCase() || "U";

    if (avatar) {
        return (
            <Box
                component="img"
                src={avatar}
                alt={username}
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
                bgcolor: "#111827",
                color: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                flex: "0 0 auto",
            }}
        >
            {firstLetter}
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