import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
    Autocomplete,
    Divider,
    Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useNavigate } from "react-router-dom";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

export default function AddListing() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const API_BASE = "https://localhost:7278";

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const [title, setTitle] = useState("");
    const [priceFrom, setPriceFrom] = useState("");
    const [priceTo, setPriceTo] = useState("");
    const [completionTime, setCompletionTime] = useState("");
    const [description, setDescription] = useState("");

    // photos (local before upload)
    // { id, file, previewUrl, isPrimary }
    const [photos, setPhotos] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/categories`, {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
                });
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setCategories([]);
            }
        };
        fetchCategories();
    }, [API_BASE, token]);

    const onPickPhotos = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setPhotos((prev) => {
            const next = [...prev];

            for (const f of files) {
                // basic type check
                if (!f.type?.startsWith("image/")) continue;

                const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
                next.push({
                    id,
                    file: f,
                    previewUrl: URL.createObjectURL(f),
                    isPrimary: false
                });
            }

            if (!next.some((p) => p.isPrimary) && next.length > 0) {
                next[0].isPrimary = true;
            }

            return next;
        });

        e.target.value = "";
    };

    const setPrimary = (id) => {
        setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })));
    };

    const removePhoto = (id) => {
        setPhotos((prev) => {
            const removed = prev.find((p) => p.id === id);
            if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);

            const next = prev.filter((p) => p.id !== id);

            // jei ištrynė primary — padarom pirmą likusį primary
            if (next.length > 0 && !next.some((p) => p.isPrimary)) {
                next[0] = { ...next[0], isPrimary: true };
            }
            return next;
        });
    };

    // upload photos after listing created
    const uploadPhotos = async (listingId) => {
        if (!photos.length) return;

        const primary = photos.find((p) => p.isPrimary);
        const fd = new FormData();

        photos.forEach((p) => fd.append("Files", p.file));
        fd.append("PrimaryIndex", String(Math.max(0, photos.findIndex((p) => p.id === primary?.id))));

        const res = await fetch(`${API_BASE}/api/listings/${listingId}/photos`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: fd
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`Photo upload failed: ${res.status} ${txt}`);
        }
    };

    const onSave = async () => {
        if (!token) return navigate("/login");

        if (!selectedCategory) {
            alert("Please choose a category.");
            return;
        }

        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }

        const payload = {
            categoryId: selectedCategory.categoryId,
            title,
            priceFrom: Number(priceFrom || 0),
            priceTo: Number(priceTo || 0),
            completionTime,
            description
        };

        try {
            setSaving(true);

            const res = await fetch(`${API_BASE}/api/listings/addListing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                alert(`Error: ${res.status} ${txt}`);
                return;
            }

            const created = await res.json();
            const listingId = created?.listingId ?? created?.listingID ?? created?.id;

            if (!listingId) {
                throw new Error("No listingId returned from backend.");
            }

            await uploadPhotos(listingId);

            navigate("/my-listings");
        } catch (e) {
            console.error(e);
            alert(`Couldn't save': ${e.message || e}`);
        } finally {
            setSaving(false);
        }
    };

    const primaryPhoto = photos.find((p) => p.isPrimary) ?? null;

    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Create listing"
                    title="Publish a new service offer."
                    subtitle="Add visuals, pricing, delivery time, and a clear description so your listing looks ready for a professional marketplace."
                />
            }
        >

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <SectionCard title="Photos" subtitle="Upload multiple images and choose one primary preview.">
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                            Media
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
                                    src={primaryPhoto?.previewUrl || ""}
                                    sx={{ width: 72, height: 72, bgcolor: "grey.100" }}
                                >
                                    <AddPhotoAlternateIcon />
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Button variant="outlined" component="label" fullWidth disabled={saving}>
                                        Upload photos
                                        <input hidden multiple type="file" accept="image/*" onChange={onPickPhotos} />
                                    </Button>
                                    <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
                                        Supported JPG/PNG/WebP
                                    </Typography>
                                </Box>
                            </Box>

                            {photos.length === 0 ? (
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            No photos added
                                </Typography>
                            ) : (
                                <>
                                    <Divider />
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, 1fr)",
                                            gap: 1
                                        }}
                                    >
                                        {photos.map((p) => (
                                            <Box
                                                key={p.id}
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
                                                    src={p.previewUrl}
                                                    alt="preview"
                                                    sx={{ width: "100%", height: 86, objectFit: "cover", display: "block" }}
                                                />

                                                {p.isPrimary ? (
                                                    <Chip
                                                        size="small"
                                                        label="Primary"
                                                        color="primary"
                                                        sx={{ position: "absolute", top: 6, left: 6 }}
                                                    />
                                                ) : null}

                                                <Box sx={{ position: "absolute", bottom: 4, right: 4, display: "flex", gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setPrimary(p.id)}
                                                        sx={{ bgcolor: "rgba(255,255,255,0.85)" }}
                                                        title="Set primary"
                                                    >
                                                        {p.isPrimary ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                                    </IconButton>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removePhoto(p.id)}
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
                            )}
                        </Stack>
                    </SectionCard>
                </Grid>

                <Grid item xs={12} md={8}>
                    <SectionCard title="Listing details" subtitle="Describe the service, define your category, and set the expected budget and delivery time.">
                        <Stack spacing={2}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={saving}
                            />

                            <Autocomplete
                                options={categories}
                                getOptionLabel={(option) => option?.title ?? ""}
                                isOptionEqualToValue={(option, value) => option?.categoryId === value?.categoryId}
                                value={selectedCategory}
                                onChange={(event, newValue) => setSelectedCategory(newValue)}
                                renderInput={(params) => <TextField {...params} label="Category" />}
                                disabled={saving}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price from (€)"
                                        type="number"
                                        fullWidth
                                        value={priceFrom}
                                        onChange={(e) => setPriceFrom(e.target.value)}
                                        disabled={saving}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price to (€)"
                                        type="number"
                                        fullWidth
                                        value={priceTo}
                                        onChange={(e) => setPriceTo(e.target.value)}
                                        disabled={saving}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                label="Job completion time"
                                fullWidth
                                value={completionTime}
                                onChange={(e) => setCompletionTime(e.target.value)}
                                disabled={saving}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                minRows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={saving}
                            />

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button variant="text" onClick={() => navigate("/my-listings")} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button variant="contained" onClick={onSave} disabled={saving}>
                                    Save
                                </Button>
                            </Stack>
                        </Stack>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageShell>
    );
}
