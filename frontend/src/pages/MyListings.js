import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Container,
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

export default function MyListings() {
    const navigate = useNavigate();
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

        const confirmDelete = window.confirm("Are you sure you want to delete this listing");
        if (!confirmDelete) return;

        try {
            const res = await fetch(
                `https://localhost:7278/api/listings/${listingId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                alert(`Error: ${res.status} ${txt}`);
                return;
            }

            // Pašalinam iš state be puslapio reload
            setItems((prev) => prev.filter((x) => x.listingId !== listingId));

        } catch (err) {
            alert("Server error at delete");
        }
    };


    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    My Listings
                </Typography>

                <Button variant="contained" onClick={() => navigate("/my-listings/new")}>
                    Add Listing
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Error
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {err}
                    </Typography>
                </Paper>
            ) : items.length === 0 ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        You dont have any listings
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                        Press "Add listings" to add a new listing
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
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
                                                            ? `${x.priceFrom ?? "-"}€ - ${x.priceTo ?? "-"}€`
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
            )}
        </Container>
    );
}
