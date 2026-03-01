import { Container, Typography, Paper } from "@mui/material";

export default function Home() {
    return (
        <Container sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Home</Typography>
                <Typography>
                    Home page content (basic). Čia bus pagrindinė informacija.
                </Typography>
            </Paper>
        </Container>
    );
}
