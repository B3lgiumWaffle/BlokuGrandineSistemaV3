import { Box, Button, Chip, Container, Paper, Stack, Typography } from "@mui/material";

export function PageShell({ children, maxWidth = "lg", hero = null, compact = false }) {
    return (
        <Box
            sx={{
                minHeight: "100%",
                background:
                    "radial-gradient(circle at top left, rgba(15,118,110,0.10), transparent 28%), linear-gradient(180deg, #f4f8f7 0%, #ffffff 22%, #f8fafc 100%)",
                py: compact ? { xs: 3, md: 4 } : { xs: 4, md: 6 }
            }}
        >
            <Container maxWidth={maxWidth}>
                {hero}
                {children}
            </Container>
        </Box>
    );
}

export function PageHero({ eyebrow, title, subtitle, actions, stats }) {
    return (
        <Box
            sx={{
                overflow: "hidden",
                position: "relative",
                mb: 3,
                px: { xs: 3, md: 5 },
                py: { xs: 4, md: 5 },
                borderRadius: 0,
                color: "white",
                background: "linear-gradient(135deg, #0f172a 0%, #0f766e 45%, #14532d 100%)",
                boxShadow: "0 26px 90px rgba(15, 23, 42, 0.20)"
            }}
        >
            <Box sx={{ position: "absolute", top: -80, right: -40, width: 220, height: 220, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.08)" }} />
            <Box sx={{ position: "absolute", bottom: -110, left: -50, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ maxWidth: 760 }}>
                    {eyebrow ? <Chip label={eyebrow} sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 800 }} /> : null}
                    <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 900 }}>
                        {title}
                    </Typography>
                    {subtitle ? <Typography sx={{ mt: 1.5, maxWidth: 680, color: "rgba(255,255,255,0.82)", fontSize: { xs: 15, md: 17 }, lineHeight: 1.7 }}>{subtitle}</Typography> : null}
                    {actions ? <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>{actions}</Stack> : null}
                </Box>
                {stats?.length ? (
                    <Stack spacing={1.5} sx={{ minWidth: { md: 260 } }}>
                        {stats.map((stat) => (
                            <Box key={stat.label} sx={{ p: 2, borderRadius: 0, bgcolor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.10)" }}>
                                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>{stat.label}</Typography>
                                <Typography sx={{ mt: 0.5, fontSize: 28, fontWeight: 900 }}>{stat.value}</Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : null}
            </Stack>
        </Box>
    );
}

export function SectionCard({ title, subtitle, action, children, sx }) {
    return (
        <Paper sx={{ p: { xs: 2.5, md: 3 }, border: "1px solid rgba(15, 23, 42, 0.06)", ...sx }}>
            {(title || subtitle || action) ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2.5 }}>
                    <Box>
                        {title ? <Typography variant="h5">{title}</Typography> : null}
                        {subtitle ? <Typography sx={{ mt: 0.6, color: "text.secondary" }}>{subtitle}</Typography> : null}
                    </Box>
                    {action}
                </Stack>
            ) : null}
            {children}
        </Paper>
    );
}

export function EmptyState({ title, subtitle, action }) {
    return (
        <SectionCard>
            <Box sx={{ py: { xs: 2, md: 3 }, textAlign: "center" }}>
                <Typography variant="h5">{title}</Typography>
                {subtitle ? <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 620, mx: "auto" }}>{subtitle}</Typography> : null}
                {action ? <Box sx={{ mt: 2.5 }}>{action}</Box> : null}
            </Box>
        </SectionCard>
    );
}

export function BackButton({ onClick, label = "Back" }) {
    return (
        <Button variant="outlined" onClick={onClick}>
            {label}
        </Button>
    );
}
