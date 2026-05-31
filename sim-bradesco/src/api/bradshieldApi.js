export class ApiError extends Error {
  constructor(message, statusCode, payload) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}

function buildUrl(baseUrl, path) {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function readPayload(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { mensagem: text };
  }
}

function getMessage(payload, fallback) {
  return payload?.mensagem || payload?.Mensagem || payload?.message || fallback;
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value.includes("seguro") || value.includes("safe")) {
    return "seguro";
  }

  if (value.includes("fraud")) {
    return "fraudulento";
  }

  if (value.includes("alert") || value.includes("suspeit") || value.includes("perigo")) {
    return "suspeito";
  }

  return "desconhecido";
}

export async function requestJson(baseUrl, path, options = {}) {
  const response = await fetch(buildUrl(baseUrl, path), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(getMessage(payload, "Erro na API BradShield."), response.status, payload);
  }

  return payload;
}

export async function verifyNumber(baseUrl, number) {
  const normalizedNumber = number.trim();
  const encodedNumber = encodeURIComponent(normalizedNumber);
  const response = await fetch(buildUrl(baseUrl, `/api/verificacao/checar/${encodedNumber}`), {
    headers: { Accept: "application/json" },
  });
  const payload = await readPayload(response);
  const apiStatus = payload?.status || payload?.Status;

  if (response.ok) {
    let channel = null;

    try {
      channel = await requestJson(baseUrl, `/api/canais/${encodedNumber}`);
    } catch {
      channel = null;
    }

    return {
      numero: normalizedNumber,
      status: normalizeStatus(apiStatus || "Seguro"),
      statusApi: apiStatus || "Seguro",
      mensagem:
        getMessage(payload, "Este número é de um banco oficial. Pode atender!") ||
        "Este número é de um banco oficial. Pode atender!",
      instituicao: channel?.instituicao || channel?.Instituicao || null,
      seguro: true,
      checkedAt: new Date().toISOString(),
    };
  }

  if (response.status === 400 || response.status === 404) {
    return {
      numero: normalizedNumber,
      status: normalizeStatus(apiStatus || "Alerta"),
      statusApi: apiStatus || "Alerta",
      mensagem: getMessage(
        payload,
        "Número não encontrado na base oficial. Possível tentativa de golpe.",
      ),
      instituicao: null,
      seguro: false,
      checkedAt: new Date().toISOString(),
    };
  }

  throw new ApiError(getMessage(payload, "Não foi possível verificar este número."), response.status, payload);
}

export async function listSafeNumbers(baseUrl) {
  const payload = await requestJson(baseUrl, "/api/numeros-seguros");

  return Array.isArray(payload) ? payload : [];
}

export async function saveSafeNumber(baseUrl, safeNumber, id) {
  const method = id ? "PUT" : "POST";
  const path = id ? `/api/numeros-seguros/${id}` : "/api/numeros-seguros";

  return requestJson(baseUrl, path, {
    method,
    body: JSON.stringify({
      numeroTelefone: safeNumber.numeroTelefone.trim(),
      instituicao: safeNumber.instituicao.trim(),
    }),
  });
}

export async function deleteSafeNumber(baseUrl, id) {
  await requestJson(baseUrl, `/api/numeros-seguros/${id}`, {
    method: "DELETE",
  });
}

export async function testConnection(baseUrl) {
  try {
    const payload = await requestJson(baseUrl, "/teste-banco");

    return {
      ok: true,
      message: payload?.mensagem || payload?.Mensagem || "API e banco conectados.",
    };
  } catch (error) {
    const response = await fetch(buildUrl(baseUrl, "/api/canais/__healthcheck__"), {
      headers: { Accept: "application/json" },
    });

    if (response.status === 200 || response.status === 404 || response.status === 400) {
      return {
        ok: true,
        message: "API respondeu e consultou a base de canais.",
      };
    }

    throw error;
  }
}
