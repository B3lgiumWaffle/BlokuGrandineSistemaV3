import { Container, Typography, Paper, Stack } from "@mui/material";

export default function About() {
    return (
        <Container sx={{ mt: 4, mb: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Stack spacing={3}>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        About the System
                    </Typography>

                    <Typography variant="body1">
                        This system is designed to facilitate secure and transparent collaboration
                        between service providers and clients. It allows users to create service
                        listings, send inquiries, negotiate terms, and establish agreements in the
                        form of digital contracts.
                    </Typography>

                    <Typography variant="body1">
                        One of the key features of the system is the integration of blockchain
                        technology. Payments between parties are handled through smart contracts,
                        ensuring that funds are securely stored and only released when agreed
                        conditions are met. This reduces the risk of fraud and increases trust
                        between users.
                    </Typography>

                    <Typography variant="body1">
                        The platform also supports milestone-based workflows, where projects are
                        divided into smaller parts. Each milestone can be reviewed, approved, and
                        paid separately, providing flexibility and better control over the project
                        progress.
                    </Typography>

                    <Typography variant="body1">
                        Additionally, users can communicate through an internal messaging system,
                        receive real-time notifications, and leave comments or ratings after the
                        completion of a contract. This helps build reputation and improves the
                        overall quality of services on the platform.
                    </Typography>

                    <Typography variant="body1">
                        The system is built using modern technologies including a React frontend,
                        .NET backend, and a relational database. The architecture ensures scalability,
                        maintainability, and a smooth user experience.
                    </Typography>

                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        This project was developed as part of a bachelor thesis, focusing on the
                        application of blockchain technology in service-based systems.
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}