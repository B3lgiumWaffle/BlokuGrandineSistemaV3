import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import { useAppDialog } from "../components/AppDialogProvider";
import { BackButton, EmptyState, PageHero, PageShell, SectionCard } from "../components/PageChrome";
import { formatEthRange } from "../utils/currency";

export default function MyListings() {
    const navigate = useNavigate();
    const dialog = useAppDialog();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");

    const token = useMemo(() => localStorage.getItem("token"), []);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");

                const data = await apiGet("/api/listings/mine");

                if (!alive) return;
                setItems(Array.isArray(data) ? data : data?.items ?? []);
            } catch (e) {
                if (!alive) return;
                setErr(e?.message ?? "Couldn't load your listings");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [navigate, token]);

    const onDelete = async (listingId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const confirmDelete = await dialog.confirm({
            title: "Delete listing?",
            message: "Are you sure you want to delete this listing?",
            confirmText: "Delete"
        });
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_BASE ?? "http://localhost:8080"}/api/listings/${listingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                await dialog.alert({ variant: "error", title: "Delete failed", message: `Error: ${res.status} ${txt}` });
                return;
            }

            // Pašalinam iš state be puslapio reload
            setItems((prev) => prev.filter((x) => x.listingId !== listingId));

        } catch (err) {
            await dialog.alert({ variant: "error", title: "Delete failed", message: "Server error at delete" });
        }
    };


    return (
        <PageShell
            maxWidth="xl"
            compact
            hero={
                <PageHero
                    eyebrow="Seller workspace"
                    title="Manage your listings in one place."
                    subtitle="Create, update, review, and remove your service offers with a cleaner administration view."
                    actions={[
                        <Button key="create" variant="contained" onClick={() => navigate("/my-listings/new")}>Create listing</Button>,
                        <BackButton key="back" onClick={() => navigate(-1)} />
                    ]}
                    stats={[
                        { label: "Listings", value: items.length },
                        { label: "Visible table rows", value: items.length || 0 }
                    ]}
                />
            }
        >

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <SectionCard>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {err}
                    </Typography>
                </SectionCard>
            ) : items.length === 0 ? (
                <EmptyState
                    title="You do not have any listings yet"
                    subtitle="Create your first listing to publish a service in the marketplace."
                    action={<Button variant="contained" onClick={() => navigate("/my-listings/new")}>Create listing</Button>}
                />
            ) : (
                <SectionCard title="Your listings" subtitle="A compact overview of price, delivery, date, and primary image.">
                <TableContainer component={Paper} elevation={0} sx={{ boxShadow: "none", border: "1px solid rgba(15,23,42,0.08)" }}>
                    <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Completion time</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>


                                    <TableBody>
                                        {items.map((x) => {
                                            const id = x.listingId ?? x.id;
                                            return (
                                                <TableRow key={id} hover>
                                                    {/* 👇 PHOTO CELL */}
                                                    <TableCell sx={{ width: 110 }}>
                                                        {x.primaryPhotoUrl ? (
                                                            <Box
                                                                component="img"
                                                                src={x.primaryPhotoUrl}
                                                                alt="primary"
                                                                sx={{
                                                                    width: 80,
                                                                    height: 60,
                                                                    objectFit: "cover",
                                                                    borderRadius: 2,
                                                                    border: "1px solid #ddd"
                                                                }}
                                                            />
                                                        ) : null}
                                                    </TableCell>

                                                    <TableCell>{x.title ?? x.Title ?? "-"}</TableCell>

                                                    <TableCell>
                                                        {x.priceFrom != null || x.priceTo != null
                                                            ? formatEthRange(x.priceFrom, x.priceTo)
                                                            : "-"}
                                                    </TableCell>

                                                    <TableCell>{x.completionTime ?? "-"}</TableCell>

                                                    <TableCell>
                                                        {x.uploadTime
                                                            ? new Date(x.uploadTime).toLocaleDateString()
                                                            : "-"}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                onClick={() => navigate(`/my-listings/edit/${id}`)}
                                                            >
                                                                Update
                                                            </Button>

                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                onClick={() => onDelete(id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>

                    </Table>
                </TableContainer>
                </SectionCard>
            )}
        </PageShell>
    );
}
