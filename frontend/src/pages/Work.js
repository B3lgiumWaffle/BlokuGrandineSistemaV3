import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardActionArea,
    Chip,
    Container,
    Grid,
    Skeleton,
    Stack,
    Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = "https://localhost:7278";

function eur(v) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? `${n.toFixed(0)} €` : "-";
}

export default function Work() {
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // jei endpointas viešas - authHeaders gali būti tuščias
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/listings`, {
                    headers: {
                        ...authHeaders
                    }
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`${res.status} ${txt}`);
                }

                const data = await res.json().catch(() => []);
                if (!alive) return;

                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                if (!alive) return;
                setItems([]);
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    All listings
                </Typography>

                <Chip label={`${items.length} listings.`} />
            </Stack>

            <Grid container spacing={2}>
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                            <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
                                <Skeleton variant="rectangular" height={180} />
                                <CardContent>
                                    <Skeleton height={26} />
                                    <Skeleton height={18} width="80%" />
                                    <Skeleton height={18} width="60%" />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : items.map((it) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={it.listingId}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider"
                                }}
                            >
                                <CardActionArea onClick={() => navigate(`/listing/${it.listingId}`)}>
                                    {/* TOP: Photos */}
                                    <Box sx={{ p: 1.25 }}>
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: it.thumbPhotoUrls?.length ? "1fr 72px" : "1fr",
                                                gap: 1
                                            }}
                                        >
                                            {/* PRIMARY */}
                                            <Box
                                                component="img"
                                                src={it.primaryPhotoUrl || "/placeholder.jpg"}
                                                alt="primary"
                                                sx={{
                                                    width: "100%",
                                                    height: 180,
                                                    objectFit: "cover",
                                                    borderRadius: 2,
                                                    bgcolor: "grey.100"
                                                }}
                                            />

                                            {/* up to 3 thumbs */}
                                            {it.thumbPhotoUrls?.length ? (
                                                <Box sx={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)", gap: 1 }}>
                                                    {[0, 1, 2].map((idx) => {
                                                        const url = it.thumbPhotoUrls[idx];
                                                        return url ? (
                                                            <Box
                                                                key={idx}
                                                                component="img"
                                                                src={url}
                                                                alt={`thumb-${idx}`}
                                                                sx={{
                                                                    width: "100%",
                                                                    height: 56,
                                                                    objectFit: "cover",
                                                                    borderRadius: 2,
                                                                    bgcolor: "grey.100"
                                                                }}
                                                            />
                                                        ) : (
                                                            <Box
                                                                key={idx}
                                                                sx={{
                                                                    width: "100%",
                                                                    height: 56,
                                                                    borderRadius: 2,
                                                                    bgcolor: "grey.100"
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            ) : null}
                                        </Box>
                                    </Box>

                                    {/* BELOW PHOTOS: text */}
                                    <CardContent sx={{ pt: 0 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 800,
                                                lineHeight: 1.2,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                minHeight: 44
                                            }}
                                        >
                                            {it.title}
                                        </Typography>

                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                                            <Chip size="small" label={`Nuo ${eur(it.priceFrom)}`} />
                                            <Chip size="small" label={`Iki ${eur(it.priceTo)}`} />
                                            {it.completionTime ? <Chip size="small" label={it.completionTime} /> : null}
                                        </Stack>

                                        {it.description ? (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 1,
                                                    color: "text.secondary",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    minHeight: 60
                                                }}
                                            >
                                                {it.description}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                                                Aprašymo nėra.
                                            </Typography>
                                        )}
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
            </Grid>


            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Mintys ka ideti
                </Typography>

                <Chip label={`${items.length} skelb.`} />
            </Stack>


            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Most trusted user listings
                </Typography>

                <Chip label={`${items.length} skelb.`} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Most popular
                </Typography>

                <Chip label={`${items.length} skelb.`} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Most recent
                </Typography>

                <Chip label={`${items.length} skelb.`} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Looking for random jobs?
                </Typography>

                <Chip label={`${items.length} skelb.`} />
            </Stack>

        </Container>
    );
}
