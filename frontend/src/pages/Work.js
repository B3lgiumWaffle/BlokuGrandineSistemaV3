import { useEffect, useMemo, useState } from "react";
import {
    Avatar, Box, Button, Card, CardActionArea, CardContent, Chip, Container, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Skeleton, Stack, TextField, Typography
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CurrencyExchangeRoundedIcon from "@mui/icons-material/CurrencyExchangeRounded";
import DatasetLinkedRoundedIcon from "@mui/icons-material/DatasetLinkedRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useNavigate } from "react-router-dom";
import { formatEth } from "../utils/currency";

const API_URL = "https://localhost:7278";
const trustPoints = [
    { icon: <ShieldRoundedIcon sx={{ fontSize: 20 }} />, title: "Clearer agreements", text: "Listings, pricing, and timing are presented in a more trustworthy marketplace view." },
    { icon: <VerifiedRoundedIcon sx={{ fontSize: 20 }} />, title: "More professional discovery", text: "Clients can compare services faster through cleaner cards and stronger visual hierarchy." },
    { icon: <DatasetLinkedRoundedIcon sx={{ fontSize: 20 }} />, title: "Blockchain direction", text: "The page now better matches the platform idea instead of looking like a plain list." }
];

const eth = (v) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? formatEth(n, { maximumFractionDigits: 0 }) : "-";
};
const timeAgo = (v) => {
    if (!v) return "Recently added";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "Recently added";
    const h = Math.max(1, Math.round((Date.now() - d.getTime()) / 36e5));
    if (h < 24) return `${h}h ago`;
    const days = Math.round(h / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.round(days / 30)}mo ago`;
};
const pick = (items, sorter, limit = 4, filter = () => true) => [...items].filter(filter).sort(sorter).slice(0, limit);

function ListingImage({ src, alt, featured = false }) {
    const [imageFailed, setImageFailed] = useState(false);
    const hasImage = !!src && !imageFailed;

    if (hasImage) {
        return (
            <Box
                component="img"
                src={src}
                alt={alt}
                onError={() => setImageFailed(true)}
                sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                }}
            />
        );
    }

    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1,
                background: featured
                    ? "linear-gradient(135deg, #d9fbe8 0%, #bbf7d0 45%, #dcfce7 100%)"
                    : "linear-gradient(135deg, #e5f7ee 0%, #d1fae5 45%, #ecfdf5 100%)",
                color: "#14532d"
            }}
        >
            <Avatar
                sx={{
                    width: featured ? 72 : 60,
                    height: featured ? 72 : 60,
                    bgcolor: "rgba(20,83,45,0.10)",
                    color: "#166534"
                }}
            >
                <ImageRoundedIcon sx={{ fontSize: featured ? 34 : 28 }} />
            </Avatar>
            <Box sx={{ textAlign: "center", px: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: featured ? 16 : 14 }}>
                    No preview image
                </Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.8 }}>
                    This listing does not have uploaded photos yet.
                </Typography>
            </Box>
        </Box>
    );
}

function OwnerAvatar({ name, src }) {
    const [imageFailed, setImageFailed] = useState(false);
    const displayName = (name ?? "").trim();
    const initials = displayName
        ? displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("")
        : "";

    if (src && !imageFailed) {
        return (
            <Avatar
                src={src}
                alt={displayName || "Provider"}
                imgProps={{ onError: () => setImageFailed(true) }}
                sx={{ width: 34, height: 34 }}
            />
        );
    }

    return (
        <Avatar
            sx={{
                width: 34,
                height: 34,
                bgcolor: initials ? "#103d2b" : "#e5e7eb",
                color: initials ? "#f0fdf4" : "#6b7280",
                fontSize: 13,
                fontWeight: 800
            }}
        >
            {initials || <PersonRoundedIcon sx={{ fontSize: 18 }} />}
        </Avatar>
    );
}

function ListingCard({ item, navigate, categoryLabel, featured = false }) {
    const ownerName = item.ownerName || "Service provider";
    const mainMediaHeight = featured ? 260 : 220;
    const thumbMediaHeight = featured ? 81 : 68;

    return (
        <Card sx={{
            height: "100%", borderRadius: 0, overflow: "hidden", border: "1px solid rgba(15,23,42,0.08)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
            boxShadow: "0 20px 60px rgba(15,23,42,0.08)", transition: "0.25s ease",
            "&:hover": { transform: "translateY(-6px)", boxShadow: "0 26px 80px rgba(15,23,42,0.14)", borderColor: "rgba(27,186,120,0.28)" }
        }}>
            <CardActionArea onClick={() => navigate(`/listing/${item.listingId}`)} sx={{ height: "100%" }}>
                <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: item.thumbPhotoUrls?.length ? "1fr 84px" : "1fr", gap: 1, mb: 1.5 }}>
                        <Box
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: 0,
                                height: mainMediaHeight,
                                minHeight: mainMediaHeight,
                                maxHeight: mainMediaHeight,
                                bgcolor: "#dbe4df"
                            }}
                        >
                            <ListingImage
                                src={item.primaryPhotoUrl}
                                alt={item.title || "listing"}
                                featured={featured}
                            />
                            <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 12, left: 12, right: 12, justifyContent: "space-between", zIndex: 1 }}>
                                <Chip label={categoryLabel(item.categoryId)} sx={{ bgcolor: "rgba(255,255,255,0.88)", fontWeight: 700 }} />
                                <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />} label={timeAgo(item.uploadTime)} sx={{ bgcolor: "rgba(15,23,42,0.76)", color: "white", "& .MuiChip-icon": { color: "white" } }} />
                            </Stack>
                            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0.52) 100%)" }} />
                        </Box>
                        {item.thumbPhotoUrls?.length ? (
                            <Box sx={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: 1 }}>
                                {[0, 1, 2].map((idx) => item.thumbPhotoUrls[idx] ? (
                                    <Box
                                        key={idx}
                                        component="img"
                                        src={item.thumbPhotoUrls[idx]}
                                        alt={`thumb-${idx}`}
                                        sx={{
                                            width: "100%",
                                            height: thumbMediaHeight,
                                            minHeight: thumbMediaHeight,
                                            maxHeight: thumbMediaHeight,
                                            objectFit: "cover",
                                            borderRadius: 0,
                                            bgcolor: "#dbe4df",
                                            display: "block"
                                        }}
                                    />
                                ) : (
                                    <Box
                                        key={idx}
                                        sx={{
                                            height: thumbMediaHeight,
                                            minHeight: thumbMediaHeight,
                                            maxHeight: thumbMediaHeight,
                                            borderRadius: 0,
                                            bgcolor: "#e7ecea"
                                        }}
                                    />
                                ))}
                            </Box>
                        ) : null}
                    </Box>
                </Box>
                <CardContent sx={{ pt: 0, px: 2.25, pb: "20px !important" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <OwnerAvatar name={ownerName} src={item.ownerAvatarUrl} />
                            <Box>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                    {ownerName}
                                </Typography>
                                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Marketplace listing</Typography>
                            </Box>
                        </Stack>
                        <Chip size="small" label={Number(item.isActivated ?? 1) === 1 ? "Active" : "Pending review"} sx={{ fontWeight: 700, bgcolor: Number(item.isActivated ?? 1) === 1 ? "rgba(27,186,120,0.14)" : "rgba(245,158,11,0.14)", color: Number(item.isActivated ?? 1) === 1 ? "#0f8a57" : "#b45309" }} />
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 58 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 1.25, color: "text.secondary", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 64 }}>{item.description || "A clearly presented digital service offer for platform users."}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.75, rowGap: 1 }}>
                        <Chip size="small" icon={<CurrencyExchangeRoundedIcon sx={{ fontSize: 16 }} />} label={`From ${eth(item.priceFrom)}`} sx={{ bgcolor: "rgba(16,61,43,0.08)", fontWeight: 700 }} />
                        <Chip size="small" label={`Up to ${eth(item.priceTo)}`} sx={{ bgcolor: "rgba(15,23,42,0.06)", fontWeight: 700 }} />
                        {item.completionTime ? <Chip size="small" icon={<BoltRoundedIcon sx={{ fontSize: 16 }} />} label={item.completionTime} sx={{ bgcolor: "rgba(27,186,120,0.12)", fontWeight: 700 }} /> : null}
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

function Section({ title, subtitle, items, navigate, categoryLabel, featured = false }) {
    if (!items.length) return null;
    return (
        <Box sx={{ mt: { xs: 6, md: 8 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "flex-end" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>{title}</Typography>
                    <Typography sx={{ mt: 0.75, color: "text.secondary", maxWidth: 720 }}>{subtitle}</Typography>
                </Box>
                <Chip label={`${items.length} offers`} sx={{ fontWeight: 700, bgcolor: "rgba(16,61,43,0.08)", color: "#103d2b" }} />
            </Stack>
            <Grid container spacing={2.5}>
                {items.map((item) => (
                    <Grid item xs={12} md={featured ? 6 : 3} key={`${title}-${item.listingId}`}>
                        <ListingCard item={item} navigate={navigate} categoryLabel={categoryLabel} featured={featured} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default function Work() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);
    const categoryLabel = useMemo(() => {
        const categoryMap = new Map(
            categories.map((category) => [
                Number(category.categoryId ?? category.CategoryId),
                category.title ?? category.Title ?? "Digital Service"
            ])
        );

        return (id) => categoryMap.get(Number(id)) || "Digital Service";
    }, [categories]);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const [listingsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_URL}/api/listings`, { headers: { ...authHeaders } }),
                    fetch(`${API_URL}/api/categories`, { headers: { ...authHeaders } }),
                ]);

                if (!listingsRes.ok) {
                    const txt = await listingsRes.text().catch(() => "");
                    throw new Error(`${listingsRes.status} ${txt}`);
                }
                const listingsData = await listingsRes.json().catch(() => []);
                const categoriesData = categoriesRes.ok ? await categoriesRes.json().catch(() => []) : [];
                if (alive) {
                    setItems(Array.isArray(listingsData) ? listingsData : []);
                    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                }
            } catch (e) {
                console.error(e);
                if (alive) {
                    setItems([]);
                    setCategories([]);
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [authHeaders]);

    const activeItems = useMemo(() => items.filter((item) => Number(item.isActivated ?? 1) === 1), [items]);
    const normalizedSearch = searchText.trim().toLowerCase();
    const filteredItems = useMemo(() => activeItems.filter((item) => {
        const matchesCategory =
            selectedCategory === "all" ||
            String(item.categoryId ?? "") === String(selectedCategory);

        if (!matchesCategory) return false;
        if (!normalizedSearch) return true;

        const searchableText = [
            item.title,
            item.description,
            item.completionTime,
            item.ownerName,
            categoryLabel(item.categoryId)
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(normalizedSearch);
    }), [activeItems, categoryLabel, normalizedSearch, selectedCategory]);
    const stats = useMemo(() => {
        const averageBudget = activeItems.length ? Math.round(activeItems.reduce((sum, item) => sum + Number(item.priceTo ?? item.priceFrom ?? 0), 0) / activeItems.length) : 0;
        return [
            { label: "Active listings", value: activeItems.length || 0 },
            { label: "Categories", value: new Set(activeItems.map((item) => item.categoryId)).size || 0 },
            { label: "Average budget", value: averageBudget ? formatEth(averageBudget, { maximumFractionDigits: 0 }) : "-" }
        ];
    }, [activeItems]);
    const featuredListings = useMemo(() => pick(activeItems, (a, b) => Number(b.priceTo ?? b.priceFrom ?? 0) - Number(a.priceTo ?? a.priceFrom ?? 0), 2), [activeItems]);
    const freshListings = useMemo(() => pick(activeItems, (a, b) => new Date(b.uploadTime) - new Date(a.uploadTime), 4), [activeItems]);
    const budgetListings = useMemo(() => pick(activeItems, (a, b) => Number(a.priceFrom ?? a.priceTo ?? 0) - Number(b.priceFrom ?? b.priceTo ?? 0), 4), [activeItems]);
    const fastListings = useMemo(() => {
        const quick = pick(activeItems, (a, b) => Number(a.priceFrom ?? a.priceTo ?? 0) - Number(b.priceFrom ?? b.priceTo ?? 0), 4, (item) => /val|dien|24|48|week|sav/i.test(item.completionTime || ""));
        return quick.length ? quick : freshListings;
    }, [activeItems, freshListings]);
    const categorySpotlight = useMemo(() => Object.entries(activeItems.reduce((acc, item) => {
        const key = categoryLabel(item.categoryId);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 4), [activeItems, categoryLabel]);
    const hasActiveFilters = selectedCategory !== "all" || !!normalizedSearch;
    const selectedCategoryLabel = selectedCategory === "all"
        ? "All categories"
        : (categories.find((category) => String(category.categoryId ?? category.CategoryId) === String(selectedCategory))?.title
            ?? categories.find((category) => String(category.categoryId ?? category.CategoryId) === String(selectedCategory))?.Title
            ?? "Selected category");

    return (
        <Box sx={{ background: "radial-gradient(circle at top left, rgba(27,186,120,0.18) 0%, rgba(27,186,120,0) 28%), linear-gradient(180deg, #f4fbf7 0%, #ffffff 26%, #f8fafc 100%)", py: { xs: 4, md: 6 } }}>
            <Container maxWidth="xl">
                <Box sx={{ position: "relative", overflow: "hidden", borderRadius: 0, px: { xs: 3, md: 6 }, py: { xs: 4, md: 6 }, background: "linear-gradient(135deg, #103d2b 0%, #14532d 42%, #0f172a 100%)", color: "white", boxShadow: "0 30px 90px rgba(16,61,43,0.30)" }}>
                    <Box sx={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", top: -140, right: -80, bgcolor: "rgba(255,255,255,0.08)" }} />
                    <Box sx={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", bottom: -110, left: -70, bgcolor: "rgba(27,186,120,0.22)" }} />
                    <Grid container spacing={4} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                        <Grid item xs={12} md={7}>
                            <Chip icon={<DatasetLinkedRoundedIcon sx={{ color: "#0f172a !important" }} />} label="Freelance marketplace with a blockchain trust layer" sx={{ mb: 2.5, bgcolor: "#d9fbe8", color: "#0f172a", fontWeight: 800 }} />
                            <Typography sx={{ fontSize: { xs: 34, md: 58 }, lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.03em", maxWidth: 760 }}>
                                A work page that feels closer to a real service marketplace.
                            </Typography>
                            <Typography sx={{ mt: 2, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7, color: "rgba(255,255,255,0.78)", maxWidth: 680 }}>
                                A cleaner marketplace layout with stronger cards, category tags, pricing, delivery time, and a clearer blockchain-focused platform identity.
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3.5 }}>
                                <Button variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/my-listings/new")} sx={{ alignSelf: "flex-start", borderRadius: 0, px: 3, py: 1.4, bgcolor: "#1bba78", color: "#072414", fontWeight: 800, boxShadow: "none", "&:hover": { bgcolor: "#22c983", boxShadow: "none" } }}>Create listing</Button>
                                <Button variant="outlined" size="large" onClick={() => navigate("/about")} sx={{ alignSelf: "flex-start", borderRadius: 0, px: 3, py: 1.4, borderColor: "rgba(255,255,255,0.24)", color: "white", fontWeight: 700 }}>Learn more</Button>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}>
                                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#9fe7c1", mb: 2 }}>PLATFORM SNAPSHOT</Typography>
                                <Stack spacing={1.5}>
                                    {stats.map((stat) => (
                                        <Box key={stat.label} sx={{ p: 2, borderRadius: 0, bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{stat.label}</Typography>
                                            <Typography sx={{ mt: 0.5, fontSize: 30, fontWeight: 900 }}>{stat.value}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                                    {categorySpotlight.length ? categorySpotlight.map(([name, count]) => (
                                        <Stack key={name} direction="row" justifyContent="space-between" sx={{ px: 1.5, py: 1.25, borderRadius: 0, bgcolor: "rgba(255,255,255,0.05)" }}>
                                            <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>{name}</Typography>
                                            <Typography sx={{ fontWeight: 800 }}>{count}</Typography>
                                        </Stack>
                                    )) : <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>Top categories will appear here as more listings are added.</Typography>}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
                    {trustPoints.map((point) => (
                        <Grid item xs={12} md={4} key={point.title}>
                            <Box sx={{ height: "100%", p: 3, borderRadius: 0, bgcolor: "rgba(255,255,255,0.72)", border: "1px solid rgba(16,61,43,0.08)", boxShadow: "0 12px 40px rgba(15,23,42,0.05)" }}>
                                <Avatar sx={{ bgcolor: "#dcfce7", color: "#14532d", mb: 2 }}>{point.icon}</Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>{point.title}</Typography>
                                <Typography sx={{ mt: 1, color: "text.secondary", lineHeight: 1.7 }}>{point.text}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                <Box
                    sx={{
                        mt: { xs: 4, md: 5 },
                        p: { xs: 2, md: 2.5 },
                        border: "1px solid rgba(16,61,43,0.08)",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)",
                        boxShadow: "0 16px 40px rgba(15,23,42,0.06)"
                    }}
                >
                    <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={2}
                        alignItems={{ xs: "stretch", lg: "center" }}
                        justifyContent="space-between"
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                Find the right listing faster
                            </Typography>
                            <Typography sx={{ mt: 0.75, color: "text.secondary", maxWidth: 720 }}>
                                Search by title, description, provider, or delivery terms and narrow the marketplace by category.
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ width: { xs: "100%", lg: "auto" } }}>
                            <TextField
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Search listings"
                                sx={{ minWidth: { xs: "100%", md: 320 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <FormControl sx={{ minWidth: { xs: "100%", md: 240 } }}>
                                <InputLabel id="marketplace-category-filter-label">Category</InputLabel>
                                <Select
                                    labelId="marketplace-category-filter-label"
                                    value={selectedCategory}
                                    label="Category"
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <MenuItem value="all">All categories</MenuItem>
                                    {categories.map((category) => {
                                        const value = String(category.categoryId ?? category.CategoryId);
                                        const label = category.title ?? category.Title ?? "Category";
                                        return (
                                            <MenuItem key={value} value={value}>
                                                {label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2, rowGap: 1 }}>
                        <Chip
                            label={`${filteredItems.length} matching listing${filteredItems.length === 1 ? "" : "s"}`}
                            sx={{ fontWeight: 800, bgcolor: "rgba(16,61,43,0.08)", color: "#103d2b" }}
                        />
                        <Chip
                            label={selectedCategoryLabel}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                        {normalizedSearch ? (
                            <Chip
                                label={`Search: "${searchText.trim()}"`}
                                variant="outlined"
                                sx={{ fontWeight: 700 }}
                            />
                        ) : null}
                    </Stack>
                </Box>

                {loading ? (
                    <Grid container spacing={2.5} sx={{ mt: 3 }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card sx={{ borderRadius: 0, overflow: "hidden" }}>
                                    <Skeleton variant="rectangular" height={240} />
                                    <CardContent><Skeleton height={28} /><Skeleton height={20} width="80%" /><Skeleton height={18} width="55%" /></CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : activeItems.length === 0 ? (
                    <Box sx={{ mt: 6, textAlign: "center", p: { xs: 4, md: 6 }, borderRadius: 0, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid rgba(15,23,42,0.08)" }}>
                        <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, bgcolor: "rgba(27,186,120,0.12)", color: "#0f8a57" }}><Inventory2RoundedIcon /></Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>No active listings yet</Typography>
                        <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 620, mx: "auto" }}>Once users add more services and admins approve them, this page will feel like a full freelance marketplace.</Typography>
                        <Button variant="contained" onClick={() => navigate("/my-listings/new")} sx={{ mt: 3, borderRadius: 0, px: 3, py: 1.35, bgcolor: "#103d2b", fontWeight: 800, "&:hover": { bgcolor: "#14532d" } }}>Create the first listing</Button>
                    </Box>
                ) : hasActiveFilters ? (
                    filteredItems.length === 0 ? (
                        <Box sx={{ mt: 6, textAlign: "center", p: { xs: 4, md: 6 }, borderRadius: 0, background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", border: "1px solid rgba(15,23,42,0.08)" }}>
                            <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, bgcolor: "rgba(15,23,42,0.06)", color: "#0f172a" }}>
                                <SearchRoundedIcon />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a" }}>
                                No listings matched your filters
                            </Typography>
                            <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 620, mx: "auto" }}>
                                Try a different search phrase or switch the category dropdown back to all categories.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSearchText("");
                                    setSelectedCategory("all");
                                }}
                                sx={{ mt: 3, borderRadius: 0, px: 3, py: 1.35, bgcolor: "#103d2b", fontWeight: 800, "&:hover": { bgcolor: "#14532d" } }}
                            >
                                Clear filters
                            </Button>
                        </Box>
                    ) : (
                        <Section
                            title="Filtered marketplace results"
                            subtitle="Listings matching your current search and category filter."
                            items={filteredItems}
                            navigate={navigate}
                            categoryLabel={categoryLabel}
                        />
                    )
                ) : (
                    <>
                        <Section title="Featured offers" subtitle="The strongest offers are highlighted first to create a more marketplace-like first impression." items={featuredListings} navigate={navigate} categoryLabel={categoryLabel} featured />
                        <Section title="Newest work" subtitle="Fresh listings shown early so users immediately see the latest services added to the platform." items={freshListings} navigate={navigate} categoryLabel={categoryLabel} />
                        <Section title="Quick turnaround" subtitle="Faster delivery options for users who want shorter timelines and a quicker start." items={fastListings} navigate={navigate} categoryLabel={categoryLabel} />
                        <Section title="Budget-friendly picks" subtitle="Listings that are easier to compare for users starting with smaller budgets." items={budgetListings} navigate={navigate} categoryLabel={categoryLabel} />
                    </>
                )}
            </Container>
        </Box>
    );
}
