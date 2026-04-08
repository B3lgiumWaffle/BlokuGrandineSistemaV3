import { Button, Chip, Grid, Stack, Typography } from "@mui/material";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { useNavigate } from "react-router-dom";
import { EmptyState, PageHero, PageShell, SectionCard } from "../components/PageChrome";

const highlights = [
    {
        title: "Service marketplace",
        text: "Browse professional listings, compare pricing, and move from discovery to inquiry in one place."
    },
    {
        title: "Milestone contracts",
        text: "Convert accepted inquiries into structured contracts with clear payment steps and delivery flow."
    },
    {
        title: "Blockchain-backed trust",
        text: "Use smart-contract thinking to support funding, release flow, and safer collaboration."
    }
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <PageShell
            maxWidth="xl"
            hero={
                <PageHero
                    eyebrow="Freelance platform"
                    title="A cleaner, more professional way to manage freelance work with blockchain support."
                    subtitle="This system connects clients and service providers through listings, inquiries, contracts, milestones, comments, and notification flows."
                    actions={[
                        <Button key="explore" variant="contained" onClick={() => navigate("/work")} sx={{ bgcolor: "#14b8a6", color: "#042f2e", "&:hover": { bgcolor: "#2dd4bf" } }}>
                            Explore marketplace
                        </Button>,
                        <Button key="list" variant="outlined" onClick={() => navigate("/my-listings/new")} sx={{ borderColor: "rgba(255,255,255,0.20)", color: "white" }}>
                            Create listing
                        </Button>
                    ]}
                    stats={[
                        { label: "Core modules", value: "6" },
                        { label: "Main workflow", value: "Listing to contract" },
                        { label: "Focus", value: "Trust and clarity" }
                    ]}
                />
            }
        >
            <Grid container spacing={2.5}>
                {highlights.map((item, index) => (
                    <Grid item xs={12} md={4} key={item.title}>
                        <SectionCard sx={{ height: "100%" }}>
                            <Stack spacing={2}>
                                {index === 0 ? <SecurityRoundedIcon color="primary" /> : index === 1 ? <PaymentsRoundedIcon color="primary" /> : <HubRoundedIcon color="primary" />}
                                <Typography variant="h6">{item.title}</Typography>
                                <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>{item.text}</Typography>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>

            <SectionCard
                title="What the platform covers"
                subtitle="The design is meant to feel closer to a real service marketplace instead of a student prototype."
                sx={{ mt: 3 }}
            >
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label="Listings" />
                    <Chip label="Client inquiries" />
                    <Chip label="Negotiation flow" />
                    <Chip label="Contracts" />
                    <Chip label="Milestones" />
                    <Chip label="Notifications" />
                    <Chip label="Comments and ratings" />
                    <Chip label="Admin review" />
                </Stack>
            </SectionCard>

            <BoxedCTA navigate={navigate} />
        </PageShell>
    );
}

function BoxedCTA({ navigate }) {
    return (
        <EmptyState
            title="Start with the marketplace"
            subtitle="If you want the best first impression, the Marketplace and listing detail pages are now the main visual entry point of the system."
            action={
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="center">
                    <Button variant="contained" onClick={() => navigate("/work")}>Open marketplace</Button>
                    <Button variant="outlined" onClick={() => navigate("/about")}>Read system overview</Button>
                </Stack>
            }
        />
    );
}
