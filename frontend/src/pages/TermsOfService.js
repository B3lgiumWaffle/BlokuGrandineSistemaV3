import { Box, Divider, Stack, Typography } from "@mui/material";
import { PageHero, PageShell, SectionCard } from "../components/PageChrome";

export const termsOfServiceSections = [
    {
        title: "1. Platform Scope",
        body: [
            "Blockchain Service Platform is a project system for listing services, sending inquiries, agreeing on milestone-based contracts, submitting completed milestones, reviewing delivery, and recording payment-related workflow events through smart contract support.",
            "The platform may be used only for lawful service collaboration and contract management. Users are responsible for the accuracy of listings, inquiries, uploaded materials, wallet addresses, and contract terms they submit."
        ]
    },
    {
        title: "2. Accounts and Wallets",
        body: [
            "Users are responsible for maintaining access to their accounts and blockchain wallets. A wallet transaction confirmed through MetaMask or another wallet interface is treated as an intentional user action.",
            "The platform cannot reverse blockchain transactions that have already been confirmed on-chain. Users should verify wallet addresses, network selection, and transaction details before confirming any transaction."
        ]
    },
    {
        title: "3. Contracts, Milestones, and Funding",
        body: [
            "A contract may be divided into milestones. Each milestone can have its own submission, approval status, payment amount, and settlement record.",
            "When a client funds a contract through the escrow smart contract, the funded amount is intended to secure milestone payments according to the agreed contract flow and applicable platform decisions."
        ]
    },
    {
        title: "4. Milestone Review",
        body: [
            "A service provider may submit a completed milestone. The client may approve or reject the milestone according to the agreed milestones and platform workflow.",
            "Rejected milestones may be revised and resubmitted unless the milestone or contract has already reached a final settlement state."
        ]
    },
    {
        title: "5. Disputes and Administrator Settlement",
        body: [
            "If a service provider escalates a rejected milestone as a dispute, an administrator may review the submitted milestone, the related milestone details, the contract state, and the available review trail.",
            "If the administrator approves the dispute in favor of the service provider, the administrator may authorize release of the disputed milestone funds directly from the escrow smart contract to the service provider. In that case, the client is not required to perform an additional approval action for that milestone, and the milestone may be marked as released or completed by the platform.",
            "If the administrator rejects the dispute, the existing rejection and revision flow remains in effect unless the contract is otherwise cancelled or completed."
        ]
    },
    {
        title: "6. Cancellations and Refunds",
        body: [
            "A contract may be cancellable only when platform rules allow cancellation. Submitted or disputed work may restrict cancellation until it is resolved.",
            "Refunds, partial payouts, and milestone settlements are calculated by platform rules and the agreed contract terms where applicable."
        ]
    },
    {
        title: "7. User Content",
        body: [
            "Users must not upload unlawful, malicious, misleading, infringing, or harmful content. Uploaded files and messages may be used as evidence during contract review or dispute handling.",
            "The platform may restrict, remove, or refuse content that violates these terms or disrupts the service."
        ]
    },
    {
        title: "8. Limitation of Liability",
        body: [
            "This platform is provided as a project and demonstration system. Users accept responsibility for testing, wallet usage, transaction confirmation, and the consequences of actions performed through their accounts.",
            "To the maximum extent permitted by applicable law, the platform is not liable for losses caused by incorrect wallet addresses, wrong network selection, user error, unavailable blockchain nodes, or irreversible blockchain transactions."
        ]
    },
    {
        title: "9. Changes",
        body: [
            "These terms may be updated as the platform evolves. Continued use of the platform after changes means the user accepts the updated terms."
        ]
    }
];

export default function TermsOfService() {
    return (
        <PageShell
            maxWidth="lg"
            hero={
                <PageHero
                    eyebrow="Legal"
                    title="Terms of Service"
                    subtitle="Rules for using the platform, working with milestone contracts, and resolving escrow-backed disputes."
                />
            }
        >
            <SectionCard>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            Last updated: May 14, 2026
                        </Typography>
                    </Box>

                    {termsOfServiceSections.map((section, index) => (
                        <Box key={section.title}>
                            {index > 0 ? <Divider sx={{ mb: 2.5 }} /> : null}
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {section.title}
                            </Typography>
                            <Stack spacing={1}>
                                {section.body.map((paragraph) => (
                                    <Typography key={paragraph} sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                                        {paragraph}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </SectionCard>
        </PageShell>
    );
}
