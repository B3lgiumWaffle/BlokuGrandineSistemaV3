import { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPostJson } from "../api/api";
import {
    createOnChainProject,
    getCurrentWalletAddress,
    releaseMilestoneOnChain,
    signAndFundProject,
    ESCROW_ADDRESS
} from "../blockchain/escrow";

function money(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `€${n.toFixed(2)}`;
}

function eth(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (Number.isNaN(n)) return "—";
    return `${n} ETH`;
}

function safeDate(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
}

function normalizeContract(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};

    return {
        contractId: x.contractId ?? x.ContractId,
        inquiryId: x.inquiryId ?? x.InquiryId,
        clientUserId: x.clientUserId ?? x.ClientUserId,
        providerUserId: x.providerUserId ?? x.ProviderUserId,
        clientWalletAddress: x.clientWalletAddress ?? x.ClientWalletAddress ?? null,
        providerWalletAddress: x.providerWalletAddress ?? x.ProviderWalletAddress ?? null,
        network: x.network ?? x.Network ?? "",
        smartContractAddress: x.smartContractAddress ?? x.SmartContractAddress ?? null,
        chainProjectId: x.chainProjectId ?? x.ChainProjectId ?? null,
        agreedAmountEur: x.agreedAmountEur ?? x.AgreedAmountEur ?? null,
        fundedAmountEth: x.fundedAmountEth ?? x.FundedAmountEth ?? null,
        milestoneCount: x.milestoneCount ?? x.MilestoneCount ?? 0,
        milestoneAmountEth: x.milestoneAmountEth ?? x.MilestoneAmountEth ?? null,
        fundingTxHash: x.fundingTxHash ?? x.FundingTxHash ?? null,
        status: x.status ?? x.Status ?? "",
        milestones: Array.isArray(x.milestones ?? x.Milestones)
            ? (x.milestones ?? x.Milestones).map((m) => ({
                milestoneId: m.milestoneId ?? m.MilestoneId,
                milestoneNo: m.milestoneNo ?? m.MilestoneNo,
                requirementId: m.requirementId ?? m.RequirementId ?? null,
                amountEurSnapshot: m.amountEurSnapshot ?? m.AmountEurSnapshot ?? null,
                amountEth: m.amountEth ?? m.AmountEth ?? null,
                status: m.status ?? m.Status ?? "",
                releaseTxHash: m.releaseTxHash ?? m.ReleaseTxHash ?? null,
                releasedAt: m.releasedAt ?? m.ReleasedAt ?? null,
            }))
            : []
    };
}

function normalizePayload(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    const ms = x.milestones ?? x.Milestones ?? [];

    return {
        contractId: x.contractId ?? x.ContractId,
        inquiryId: x.inquiryId ?? x.InquiryId,
        clientWalletAddress: x.clientWalletAddress ?? x.ClientWalletAddress ?? null,
        providerWalletAddress: x.providerWalletAddress ?? x.ProviderWalletAddress ?? null,
        milestones: Array.isArray(ms)
            ? ms.map((m) => ({
                milestoneNo: m.milestoneNo ?? m.MilestoneNo,
                title: m.title ?? m.Title ?? `Milestone ${m.milestoneNo ?? m.MilestoneNo}`,
                amountEth: m.amountEth ?? m.AmountEth ?? 0,
            }))
            : []
    };
}

function normalizeMessages(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};

    return {
        contractId: x.contractId ?? x.ContractId,
        contractStatus: x.contractStatus ?? x.ContractStatus ?? "",
        currentUserId: x.currentUserId ?? x.CurrentUserId,
        otherUserId: x.otherUserId ?? x.OtherUserId,
        otherUserName: x.otherUserName ?? x.OtherUserName ?? "",
        canSendMessages: x.canSendMessages ?? x.CanSendMessages ?? false,
        messages: Array.isArray(x.messages ?? x.Messages)
            ? (x.messages ?? x.Messages).map((m) => ({
                messageId: m.messageId ?? m.MessageId,
                contractId: m.contractId ?? m.ContractId,
                senderUserId: m.senderUserId ?? m.SenderUserId,
                receiverUserId: m.receiverUserId ?? m.ReceiverUserId,
                messageText: m.messageText ?? m.MessageText ?? "",
                sentAt: m.sentAt ?? m.SentAt,
                isRead: m.isRead ?? m.IsRead ?? false,
                readAt: m.readAt ?? m.ReadAt ?? null,
                senderName: m.senderName ?? m.SenderName ?? "",
                receiverName: m.receiverName ?? m.ReceiverName ?? ""
            }))
            : []
    };
}

function getCurrentUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const raw =
            payload.userId ??
            payload.UserId ??
            payload.nameid ??
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
            payload.sub;

        const n = Number(raw);
        return Number.isNaN(n) ? null : n;
    } catch {
        return null;
    }
}

export default function ContractDetails() {
    const { contractId } = useParams();
    const navigate = useNavigate();
    const token = useMemo(() => localStorage.getItem("token"), []);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const [item, setItem] = useState(null);
    const [payload, setPayload] = useState(null);

    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesBusy, setMessagesBusy] = useState(false);
    const [messagesErr, setMessagesErr] = useState("");
    const [messagesData, setMessagesData] = useState(null);
    const [messageText, setMessageText] = useState("");

    const messagesBottomRef = useRef(null);

    const currentUserId = getCurrentUserIdFromToken();

    const isProvider = item && currentUserId === Number(item.providerUserId);
    const isClient = item && currentUserId === Number(item.clientUserId);

    const loadMessages = async () => {
        try {
            setMessagesLoading(true);
            setMessagesErr("");

            const res = await apiGet(`/api/messages/contract/${contractId}`);
            setMessagesData(normalizeMessages(res));
        } catch (e) {
            setMessagesErr(e?.message ?? "Failed to load messages");
        } finally {
            setMessagesLoading(false);
        }
    };

    const load = async () => {
        try {
            setLoading(true);
            setErr("");

            const [contractData, payloadData] = await Promise.all([
                apiGet(`/api/contracts/${contractId}`),
                apiGet(`/api/contracts/${contractId}/blockchain-payload`)
            ]);

            setItem(normalizeContract(contractData));
            setPayload(normalizePayload(payloadData));
        } catch (e) {
            setErr(e?.message ?? "Failed to load contract");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        load();
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractId, token]);

    useEffect(() => {
        if (!messagesData) return;
        setTimeout(() => {
            messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messagesData]);

    const totalEth = useMemo(() => {
        const arr = item?.milestones ?? [];
        return arr.reduce((sum, m) => sum + Number(m.amountEth ?? 0), 0);
    }, [item]);

    const canCreateOnChain =
        isProvider &&
        item &&
        !item.chainProjectId &&
        !busy;

    const canFund =
        isClient &&
        item &&
        item.chainProjectId &&
        item.status === "PendingFunding" &&
        !busy;

    const onCreateOnChain = async () => {
        try {
            setBusy(true);

            const providerWalletAddress = await getCurrentWalletAddress();

            const clientWalletAddress =
                item?.clientWalletAddress || payload?.clientWalletAddress;
            console.log("ITEM:", item);
            console.log("PAYLOAD:", payload);
            if (!clientWalletAddress) {
                throw new Error("Client wallet address is missing in database");
            }

            const result = await createOnChainProject({
                localContractId: item.contractId,
                clientWalletAddress,
                providerWalletAddress,
                milestones: payload.milestones
            });

            await apiPostJson(`/api/contracts/${item.contractId}/on-chain-created`, {
                clientWalletAddress,
                providerWalletAddress,
                smartContractAddress: ESCROW_ADDRESS,
                chainProjectId: result.projectId
            });

            alert("On-chain project created.");
            await load();
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to create on-chain project");
        } finally {
            setBusy(false);
        }
    };

    const onFund = async () => {
        try {
            setBusy(true);

            const result = await signAndFundProject({
                projectId: item.chainProjectId,
                totalAmountEth: totalEth,
                expectedClientWalletAddress: item.clientWalletAddress
            });

            await apiPostJson(`/api/contracts/${item.contractId}/funded`, {
                clientWalletAddress: result.walletAddress,
                fundedAmountEth: totalEth,
                fundingTxHash: result.txHash
            });

            alert("Contract funded.");
            await load();
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Funding failed");
        } finally {
            setBusy(false);
        }
    };

    const onReleaseMilestone = async (m) => {
        try {
            setBusy(true);

            const result = await releaseMilestoneOnChain({
                projectId: item.chainProjectId,
                milestoneIndex: Number(m.milestoneNo) - 1
            });

            await apiPostJson(
                `/api/contracts/${item.contractId}/milestones/${m.milestoneNo}/released`,
                {
                    amountEth: Number(m.amountEth ?? 0),
                    releaseTxHash: result.txHash
                }
            );

            alert(`Milestone #${m.milestoneNo} released.`);
            await load();
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Release failed");
        } finally {
            setBusy(false);
        }
    };

    const onSendMessage = async () => {
        const text = messageText.trim();
        if (!text) return;

        try {
            setMessagesBusy(true);

            await apiPostJson(`/api/messages/contract/${contractId}`, {
                messageText: text
            });

            setMessageText("");
            await loadMessages();
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to send message");
        } finally {
            setMessagesBusy(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Contract Details
                </Typography>

                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : err ? (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 900, mb: 0.5 }}>Error</Typography>
                    <Typography>{err}</Typography>
                </Paper>
            ) : !item ? (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 900 }}>Contract not found</Typography>
                </Paper>
            ) : (
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            Contract #{item.contractId}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Inquiry ID: {item.inquiryId}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`Status: ${item.status}`} color="primary" variant="outlined" />
                            <Chip label={`Network: ${item.network || "localhost"}`} variant="outlined" />
                            <Chip label={`Amount: ${money(item.agreedAmountEur)}`} variant="outlined" />
                            <Chip label={`Funded: ${eth(item.fundedAmountEth)}`} variant="outlined" />
                        </Stack>

                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Smart contract: {item.smartContractAddress || "—"}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Chain project ID: {item.chainProjectId ?? "—"}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Funding tx: {item.fundingTxHash || "—"}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={1.2} flexWrap="wrap">
                        {canCreateOnChain && (
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={onCreateOnChain}
                                disabled={busy}
                                sx={{ fontWeight: 800 }}
                            >
                                {busy ? "Creating..." : "Create On-Chain Project"}
                            </Button>
                        )}

                        {canFund && (
                            <Button
                                variant="contained"
                                color="success"
                                onClick={onFund}
                                disabled={busy}
                                sx={{ fontWeight: 800 }}
                            >
                                {busy ? "Funding..." : `Sign & Fund (${eth(totalEth)})`}
                            </Button>
                        )}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1.2 }}>
                        Milestones
                    </Typography>

                    <Stack spacing={1.2}>
                        {item.milestones.map((m) => {
                            const canRelease =
                                isClient &&
                                item.status !== "PendingFunding" &&
                                item.chainProjectId &&
                                m.status !== "Released" &&
                                !busy;

                            return (
                                <Paper key={m.milestoneId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        spacing={1.2}
                                    >
                                        <Box>
                                            <Typography sx={{ fontWeight: 800 }}>
                                                Milestone #{m.milestoneNo}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                EUR snapshot: {money(m.amountEurSnapshot)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                ETH amount: {eth(m.amountEth)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                Status: {m.status}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                                Release tx: {m.releaseTxHash || "—"}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                                Released at: {safeDate(m.releasedAt)}
                                            </Typography>
                                        </Box>

                                        {canRelease && (
                                            <Button
                                                variant="contained"
                                                onClick={() => onReleaseMilestone(m)}
                                                disabled={busy}
                                                sx={{ fontWeight: 800 }}
                                            >
                                                Release
                                            </Button>
                                        )}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1.2 }}>
                        Messages
                    </Typography>

                    {messagesLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : messagesErr ? (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Message error</Typography>
                            <Typography>{messagesErr}</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={1.5}>
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                            >
                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                    Chat with: {messagesData?.otherUserName || "—"}
                                </Typography>

                                <Chip
                                    label={messagesData?.canSendMessages ? "Messaging enabled" : "Messaging disabled"}
                                    color={messagesData?.canSendMessages ? "success" : "default"}
                                    variant="outlined"
                                />
                            </Stack>

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2.5,
                                    bgcolor: "#fafafa",
                                    maxHeight: 420,
                                    overflowY: "auto"
                                }}
                            >
                                <Stack spacing={1.2}>
                                    {!messagesData?.messages?.length ? (
                                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                            No messages yet.
                                        </Typography>
                                    ) : (
                                        messagesData.messages.map((m) => {
                                            const isMine =
                                                Number(m.senderUserId) === Number(messagesData.currentUserId);

                                            return (
                                                <Box
                                                    key={m.messageId}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: isMine ? "flex-end" : "flex-start"
                                                    }}
                                                >
                                                    <Paper
                                                        elevation={1}
                                                        sx={{
                                                            p: 1.25,
                                                            borderRadius: 2.5,
                                                            maxWidth: "75%"
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: "block",
                                                                mb: 0.5,
                                                                opacity: 0.75,
                                                                fontWeight: 800
                                                            }}
                                                        >
                                                            {isMine ? "You" : (m.senderName || `User #${m.senderUserId}`)}
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                        >
                                                            {m.messageText}
                                                        </Typography>

                                                        <Typography
                                                            variant="caption"
                                                            sx={{ display: "block", mt: 0.75, opacity: 0.65 }}
                                                        >
                                                            {safeDate(m.sentAt)}
                                                            {isMine && m.isRead ? ` • Read ${safeDate(m.readAt)}` : ""}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                            );
                                        })
                                    )}
                                    <div ref={messagesBottomRef} />
                                </Stack>
                            </Paper>

                            <TextField
                                label="Write a message"
                                multiline
                                minRows={3}
                                maxRows={6}
                                fullWidth
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                disabled={!messagesData?.canSendMessages || messagesBusy}
                            />

                            {!messagesData?.canSendMessages && (
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                    Messages can only be sent when the contract is Funded or InProgress.
                                </Typography>
                            )}

                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    onClick={onSendMessage}
                                    disabled={
                                        messagesBusy ||
                                        !messagesData?.canSendMessages ||
                                        !messageText.trim()
                                    }
                                    sx={{ fontWeight: 800 }}
                                >
                                    {messagesBusy ? "Sending..." : "Send message"}
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </Paper>
            )}
        </Container>
    );
}