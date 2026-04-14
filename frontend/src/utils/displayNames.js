export function createDisplayNumberMap(items, getId) {
    const map = new Map();

    (Array.isArray(items) ? items : []).forEach((item, index) => {
        const id = getId(item);
        if (id == null) return;

        const key = String(id);
        if (!map.has(key)) {
            map.set(key, index + 1);
        }
    });

    return map;
}

export function getDisplayNumber(map, id) {
    if (id == null) return null;
    return map.get(String(id)) ?? null;
}

export function formatContractLabel(item, displayNumber) {
    const prefix = displayNumber != null ? `Contract #${displayNumber}` : "Contract";
    const title = (item?.listingTitle ?? "").trim();
    return title ? `${prefix} - ${title}` : prefix;
}

const STATUS_LABELS = {
    contract: {
        PendingFunding: "Pending funding",
        Funded: "Funded",
        InProgress: "In progress",
        WaitingForApproval: "Waiting for approval",
        UnderRevision: "Under revision",
        Completed: "Completed",
        Closed: "Closed",
    },
    milestone: {
        Pending: "Pending",
        Submitted: "Submitted",
        UnderRevision: "Under revision",
        Released: "Released",
        ReleasedPartial: "Partially released",
    },
    fragment: {
        Submitted: "Submitted",
        Rejected: "Rejected",
        Approved: "Approved",
        ApprovedPartial: "Approved with partial payout",
        UnderRevision: "Under revision",
    },
    inquiry: {
        PENDING: "Pending",
        ACCEPTED: "Accepted",
        FUNDED: "Funded",
        IN_PROGRESS: "In progress",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    },
};

function humanizeStatus(value) {
    const text = String(value ?? "").trim();
    if (!text) return "Unknown";

    return text
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .replace(/^./, (char) => char.toUpperCase());
}

export function formatStatusLabel(status, category = "contract") {
    const normalized = String(status ?? "").trim();
    if (!normalized) return "Unknown";

    return STATUS_LABELS[category]?.[normalized] ?? humanizeStatus(normalized);
}

export function getInquiryStatusMeta(status, isConfirmed) {
    const normalized = String(status ?? "").trim().toUpperCase();

    if (normalized === "ACCEPTED" || isConfirmed) {
        return { label: "Accepted", color: "success", variant: "filled" };
    }

    if (normalized === "PENDING") {
        return { label: "Pending", color: "default", variant: "outlined" };
    }

    if (normalized === "FUNDED") {
        return { label: "Funded", color: "primary", variant: "filled" };
    }

    if (normalized === "IN_PROGRESS") {
        return { label: "In progress", color: "warning", variant: "filled" };
    }

    if (normalized === "COMPLETED") {
        return { label: "Completed", color: "success", variant: "filled" };
    }

    if (normalized === "CANCELLED") {
        return { label: "Cancelled", color: "error", variant: "outlined" };
    }

    return {
        label: isConfirmed ? "Accepted" : formatStatusLabel(normalized, "inquiry"),
        color: isConfirmed ? "success" : "default",
        variant: isConfirmed ? "filled" : "outlined",
    };
}

export function getListingReviewStatusLabel(isActivated) {
    return Number(isActivated) === 1 ? "Approved" : "Pending review";
}
