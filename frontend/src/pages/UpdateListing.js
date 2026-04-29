import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    IconButton,
    Stack,
    TextField,
    Typography,
    Autocomplete,
    Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDialog } from "../components/AppDialogProvider";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

const API_URL = "https://localhost:7278";

export default function UpdateListing() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dialog = useAppDialog();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [title, setTitle] = useState("");
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [completionTime, setCompletionTime] = useState("");
    const [description, setDescription] = useState("");

    // existing photos from backend: { photoId, photoUrl, isPrimary, uploadTime }
    const [photos, setPhotos] = useState([]);
    // new photos local: { id, file, previewUrl, isPrimary }
    const [newPhotos, setNewPhotos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // fetch categories + listing + photos
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        let alive = true;

        (async () => {
            try {
                setLoading(true);

                // categories
                const catRes = await fetch(`${API_URL}/api/categories`, { headers: authHeaders });
                const catData = await catRes.json().catch(() => []);
                const cats = Array.isArray(catData) ? catData : [];
                if (!alive) return;
                setCategories(cats);

                // listing
                const res = await fetch(`${API_URL}/api/listings/${id}`, { headers: authHeaders });
                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    await dialog.alert({ variant: "error", title: "Listing load failed", message: `Failed to load listing: ${res.status} ${txt}` });
                    navigate("/my-listings");
                    return;
                }

                const data = await res.json();
                if (!alive) return;

                setTitle(data.title ?? "");
                setPriceFrom(data.priceFrom ?? "");
                setPriceTo(data.priceTo ?? "");
                setCompletionTime(data.completionTime ?? "");
                setDescription(data.description ?? "");

                const cid = data.categoryId;
                const match = cats.find((c) => (c.categoryId ?? c.CategoryId) === cid);
                setSelectedCategory(match ?? null);

                // photos
                const pRes = await fetch(`${API_URL}/api/listings/${id}/photos`, { headers: authHeaders });
                if (pRes.ok) {
                    const pData = await pRes.json().catch(() => []);
                    if (!alive) return;
                    setPhotos(Array.isArray(pData) ? pData : []);
                } else {
                    if (!alive) return;
                    setPhotos([]);
                }

                setLoading(false);
            } catch (e) {
                console.error(e);
                await dialog.alert({ variant: "error", title: "Listing load failed", message: "Error while loading listing data." });
                navigate("/my-listings");
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, navigate, token]);

    // ---------- PHOTO: NEW (LOCAL) ----------
    const onPickNewPhotos = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setNewPhotos((prev) => {
            const next = [...prev];

            for (const f of files) {
                if (!f.type?.startsWith("image/")) continue;
                const tmpId = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
                next.push({
                    id: tmpId,
                    file: f,
                    previewUrl: URL.createObjectURL(f),
                    isPrimary: false
                });
            }

            if (!next.some((p) => p.isPrimary) && next.length > 0) next[0].isPrimary = true;
            return next;
        });

        e.target.value = "";
    };

    const setNewPrimary = (tmpId) => {
        setNewPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === tmpId })));
    };

    const removeNewPhoto = (tmpId) => {
        setNewPhotos((prev) => {
            const removed = prev.find((p) => p.id === tmpId);
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);

            const next = prev.filter((p) => p.id !== tmpId);
            if (next.length > 0 && !next.some((p) => p.isPrimary)) {
                next[0] = { ...next[0], isPrimary: true };
            }
            return next;
        });
    };

    const refreshPhotos = async () => {
        const pRes = await fetch(`${API_URL}/api/listings/${id}/photos`, { headers: authHeaders });
        if (pRes.ok) {
            const pData = await pRes.json().catch(() => []);
            setPhotos(Array.isArray(pData) ? pData : []);
        }
    };

    const uploadNewPhotos = async () => {
        if (!newPhotos.length) return;

        const primary = newPhotos.find((p) => p.isPrimary);
        const primaryIndex = Math.max(0, newPhotos.findIndex((p) => p.id === primary?.id));

        const fd = new FormData();
        newPhotos.forEach((p) => fd.append("Files", p.file));
        fd.append("PrimaryIndex", String(primaryIndex));

        const res = await fetch(`${API_URL}/api/listings/${id}/photos`, {
            method: "POST",
            headers: authHeaders,
            body: fd
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Photo upload failed: ${res.status} ${txt}`);
        }

        await res.json().catch(() => []);
        await refreshPhotos();

        newPhotos.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
        setNewPhotos([]);
    };

    const setPrimaryExisting = async (photoId) => {
        try {
            const res = await fetch(`${API_URL}/api/listings/${id}/photos/${photoId}/primary`, {
                method: "PUT",
                headers: authHeaders
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                await dialog.alert({ variant: "error", title: "Primary photo update failed", message: `Error: ${res.status} ${txt}` });
                return;
            }
            await refreshPhotos();
        } catch {
            await dialog.alert({ variant: "error", title: "Primary photo update failed", message: "Server error setting primary" });
        }
    };

    const deleteExisting = async (photoId) => {
        const ok = await dialog.confirm({
            title: "Delete this photo?",
            message: "This action cannot be undone.",
            confirmText: "Delete"
        });
        if (!ok) return;

        try {
            const res = await fetch(`${API_URL}/api/listings/${id}/photos/${photoId}`, {
                method: "DELETE",
                headers: authHeaders
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                await dialog.alert({ variant: "error", title: "Photo delete failed", message: `Error: ${res.status} ${txt}` });
                return;
            }
            await refreshPhotos();
        } catch {
            await dialog.alert({ variant: "error", title: "Photo delete failed", message: "Server error deleting photo" });
        }
    };

    const primaryExisting = photos.find((p) => p.isPrimary) ?? null;

    // ---------- SAVE LISTING ----------
    const onSave = async () => {
        if (!token) return navigate("/login");
        if (!selectedCategory) {
            await dialog.alert({ variant: "warning", title: "Category required", message: "Choose category" });
            return;
        }

        const categoryId = selectedCategory.categoryId ?? selectedCategory.CategoryId;

        const payload = {
            categoryId,
            title,
            priceFrom: Number(priceFrom || 0),
            priceTo: Number(priceTo || 0),
            completionTime,
            description
        };

        try {
            setSaving(true);

            const res = await fetch(`${API_URL}/api/listings/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                await dialog.alert({ variant: "error", title: "Listing update failed", message: `Error: ${res.status} ${txt}` });
                return;
            }

            if (newPhotos.length) await uploadNewPhotos();

            navigate("/my-listings");
        } catch (e) {
            console.error(e);
            await dialog.alert({ variant: "error", title: "Listing update failed", message: `Couldn't save: ${e.message || e}` });
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Update listing"
                    title="Keep your service offer polished."
                    subtitle="Update the content, refresh your images, and maintain a stronger marketplace presentation."
                />
            }
        >
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                    flexDirection: { xs: "column", md: "row" }
                }}
            >
                <Box sx={{ flex: "0 0 360px", width: { xs: "100%", md: 360 } }}>
                    <SectionCard title="Photos" subtitle="Manage existing images and upload fresh preview content.">
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                            Photos
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                            Choose primary photo, may also add multiple photos
                        </Typography>

                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    border: "1px dashed",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2
                                }}
                            >
                                <Avatar
                                    variant="rounded"
                                    src={primaryExisting?.photoUrl || ""}
                                    sx={{ width: 72, height: 72, bgcolor: "grey.100" }}
                                >
                                    <AddPhotoAlternateIcon />
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Button variant="outlined" component="label" fullWidth disabled={saving || loading}>
                                        Upload new photos
                                        <input hidden multiple type="file" accept="image/*" onChange={onPickNewPhotos} />
                                    </Button>
                                    <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
                                        Supported formats - JPG/PNG/WebP
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Existing photos */}
                            {photos.length > 0 ? (
                                <>
                                    <Divider />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        Existing
                                    </Typography>

                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                                        {photos.map((p) => (
                                            <Box
                                                key={p.photoId}
                                                sx={{
                                                    position: "relative",
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: p.isPrimary ? "primary.main" : "divider"
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={p.photoUrl}
                                                    alt="photo"
                                                    sx={{ width: "100%", height: 86, objectFit: "cover", display: "block" }}
                                                />

                                                {p.isPrimary ? (
                                                    <Chip size="small" label="Primary" color="primary" sx={{ position: "absolute", top: 6, left: 6 }} />
                                                ) : null}

                                                <Box sx={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setPrimaryExisting(p.photoId)}
                                                        sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                                                        title="Set primary"
                                                    >
                                                        {p.isPrimary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                    </IconButton>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => deleteExisting(p.photoId)}
                                                        sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                                                        title="Delete"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    No photos added
                                </Typography>
                            )}

                            {/* New photos (local) */}
                            {newPhotos.length > 0 ? (
                                <>
                                    <Divider />
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            New (not uploaded yet)
                                        </Typography>
                                        <Button size="small" variant="contained" onClick={uploadNewPhotos} disabled={saving || loading}>
                                            Upload now
                                        </Button>
                                    </Stack>

                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                                        {newPhotos.map((p) => (
                                            <Box
                                                key={p.id}
                                                sx={{
                                                    position: "relative",
                                                    borderRadius: 2,
                                                    overflow: "hidden",
                                                    border: "1px solid",
                                                    borderColor: p.isPrimary ? "success.main" : "divider"
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={p.previewUrl}
                                                    alt="preview"
                                                    sx={{ width: "100%", height: 86, objectFit: "cover", display: "block" }}
                                                />

                                                {p.isPrimary ? (
                                                    <Chip size="small" label="Primary" color="success" sx={{ position: "absolute", top: 6, left: 6 }} />
                                                ) : null}

                                                <Box sx={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setNewPrimary(p.id)}
                                                        sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                                                        title="Set primary (new)"
                                                    >
                                                        {p.isPrimary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                    </IconButton>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeNewPhoto(p.id)}
                                                        sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                                                        title="Remove"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            ) : null}
                        </Stack>
                    </SectionCard>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                    <SectionCard title="Listing details" subtitle="Edit pricing, timing, category, and the main service description.">
                        <Stack spacing={2}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading || saving}
                            />

                            <Autocomplete
                                options={categories}
                                getOptionLabel={(option) => option?.title ?? option?.Title ?? ""}
                                isOptionEqualToValue={(option, value) =>
                                    (option?.categoryId ?? option?.CategoryId) === (value?.categoryId ?? value?.CategoryId)
                                }
                                value={selectedCategory}
                                onChange={(event, newValue) => setSelectedCategory(newValue)}
                                renderInput={(params) => <TextField {...params} label="Category" />}
                                disabled={loading || saving}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price from (ETH)"
                                        type="number"
                                        fullWidth
                                        value={priceFrom}
                                        onChange={(e) => setPriceFrom(e.target.value)}
                                        disabled={loading || saving}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price to (ETH)"
                                        type="number"
                                        fullWidth
                                        value={priceTo}
                                        onChange={(e) => setPriceTo(e.target.value)}
                                        disabled={loading || saving}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                label="Job completion time"
                                fullWidth
                                value={completionTime}
                                onChange={(e) => setCompletionTime(e.target.value)}
                                disabled={loading || saving}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                minRows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading || saving}
                            />

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button variant="text" onClick={() => navigate("/my-listings")} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button variant="contained" color="success" onClick={onSave} disabled={saving || loading}>
                                    Save changes
                                </Button>
                            </Stack>
                        </Stack>
                    </SectionCard>
                </Box>
            </Box>
        </PageShell>
    );
}
