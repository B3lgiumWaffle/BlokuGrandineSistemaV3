import { Grid, Stack, Typography } from "@mui/material";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

const sections = [
    {
        title: "Listings and discovery",
        text: "Service providers can publish listings with descriptions, pricing ranges, delivery expectations, and photos. Clients can review those listings in a cleaner marketplace experience."
    },
    {
        title: "Inquiries and negotiation",
        text: "Clients can send structured inquiries, propose budgets, and attach requirement items. This creates a clearer path from first contact to an agreed scope."
    },
    {
        title: "Contracts and milestones",
        text: "Accepted inquiries can evolve into contracts with milestone-based delivery. This gives both parties a more transparent view of progress and responsibility."
    },
    {
        title: "Blockchain support",
        text: "The system is built around blockchain-oriented trust. Funding and settlement ideas are represented through smart-contract workflow logic in the broader platform."
    }
];

export default function About() {
    return (
        <PageShell
            maxWidth="xl"
            hero={
                <PageHero
                    eyebrow="System overview"
                    title="Built for transparent freelance collaboration."
                    subtitle="This project combines a React frontend, .NET backend, and blockchain-oriented contract flow to support listings, inquiries, contracts, comments, and platform governance."
                />
            }
        >
            <Grid container spacing={2.5}>
                {sections.map((section) => (
                    <Grid item xs={12} md={6} key={section.title}>
                        <SectionCard sx={{ height: "100%" }}>
                            <Stack spacing={1.2}>
                                <Typography variant="h6">{section.title}</Typography>
                                <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>{section.text}</Typography>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>
        </PageShell>
    );
}
