import { Box, Container, Divider, Grid, Stack, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box component="footer" sx={{ mt: "auto", bgcolor: "#0f172a", color: "#e2e8f0", pt: 6, pb: 3 }}>
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" sx={{ color: "white", mb: 1.5 }}>Blockchain Service Platform</Typography>
                        <Typography sx={{ maxWidth: 460, lineHeight: 1.8, color: "rgba(226,232,240,0.76)" }}>
                            A freelance collaboration system built around listings, inquiries, milestone-based contracts,
                            smart contract payments, and transparent service delivery.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={{ color: "white", fontWeight: 800, mb: 1.3 }}>Navigation</Typography>
                        <Stack spacing={1}>
                            <MuiLink component={Link} to="/" underline="hover" color="inherit">Home</MuiLink>
                            <MuiLink component={Link} to="/work" underline="hover" color="inherit">Marketplace</MuiLink>
                            <MuiLink component={Link} to="/my-contracts" underline="hover" color="inherit">Contracts</MuiLink>
                            <MuiLink component={Link} to="/about" underline="hover" color="inherit">About</MuiLink>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Typography sx={{ color: "white", fontWeight: 800, mb: 1.3 }}>Project</Typography>
                        <Stack spacing={1}>
                            <Typography sx={{ color: "rgba(226,232,240,0.76)" }}>Bachelor thesis project</Typography>
                            <Typography sx={{ color: "rgba(226,232,240,0.76)" }}>Kaunas, Lithuania</Typography>
                            <Typography sx={{ color: "rgba(226,232,240,0.76)" }}>Secure service agreements with blockchain support</Typography>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.10)" }} />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Typography sx={{ color: "rgba(226,232,240,0.60)" }}>© {year} Blockchain Service Platform</Typography>
                    <Typography sx={{ color: "rgba(226,232,240,0.60)" }}>Professional freelance workflow demo</Typography>
                </Stack>
            </Container>
        </Box>
    );
}
