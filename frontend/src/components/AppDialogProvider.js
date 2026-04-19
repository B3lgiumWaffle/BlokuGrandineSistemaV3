import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
    alpha,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

const AppDialogContext = createContext(null);

const VARIANT_META = {
    success: {
        title: "Success",
        confirmText: "OK",
        color: "#0f766e",
        accent: "#d1fae5",
        Icon: CheckCircleRoundedIcon
    },
    error: {
        title: "Something went wrong",
        confirmText: "OK",
        color: "#b91c1c",
        accent: "#fee2e2",
        Icon: ErrorOutlineRoundedIcon
    },
    warning: {
        title: "Attention",
        confirmText: "OK",
        color: "#b45309",
        accent: "#fef3c7",
        Icon: WarningAmberRoundedIcon
    },
    info: {
        title: "Information",
        confirmText: "OK",
        color: "#0f766e",
        accent: "#ccfbf1",
        Icon: InfoOutlinedIcon
    },
    confirm: {
        title: "Please confirm",
        confirmText: "Confirm",
        cancelText: "Cancel",
        color: "#0f172a",
        accent: "#e2e8f0",
        Icon: HelpOutlineRoundedIcon
    }
};

function normalizeConfig(input, fallbackVariant) {
    if (typeof input === "string") {
        return { message: input, variant: fallbackVariant };
    }

    return {
        ...input,
        variant: input?.variant ?? fallbackVariant
    };
}

export function AppDialogProvider({ children }) {
    const resolverRef = useRef(null);
    const [dialog, setDialog] = useState(null);

    const closeDialog = useCallback((result) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setDialog(null);
        resolve?.(result);
    }, []);

    const openDialog = useCallback((config) => new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialog(config);
    }), []);

    const api = useMemo(() => ({
        alert: (input) => openDialog({
            mode: "alert",
            ...normalizeConfig(input, "info")
        }),
        confirm: async (input) => {
            const result = await openDialog({
                mode: "confirm",
                ...normalizeConfig(input, "confirm")
            });

            return !!result;
        }
    }), [openDialog]);

    const meta = dialog ? VARIANT_META[dialog.variant] ?? VARIANT_META.info : null;
    const Icon = meta?.Icon ?? InfoOutlinedIcon;

    return (
        <AppDialogContext.Provider value={api}>
            {children}

            <Dialog
                open={!!dialog}
                onClose={() => closeDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        overflow: "hidden",
                        borderRadius: 4,
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 36px 90px rgba(15, 23, 42, 0.22)",
                        backgroundImage: "none"
                    }
                }}
            >
                {dialog && (
                    <>
                        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: "18px",
                                        display: "grid",
                                        placeItems: "center",
                                        bgcolor: meta.accent,
                                        color: meta.color,
                                        boxShadow: `inset 0 0 0 1px ${alpha(meta.color, 0.08)}`
                                    }}
                                >
                                    <Icon />
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="overline" sx={{ letterSpacing: 1.2, color: "text.secondary" }}>
                                        System message
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
                                        {dialog.title || meta.title}
                                    </Typography>
                                </Box>
                            </Stack>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pt: 0.5, pb: 2 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: "text.secondary",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    lineHeight: 1.7
                                }}
                            >
                                {dialog.message}
                            </Typography>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: "flex-end" }}>
                            {dialog.mode === "confirm" && (
                                <Button
                                    variant="text"
                                    onClick={() => closeDialog(false)}
                                    sx={{ fontWeight: 800 }}
                                >
                                    {dialog.cancelText || meta.cancelText || "Cancel"}
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                onClick={() => closeDialog(true)}
                                sx={{
                                    minWidth: 128,
                                    fontWeight: 900,
                                    bgcolor: meta.color,
                                    "&:hover": {
                                        bgcolor: meta.color
                                    }
                                }}
                            >
                                {dialog.confirmText || meta.confirmText}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </AppDialogContext.Provider>
    );
}

export function useAppDialog() {
    const context = useContext(AppDialogContext);

    if (!context) {
        throw new Error("useAppDialog must be used inside AppDialogProvider");
    }

    return context;
}
