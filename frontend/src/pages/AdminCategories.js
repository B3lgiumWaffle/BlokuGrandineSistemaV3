import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import { apiDelete, apiGet, apiPostJson } from "../api/api";
import { useAppDialog } from "../components/AppDialogProvider";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

export default function AdminCategories() {
    const navigate = useNavigate();
    const dialog = useAppDialog();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const reloadCategories = async () => {
        const data = await apiGet("/api/categories");
        setCategories(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");
                const data = await apiGet("/api/categories");
                if (!alive) return;
                setCategories(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!alive) return;
                setError(e?.message ?? "Failed to load categories.");
                setCategories([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, token]);

    const handleAdd = async () => {
        if (!title.trim()) {
            await dialog.alert({
                variant: "warning",
                title: "Title required",
                message: "Please enter category title."
            });
            return;
        }

        const confirmed = await dialog.confirm({
            title: "Confirm add",
            message: "Do you really want to add this category?",
            confirmText: "Add"
        });

        if (!confirmed) return;

        try {
            setSaving(true);
            setError("");

            await apiPostJson("/api/categories", {
                title: title.trim(),
                description: description.trim() || null
            });

            setTitle("");
            setDescription("");
            await reloadCategories();

            await dialog.alert({
                variant: "success",
                title: "Category added",
                message: "The category was added successfully."
            });
        } catch (e) {
            setError(e?.message ?? "Failed to add category.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = await dialog.confirm({
            title: "Confirm delete",
            message: `Do you really want to delete "${category.title}"?\n\nListings from this category will be moved to No category.`,
            confirmText: "Delete"
        });

        if (!confirmed) return;

        try {
            setDeletingId(category.categoryId);
            setError("");

            await apiDelete(`/api/categories/${category.categoryId}`);
            await reloadCategories();
        } catch (e) {
            setError(e?.message ?? "Failed to delete category.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <PageShell
            maxWidth="lg"
            compact
            hero={
                <PageHero
                    eyebrow="Admin"
                    title="Manage system categories."
                    subtitle="Add new categories for listings and safely remove old ones. Deleted category listings are reassigned to No category."
                />
            }
        >
            <Stack spacing={3}>
                <SectionCard
                    title="Add category"
                    subtitle="Create a simple category for the marketplace."
                    action={
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    }
                >
                    <Stack spacing={2}>
                        <TextField
                            label="Category title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={saving}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={saving}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <Stack direction="row" justifyContent="flex-end">
                            <Button variant="contained" onClick={handleAdd} disabled={saving}>
                                {saving ? "Adding..." : "Add category"}
                            </Button>
                        </Stack>
                    </Stack>
                </SectionCard>

                <SectionCard
                    title="All categories"
                    subtitle="Visible categories currently used in the system."
                >
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : categories.length === 0 ? (
                        <Typography sx={{ color: "text.secondary" }}>
                            No categories found.
                        </Typography>
                    ) : (
                        <Stack spacing={1.5}>
                            {categories.map((category) => {
                                const isDeleting = deletingId === category.categoryId;
                                const isFallback = (category.title ?? "").trim().toLowerCase() === "no category";

                                return (
                                    <Box
                                        key={category.categoryId}
                                        sx={{
                                            p: 2,
                                            border: "1px solid rgba(15, 23, 42, 0.08)",
                                            bgcolor: "white",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: 2
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 900 }}>
                                                {category.title}
                                            </Typography>
                                            <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                                                {category.description || "No description"}
                                            </Typography>
                                        </Box>

                                        <IconButton
                                            color="error"
                                            disabled={isDeleting || isFallback}
                                            onClick={() => handleDelete(category)}
                                        >
                                            <DeleteOutlineIcon />
                                        </IconButton>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}

                    {error ? (
                        <Typography sx={{ mt: 2, color: "error.main", fontWeight: 700 }}>
                            {error}
                        </Typography>
                    ) : null}
                </SectionCard>
            </Stack>
        </PageShell>
    );
}
