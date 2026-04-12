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
    Rating
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPostJson } from "../api/api";
import {
    createOnChainProject,
    getCurrentWalletAddress,
    settleMilestoneOnChain,
    signAndFundProject,
    ESCROW_ADDRESS
} from "../blockchain/escrow";

const DEFAULT_ESCROW_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
                requirementDescription:
                    m.requirementDescription ??
                    m.RequirementDescription ??
                    "",
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

function normalizeFragments(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};
    const arr = x.fragments ?? x.Fragments ?? [];

    return {
        contractId: x.contractId ?? x.ContractId,
        currentUserId: x.currentUserId ?? x.CurrentUserId,
        isClient: x.isClient ?? x.IsClient ?? false,
        isProvider: x.isProvider ?? x.IsProvider ?? false,
        fragments: Array.isArray(arr)
            ? arr.map((f) => ({
                fragmentId: f.fragmentId ?? f.FragmentId,
                contractId: f.contractId ?? f.ContractId,
                milestoneId: f.milestoneId ?? f.MilestoneId,
                requirementId: f.requirementId ?? f.RequirementId ?? null,
                title: f.title ?? f.Title ?? "",
                description: f.description ?? f.Description ?? "",
                filePath: f.filePath ?? f.FilePath ?? null,
                submittedByUserId: f.submittedByUserId ?? f.SubmittedByUserId,
                submittedAt: f.submittedAt ?? f.SubmittedAt,
                status: f.status ?? f.Status ?? "",
                reviewComment: f.reviewComment ?? f.ReviewComment ?? "",
                approvedByUserId: f.approvedByUserId ?? f.ApprovedByUserId ?? null,
                approvedAt: f.approvedAt ?? f.ApprovedAt ?? null,
                releaseTxHash: f.releaseTxHash ?? f.ReleaseTxHash ?? null,
                createdAt: f.createdAt ?? f.CreatedAt ?? null,
                updatedAt: f.updatedAt ?? f.UpdatedAt ?? null
            }))
            : []
    };
}

function normalizeRating(raw) {
    const x = raw?.item ?? raw?.data ?? raw ?? {};

    return {
        ratingId: x.ratingId ?? x.RatingId ?? null,
        contractId: x.contractId ?? x.ContractId ?? null,
        listingId: x.listingId ?? x.ListingId ?? null,
        fromUserId: x.fromUserId ?? x.FromUserId ?? null,
        toUserId: x.toUserId ?? x.ToUserId ?? null,
        userRating: x.userRating ?? x.UserRating ?? null,
        userRatingComment: x.userRatingComment ?? x.UserRatingComment ?? "",
        systemRating: x.systemRating ?? x.SystemRating ?? null,
        systemRatingReason: x.systemRatingReason ?? x.SystemRatingReason ?? "",
        createdAt: x.createdAt ?? x.CreatedAt ?? null,
        updatedAt: x.updatedAt ?? x.UpdatedAt ?? null
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

    const [submitForms, setSubmitForms] = useState({});

    const [fragmentsLoading, setFragmentsLoading] = useState(false);
    const [fragmentsBusy, setFragmentsBusy] = useState(false);
    const [fragmentsErr, setFragmentsErr] = useState("");
    const [fragmentsData, setFragmentsData] = useState(null);
    const [expandedFragmentMilestones, setExpandedFragmentMilestones] = useState({});
    const [reviewInputs, setReviewInputs] = useState({});

    const [messagesLoading, setMessagesLoading] = useState(false);
    const [messagesBusy, setMessagesBusy] = useState(false);
    const [messagesErr, setMessagesErr] = useState("");
    const [messagesData, setMessagesData] = useState(null);
    const [messageText, setMessageText] = useState("");

    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingBusy, setRatingBusy] = useState(false);
    const [ratingErr, setRatingErr] = useState("");
    const [ratingData, setRatingData] = useState(null);
    const [ratingValue, setRatingValue] = useState(0);
    const [ratingComment, setRatingComment] = useState("");

    const currentUserId = getCurrentUserIdFromToken();

    const isProvider = item && currentUserId === Number(item.providerUserId);
    const isClient = item && currentUserId === Number(item.clientUserId);

    const totalEth = useMemo(() => {
        const arr = item?.milestones ?? [];
        return arr.reduce((sum, m) => sum + Number(m.amountEth ?? 0), 0);
    }, [item]);

    const fragmentGroups = useMemo(() => {
        const fragments = Array.isArray(fragmentsData?.fragments) ? fragmentsData.fragments : [];
        const milestones = Array.isArray(item?.milestones) ? item.milestones : [];

        return milestones.map((milestone) => {
            const milestoneFragments = fragments
                .filter((fragment) => Number(fragment.milestoneId) === Number(milestone.milestoneId))
                .sort((a, b) => {
                    const aTime = new Date(a.updatedAt || a.submittedAt || a.createdAt || 0).getTime();
                    const bTime = new Date(b.updatedAt || b.submittedAt || b.createdAt || 0).getTime();
                    return bTime - aTime;
                });

            return {
                ...milestone,
                fragments: milestoneFragments,
                latestFragment: milestoneFragments[0] ?? null,
                hasHistory: milestoneFragments.length > 1
            };
        });
    }, [fragmentsData, item]);

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

    const canRate =
        isClient &&
        item &&
        (item.status === "Completed" || item.status === "Closed") &&
        ratingData &&
        ratingData.userRating == null;

    const hasExistingRating =
        ratingData &&
        ratingData.userRating != null;

    const getSubmitForm = (milestoneNo) =>
        submitForms[milestoneNo] ?? { title: "", description: "", file: null };

    const setSubmitFormValue = (milestoneNo, key, value) => {
        setSubmitForms((prev) => ({
            ...prev,
            [milestoneNo]: {
                ...(prev[milestoneNo] ?? { title: "", description: "", file: null }),
                [key]: value
            }
        }));
    };

    const setReviewValue = (fragmentId, value) => {
        setReviewInputs((prev) => ({
            ...prev,
            [fragmentId]: value
        }));
    };

    const getReviewValue = (fragmentId) => reviewInputs[fragmentId] ?? "";

    const toggleFragmentMilestone = (milestoneId) => {
        setExpandedFragmentMilestones((prev) => ({
            ...prev,
            [milestoneId]: !prev[milestoneId]
        }));
    };

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

    const loadFragments = async () => {
        try {
            setFragmentsLoading(true);
            setFragmentsErr("");

            const res = await apiGet(`/api/inquiries/contracts/${contractId}/fragments`);
            setFragmentsData(normalizeFragments(res));
        } catch (e) {
            setFragmentsErr(e?.message ?? "Failed to load fragments");
        } finally {
            setFragmentsLoading(false);
        }
    };

    const loadRating = async () => {
        try {
            setRatingLoading(true);
            setRatingErr("");

            const res = await apiGet(`/api/valuation/contract/${contractId}`);
            const normalized = normalizeRating(res);

            setRatingData(normalized);
            setRatingValue(Number(normalized.userRating ?? 0));
            setRatingComment(normalized.userRatingComment ?? "");
        } catch (e) {
            setRatingErr(e?.message ?? "Failed to load rating");
        } finally {
            setRatingLoading(false);
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

        window.scrollTo({ top: 0, behavior: "auto" });
        load();
        loadMessages();
        loadFragments();
        loadRating();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractId, token]);

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

    const onCreateOnChain = async () => {
        try {
            setBusy(true);

            const providerWalletAddress = await getCurrentWalletAddress();
            const clientWalletAddress =
                item?.clientWalletAddress || payload?.clientWalletAddress;

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
                smartContractAddress: ESCROW_ADDRESS || DEFAULT_ESCROW_ADDRESS,
                chainProjectId: result.projectId
            });

            alert("On-chain project created.");
            await Promise.all([load(), loadMessages(), loadFragments(), loadRating()]);
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
            await Promise.all([load(), loadMessages(), loadFragments(), loadRating()]);
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Funding failed");
        } finally {
            setBusy(false);
        }
    };

    const onSubmitFragment = async (milestoneNo) => {
        const formState = getSubmitForm(milestoneNo);

        if (!formState.title.trim()) {
            alert("Fragment title is required.");
            return;
        }

        try {
            setBusy(true);

            const tokenValue = localStorage.getItem("token");
            const fd = new FormData();
            fd.append("title", formState.title);
            fd.append("description", formState.description || "");
            if (formState.file) {
                fd.append("file", formState.file);
            }

            const res = await fetch(
                `https://localhost:7278/api/contracts/${contractId}/milestones/${milestoneNo}/submit-fragment`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${tokenValue}`
                    },
                    body: fd
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to submit fragment");
            }

            alert("Fragment submitted successfully.");
            setSubmitForms((prev) => ({
                ...prev,
                [milestoneNo]: { title: "", description: "", file: null }
            }));

            await Promise.all([load(), loadFragments(), loadMessages(), loadRating()]);
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to submit fragment");
        } finally {
            setBusy(false);
        }
    };

    const onApproveFragment = async (fragment) => {
        try {
            setFragmentsBusy(true);

            if (!item?.chainProjectId) {
                throw new Error("Contract does not have chainProjectId yet.");
            }

            if (!item?.fundedAmountEth || item.status === "PendingFunding") {
                throw new Error("Contract must be funded before approving a submitted fragment.");
            }

            const previewRaw = await apiGet(
                `/api/inquiries/contracts/${contractId}/fragments/${fragment.fragmentId}/settlement-preview`
            );

            const settlement = previewRaw?.item ?? previewRaw?.data ?? previewRaw ?? {};

            const chainResult = await settleMilestoneOnChain({
                projectId: Number(item.chainProjectId),
                milestoneIndex: Number(settlement.milestoneIndex),
                providerAmountEth: Number(settlement.providerAmountEth),
                clientRefundAmountEth: Number(settlement.clientRefundAmountEth)
            });

            await apiPostJson(
                `/api/inquiries/contracts/${contractId}/fragments/${fragment.fragmentId}/approve`,
                {
                    reviewComment: getReviewValue(fragment.fragmentId),
                    releaseTxHash: chainResult.txHash,
                    providerAmountEth: Number(settlement.providerAmountEth),
                    clientRefundAmountEth: Number(settlement.clientRefundAmountEth)
                }
            );

            alert("Fragment approved and settled on-chain.");
            await Promise.all([load(), loadFragments(), loadMessages(), loadRating()]);
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to approve fragment");
        } finally {
            setFragmentsBusy(false);
        }
    };

    const onRejectFragment = async (fragment) => {
        try {
            setFragmentsBusy(true);

            await apiPostJson(
                `/api/inquiries/contracts/${contractId}/fragments/${fragment.fragmentId}/reject`,
                {
                    reviewComment: getReviewValue(fragment.fragmentId)
                }
            );

            alert("Fragment rejected successfully.");
            await Promise.all([load(), loadFragments(), loadMessages(), loadRating()]);
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to reject fragment");
        } finally {
            setFragmentsBusy(false);
        }
    };

    const onSubmitRating = async () => {
        if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
            alert("Please select rating from 1 to 5.");
            return;
        }

        try {
            setRatingBusy(true);

            await apiPostJson(`/api/valuation/contract/${contractId}/user`, {
                userRating: ratingValue,
                userRatingComment: ratingComment?.trim() || ""
            });

            alert("Rating submitted successfully.");
            await Promise.all([load(), loadRating()]);
        } catch (e) {
            console.error(e);
            alert(e?.message ?? "Failed to submit rating");
        } finally {
            setRatingBusy(false);
        }
    };

    const canProviderSubmitForMilestone = (milestone) => {
        if (!isProvider) return false;
        if (!item) return false;
        if (busy || fragmentsBusy) return false;
        if (!item.chainProjectId) return false;
        if (!item.fundedAmountEth || item.status === "PendingFunding") return false;
        if (item.status === "Completed" || item.status === "Closed") return false;
        if (milestone.status === "Released" || milestone.status === "ReleasedPartial") return false;
        if (
            fragmentsData?.fragments?.some(
                (f) =>
                    Number(f.milestoneId) === Number(milestone.milestoneId) &&
                    f.status === "Submitted"
            )
        ) {
            return false;
        }

        return true;
    };

    const canClientReviewFragment = (fragment) => {
        if (!isClient) return false;
        if (!item?.chainProjectId) return false;
        if (!item?.fundedAmountEth || item.status === "PendingFunding") return false;
        if (fragmentsBusy) return false;
        return fragment.status === "Submitted";
    };

    const resolveFileHref = (filePath) => {
        if (!filePath) return null;
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) return filePath;
        return `https://localhost:7278${filePath}`;
    };

    const getFragmentStatusColor = (status) => {
        if (status === "Approved" || status === "ApprovedPartial") return "success";
        if (status === "Rejected" || status === "UnderRevision") return "error";
        if (status === "Submitted") return "warning";
        return "default";
    };

    const getFragmentStatusStyles = (status, variant = "latest") => {
        if (status === "Approved" || status === "ApprovedPartial") {
            return {
                headerBg: "#ecfdf5",
                cardBg: variant === "latest" ? "#f0fdf4" : "#f7fef9",
                borderColor: "#86efac"
            };
        }

        if (status === "Rejected" || status === "UnderRevision") {
            return {
                headerBg: "#fef2f2",
                cardBg: variant === "latest" ? "#fff5f5" : "#fff8f8",
                borderColor: "#fca5a5"
            };
        }

        if (status === "Submitted") {
            return {
                headerBg: "#fffbeb",
                cardBg: variant === "latest" ? "#fffdf4" : "#fffef8",
                borderColor: "#fcd34d"
            };
        }

        return {
            headerBg: "#f8fafc",
            cardBg: variant === "latest" ? "#fcfffe" : "#fafafa",
            borderColor: "#cbd5e1"
        };
    };

    const renderFragmentCard = (fragment, variant = "latest") => {
        const canReview = canClientReviewFragment(fragment);
        const fileHref = resolveFileHref(fragment.filePath);
        const statusStyles = getFragmentStatusStyles(fragment.status, variant);

        return (
            <Paper
                key={fragment.fragmentId}
                variant="outlined"
                sx={{
                    p: 0,
                    borderRadius: 2.5,
                    bgcolor: statusStyles.cardBg,
                    borderColor: statusStyles.borderColor,
                    overflow: "hidden"
                }}
            >
                <Box sx={{ px: 1.5, py: 1.1, bgcolor: statusStyles.headerBg, borderBottom: "1px solid", borderColor: statusStyles.borderColor }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                        <Box>
                            <Typography sx={{ fontWeight: 900 }}>
                                {fragment.title || `Fragment #${fragment.fragmentId}`}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Submitted at: {safeDate(fragment.submittedAt)}
                            </Typography>
                        </Box>

                        <Chip
                            label={fragment.status || "Unknown"}
                            color={getFragmentStatusColor(fragment.status)}
                            variant="filled"
                            sx={{ fontWeight: 800 }}
                        />
                    </Stack>
                </Box>

                <Box sx={{ p: 1.5 }}>
                    <Stack spacing={1}>
                        <Box
                            sx={{
                                p: 1.25,
                                border: "1px solid",
                                borderColor: "rgba(15, 23, 42, 0.08)",
                                bgcolor: "rgba(255,255,255,0.72)"
                            }}
                        >
                            <Typography variant="body2" sx={{ opacity: 0.7, mb: 0.35 }}>
                                Description
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {fragment.description || "—"}
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.15,
                                    border: "1px solid",
                                    borderColor: "rgba(15, 23, 42, 0.08)",
                                    bgcolor: "rgba(255,255,255,0.72)"
                                }}
                            >
                                <Typography variant="caption" sx={{ display: "block", opacity: 0.65 }}>
                                    File
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                    {fileHref ? (
                                        <a href={fileHref} target="_blank" rel="noreferrer">
                                            Open file
                                        </a>
                                    ) : "—"}
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    flex: 1,
                                    p: 1.15,
                                    border: "1px solid",
                                    borderColor: "rgba(15, 23, 42, 0.08)",
                                    bgcolor: "rgba(255,255,255,0.72)"
                                }}
                            >
                                <Typography variant="caption" sx={{ display: "block", opacity: 0.65 }}>
                                    Approved at
                                </Typography>
                                <Typography variant="body2">{safeDate(fragment.approvedAt)}</Typography>
                            </Box>
                        </Stack>

                        <Box
                            sx={{
                                p: 1.15,
                                border: "1px solid",
                                borderColor: "rgba(15, 23, 42, 0.08)",
                                bgcolor: "rgba(255,255,255,0.72)"
                            }}
                        >
                            <Typography variant="caption" sx={{ display: "block", opacity: 0.65 }}>
                                Review comment
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {fragment.reviewComment || "—"}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                p: 1.15,
                                border: "1px solid",
                                borderColor: "rgba(15, 23, 42, 0.08)",
                                bgcolor: "rgba(255,255,255,0.72)"
                            }}
                        >
                            <Typography variant="caption" sx={{ display: "block", opacity: 0.65 }}>
                                Transaction hash
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                {fragment.releaseTxHash || "—"}
                            </Typography>
                        </Box>

                        {canReview && (
                            <>
                                <TextField
                                    label="Review comment"
                                    multiline
                                    minRows={2}
                                    fullWidth
                                    value={getReviewValue(fragment.fragmentId)}
                                    onChange={(e) =>
                                        setReviewValue(fragment.fragmentId, e.target.value)
                                    }
                                    disabled={fragmentsBusy}
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => onRejectFragment(fragment)}
                                        disabled={fragmentsBusy}
                                        sx={{ fontWeight: 800 }}
                                    >
                                        {fragmentsBusy ? "Please wait..." : "Reject"}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() => onApproveFragment(fragment)}
                                        disabled={fragmentsBusy}
                                        sx={{ fontWeight: 800 }}
                                    >
                                        {fragmentsBusy ? "Please wait..." : "Approve"}
                                    </Button>
                                </Stack>
                            </>
                        )}
                    </Stack>
                </Box>
            </Paper>
        );
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
                            Smart contract: {item.smartContractAddress || ESCROW_ADDRESS || DEFAULT_ESCROW_ADDRESS}
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
                        {item.milestones.map((m) => (
                            <Paper key={m.milestoneId} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                                <Stack spacing={1.2}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            Milestone #{m.milestoneNo}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{ mt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                        >
                                            Task: {m.requirementDescription || "No task description provided."}
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
                                        {fragmentsData?.fragments?.some(
                                            (f) =>
                                                Number(f.milestoneId) === Number(m.milestoneId) &&
                                                f.status === "Submitted"
                                        ) && (
                                            <Typography variant="body2" sx={{ mt: 0.75, color: "warning.main", fontWeight: 700 }}>
                                                A fragment for this milestone is already submitted and waiting for approval.
                                            </Typography>
                                        )}
                                    </Box>

                                    {canProviderSubmitForMilestone(m) && (
                                        <Box sx={{ width: "100%", mt: 1 }}>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Typography sx={{ fontWeight: 800, mb: 1 }}>
                                                Submit fragment
                                            </Typography>

                                            <Stack spacing={1.2}>
                                                <TextField
                                                    label="Fragment title"
                                                    fullWidth
                                                    value={getSubmitForm(m.milestoneNo).title}
                                                    onChange={(e) =>
                                                        setSubmitFormValue(m.milestoneNo, "title", e.target.value)
                                                    }
                                                    disabled={busy}
                                                />

                                                <TextField
                                                    label="Fragment description"
                                                    fullWidth
                                                    multiline
                                                    minRows={3}
                                                    value={getSubmitForm(m.milestoneNo).description}
                                                    onChange={(e) =>
                                                        setSubmitFormValue(m.milestoneNo, "description", e.target.value)
                                                    }
                                                    disabled={busy}
                                                />

                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    disabled={busy}
                                                >
                                                    {getSubmitForm(m.milestoneNo).file
                                                        ? `Selected: ${getSubmitForm(m.milestoneNo).file.name}`
                                                        : "Choose file"}
                                                    <input
                                                        hidden
                                                        type="file"
                                                        onChange={(e) =>
                                                            setSubmitFormValue(
                                                                m.milestoneNo,
                                                                "file",
                                                                e.target.files?.[0] ?? null
                                                            )
                                                        }
                                                    />
                                                </Button>

                                                <Stack direction="row" justifyContent="flex-end">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => onSubmitFragment(m.milestoneNo)}
                                                        disabled={busy}
                                                        sx={{ fontWeight: 800 }}
                                                    >
                                                        {busy ? "Submitting..." : "Submit fragment"}
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1.2 }}>
                        Submitted Fragments
                    </Typography>

                    {fragmentsLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : fragmentsErr ? (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Fragment error</Typography>
                            <Typography>{fragmentsErr}</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={1.2}>
                            {!fragmentGroups.some((group) => group.fragments.length) ? (
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                        No fragments submitted yet.
                                    </Typography>
                                </Paper>
                            ) : (
                                fragmentGroups
                                    .filter((group) => group.fragments.length)
                                    .map((group) => {
                                        const expanded = !!expandedFragmentMilestones[group.milestoneId];
                                        const historicalFragments = expanded
                                            ? group.fragments.slice(1)
                                            : [];

                                        return (
                                            <Paper
                                                key={group.milestoneId}
                                                variant="outlined"
                                                sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 2,
                                                        py: 1.5,
                                                        bgcolor: "#f8fafc",
                                                        borderBottom: "1px solid",
                                                        borderColor: "divider"
                                                    }}
                                                >
                                                    <Stack
                                                        direction={{ xs: "column", sm: "row" }}
                                                        spacing={1}
                                                        justifyContent="space-between"
                                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                                    >
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 900 }}>
                                                                Milestone #{group.milestoneNo}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ opacity: 0.75, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                            >
                                                                Task: {group.requirementDescription || "No task description provided."}
                                                            </Typography>
                                                        </Box>

                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            <Chip
                                                                label={`${group.fragments.length} fragment${group.fragments.length === 1 ? "" : "s"}`}
                                                                variant="outlined"
                                                            />
                                                            {group.hasHistory && (
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    onClick={() => toggleFragmentMilestone(group.milestoneId)}
                                                                    sx={{ fontWeight: 800 }}
                                                                >
                                                                    {expanded ? "Hide history" : "Expand history"}
                                                                </Button>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Box>

                                                <Box sx={{ p: 1.5 }}>
                                                    <Stack spacing={1.2}>
                                                        {group.latestFragment && renderFragmentCard(group.latestFragment)}

                                                        {expanded && historicalFragments.length > 0 && (
                                                            <Box sx={{ pt: 0.5 }}>
                                                                <Typography sx={{ fontWeight: 800, mb: 1 }}>
                                                                    Previous fragments
                                                                </Typography>
                                                                <Stack spacing={1}>
                                                                    {historicalFragments.map((fragment) =>
                                                                        renderFragmentCard(fragment, "history")
                                                                    )}
                                                                </Stack>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        );
                                    })
                            )}
                        </Stack>
                    )}

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
                                    Messages are disabled only after the contract is completed.
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

                    <Divider sx={{ my: 2 }} />

                    <Typography sx={{ fontWeight: 900, mb: 1.2 }}>
                        Rating
                    </Typography>

                    {ratingLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : ratingErr ? (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Rating error</Typography>
                            <Typography>{ratingErr}</Typography>
                        </Paper>
                    ) : hasExistingRating ? (
                        <Paper variant="outlined" sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: "#f0fdfa", borderBottom: "1px solid", borderColor: "divider" }}>
                                <Typography sx={{ fontWeight: 900 }}>
                                    Rating submitted
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    Your feedback for this contract has already been saved.
                                </Typography>
                            </Box>

                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "#fcfffe"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5 }}>
                                            Your rating
                                        </Typography>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                                            <Rating
                                                value={Number(ratingData?.userRating ?? 0)}
                                                readOnly
                                            />
                                            <Typography sx={{ fontWeight: 800 }}>
                                                {ratingData?.userRating ?? "—"}/5
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <Box
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "#ffffff"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5 }}>
                                            Comment
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                            {ratingData?.userRatingComment || "No comment provided."}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "#f8fafc"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.75 }}>
                                            System rating
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                                            {ratingData?.systemRating ?? "—"}/5
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
                                            {ratingData?.systemRatingReason || "No system rating explanation available."}
                                        </Typography>
                                    </Box>

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                        <Box sx={{ flex: 1, p: 1.25, border: "1px solid", borderColor: "divider", bgcolor: "#fafafa" }}>
                                            <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
                                                Created
                                            </Typography>
                                            <Typography variant="body2">{safeDate(ratingData?.createdAt)}</Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, p: 1.25, border: "1px solid", borderColor: "divider", bgcolor: "#fafafa" }}>
                                            <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>
                                                Updated
                                            </Typography>
                                            <Typography variant="body2">{safeDate(ratingData?.updatedAt)}</Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Paper>
                    ) : canRate ? (
                        <Paper variant="outlined" sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid", borderColor: "divider" }}>
                                <Typography sx={{ fontWeight: 900 }}>
                                    Leave your rating
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    Share a short evaluation of the provider after the completed contract.
                                </Typography>
                            </Box>

                            <Box sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "#fcfffe"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ mb: 0.75, opacity: 0.8 }}>
                                            Your rating
                                        </Typography>
                                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }}>
                                            <Rating
                                                value={ratingValue}
                                                onChange={(_, newValue) => setRatingValue(newValue ?? 0)}
                                            />
                                            <Typography sx={{ fontWeight: 800 }}>
                                                {ratingValue ? `${ratingValue}/5 selected` : "Select a rating"}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <TextField
                                        label="Comment"
                                        fullWidth
                                        multiline
                                        minRows={4}
                                        value={ratingComment}
                                        onChange={(e) => setRatingComment(e.target.value)}
                                        disabled={ratingBusy}
                                        helperText="Optional, but useful if you want to explain the result."
                                    />

                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button
                                            variant="contained"
                                            onClick={onSubmitRating}
                                            disabled={ratingBusy || !ratingValue}
                                            sx={{ fontWeight: 800, minWidth: 160 }}
                                        >
                                            {ratingBusy ? "Submitting..." : "Submit rating"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper variant="outlined" sx={{ p: 0, borderRadius: 2.5, overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: "#f8fafc", borderBottom: "1px solid", borderColor: "divider" }}>
                                <Typography sx={{ fontWeight: 900 }}>
                                    Rating unavailable
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                                    The client can submit a rating after the contract reaches completed status.
                                </Typography>
                            </Box>

                            {ratingData ? (
                                <Box sx={{ p: 2 }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "divider",
                                            bgcolor: "#fafafa"
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5 }}>
                                            System rating
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                                            {ratingData?.systemRating ?? "—"}/5
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.8, whiteSpace: "pre-wrap" }}>
                                            {ratingData?.systemRatingReason || "No system rating explanation available."}
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                        No rating data available yet.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}
                </Paper>
            )}
        </Container>
    );
}
