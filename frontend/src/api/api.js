const API_BASE = process.env.REACT_APP_API_BASE ?? "https://localhost:7278";
export async function apiPostFormData(path, formData) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
            // ❗ ČIA specialiai nededam Content-Type
        },
        body: formData
    });

    const text = await res.text();
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
            `POST ${path} failed: ${res.status}`
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

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET ${path} failed: ${res.status} ${text}`);
    }
    return res.json();
}

export async function apiDelete(path) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const txt = await res.text().catch(() => "");
    if (!res.ok) throw new Error(txt || `DELETE ${path} failed: ${res.status}`);
}

export async function apiPutFormData(path, formData) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${path}`, {
        method: "PUT",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error(text || `PUT ${path} failed: ${res.status}`);
}

export async function apiPostNoBody(path) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const txt = await res.text().catch(() => "");
    if (!res.ok) throw new Error(txt || `POST ${path} failed: ${res.status}`);
}


//Atkomentuoti jei nuluz o virsuj istinrit. cia sitas veike su nuotraukom kai buvo pradzia
//const API_BASE = process.env.REACT_APP_API_BASE ?? "https://localhost:7278";
//// pakeisk į savo backend base (arba palik jei turi env)

//export async function apiGet(path) {
//    const token = localStorage.getItem("token");

//    const res = await fetch(`${API_BASE}${path}`, {
//        method: "GET",
//        headers: {
//            "Content-Type": "application/json",
//            ...(token ? { Authorization: `Bearer ${token}` } : {})
//        }
//    });

//    if (!res.ok) {
//        const text = await res.text().catch(() => "");
//        throw new Error(`GET ${path} failed: ${res.status} ${text}`);
//    }
//    return res.json();
//}
