import { Container, Typography, Paper } from "@mui/material";

export default function About() {
    return (
        <Container sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>About</Typography>
                <Typography>
                    About page content (basic). Čia bus informacija apie sistemą.
                </Typography>
            </Paper>
        </Container>
    );
}
