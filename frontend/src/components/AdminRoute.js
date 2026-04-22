import { Navigate } from "react-router-dom";
import { getActiveToken } from "../utils/authSession";

function getUserRoleFromToken() {
    const token = getActiveToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return (
            payload.role ||
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            null
        );
    } catch {
        return null;
    }
}

export default function AdminRoute({ children }) {
    const token = getActiveToken();
    const role = getUserRoleFromToken();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (role !== "Admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}
