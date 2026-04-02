import { Box, Container, Divider, Stack, Typography, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                mt: "auto",
                backgroundColor: "#111827",
                color: "#f9fafb",
                pt: 5,
                pb: 2,
            }}
        >
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={4}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "flex-start" }}
                >
                    <Box sx={{ maxWidth: 320 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                            Blockchain Service Platform
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
                            A platform for clients and service providers to securely create contracts,
                            manage milestones, leave feedback, and handle payments using blockchain technology.
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.2 }}>
                            Navigation
                        </Typography>

                        <Stack spacing={0.8}>
                            <MuiLink component={Link} to="/" underline="hover" color="inherit" sx={{ opacity: 0.85 }}>
                                Home
                            </MuiLink>
                            <MuiLink component={Link} to="/work" underline="hover" color="inherit" sx={{ opacity: 0.85 }}>
                                Listings
                            </MuiLink>
                            <MuiLink component={Link} to="/my-contracts" underline="hover" color="inherit" sx={{ opacity: 0.85 }}>
                                My Contracts
                            </MuiLink>
                            <MuiLink
                                component={Link}
                                to="/my-completed-contracts-comments"
                                underline="hover"
                                color="inherit"
                                sx={{ opacity: 0.85 }}
                            >
                                Comments
                            </MuiLink>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.2 }}>
                            Contact
                        </Typography>

                        <Stack spacing={0.8}>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Email: jokjak@ktu.lt
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Phone: +370 600 00000
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                Kaunas, Lithuania
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.12)" }} />

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        © {year} Blockchain Service Platform. All rights reserved.
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Bachelor's Thesis Project
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}