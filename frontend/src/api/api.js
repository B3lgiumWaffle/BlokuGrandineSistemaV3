const API_BASE = process.env.REACT_APP_API_BASE ?? "https://localhost:7278";

async function parseResponse(res, fallbackMessage) {
    const text = await res.text().catch(() => "");
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        throw new Error(
            (data && (data.message || data.title)) ||
            text ||
            fallbackMessage ||
            `Request failed: ${res.status}`
        );
    }

    return data;
}

export async function apiGet(path) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    return parseResponse(res, `GET ${path} failed`);
}

export async function apiDelete(path) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    await parseResponse(res, `DELETE ${path} failed`);
}

export async function apiPostNoBody(path) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    return parseResponse(res, `POST ${path} failed`);
}

export async function apiPost(path, body = null) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body ? { "Content-Type": "application/json" } : {})
        },
        body: body ? JSON.stringify(body) : null
    });

    return parseResponse(res, `POST ${path} failed`);
}

export async function apiPostJson(path, body) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });

    return parseResponse(res, `POST ${path} failed`);
}

export async function apiPutFormData(path, formData) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
    });

    await parseResponse(res, `PUT ${path} failed`);
}

export async function apiPostFormData(path, formData) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
    });

    return parseResponse(res, `POST ${path} failed`);
}