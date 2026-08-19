// ─────────────────────────────────────────────────────────────
//  PaySphere API Client
//  All backend communication goes through this module.
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Get the stored JWT token */
export function getToken() {
  return sessionStorage.getItem('paysphere_token');
}

/** Save JWT token to sessionStorage */
export function setToken(token) {
  sessionStorage.setItem('paysphere_token', token);
}

/** Remove JWT token (logout) */
export function clearToken() {
  sessionStorage.removeItem('paysphere_token');
}

/** Build auth headers */
function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Generic fetch wrapper */
async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
  } catch {
    // Network error — server is not running
    throw new Error('Cannot connect to the server. Make sure the backend is running on port 3001.');
  }

  // Try to parse JSON — guard against empty or HTML responses
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(
      res.ok
        ? 'Server returned an unexpected response. Please try again.'
        : `Server error (${res.status}). Make sure the backend is running and the DATABASE_URL in .env is correct.`
    );
  }

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;

}

// ─────────────────────────────────────────────────────────────
//  Auth API
// ─────────────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name, email, phone, password, referredBy) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password, referredBy }),
  });
}

export async function apiForgotPassword(email) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function apiResetPassword(email, code, password) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, code, password }),
  });
}

export async function apiLogout() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

// ─────────────────────────────────────────────────────────────
//  Wallet API
// ─────────────────────────────────────────────────────────────

export async function apiGetBalance() {
  return apiFetch('/wallet/balance');
}

export async function apiGetReferrals() {
  return apiFetch('/wallet/referrals');
}

// ─────────────────────────────────────────────────────────────
//  Paystack Payment API
// ─────────────────────────────────────────────────────────────

/** Initialize a Paystack transaction — returns { reference, access_code } */
export async function apiPaystackInitialize(amount, email) {
  return apiFetch('/paystack/initialize', {
    method: 'POST',
    body: JSON.stringify({ amount, email }),
  });
}

/** Verify a completed Paystack transaction and credit the wallet */
export async function apiPaystackVerify(reference) {
  return apiFetch('/paystack/verify', {
    method: 'POST',
    body: JSON.stringify({ reference }),
  });
}

// ─────────────────────────────────────────────────────────────
//  Transactions API
// ─────────────────────────────────────────────────────────────

export async function apiGetTransactions() {
  return apiFetch('/transactions');
}

export async function apiCreateTransaction(details) {
  return apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}

// ─────────────────────────────────────────────────────────────
//  Settings API
// ─────────────────────────────────────────────────────────────

export async function apiGetSettings() {
  return apiFetch('/settings');
}

export async function apiUpdateSettings(settings) {
  return apiFetch('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// ─────────────────────────────────────────────────────────────
//  Notifications API
// ─────────────────────────────────────────────────────────────

export async function apiGetNotifications() {
  return apiFetch('/notifications');
}

export async function apiPushNotification(title, body, time) {
  return apiFetch('/notifications', {
    method: 'POST',
    body: JSON.stringify({ title, body, time }),
  });
}

export async function apiClearNotifications() {
  return apiFetch('/notifications', { method: 'DELETE' });
}

// ─────────────────────────────────────────────────────────────
//  VTpass API
// ─────────────────────────────────────────────────────────────

/** Fetch live service variations from backend proxy */
export async function apiGetServiceVariations(serviceID) {
  return apiFetch(`/vtpass/service-variations?serviceID=${encodeURIComponent(serviceID)}`);
}

/** Verify Smartcard / IUC Decoder number */
export async function apiVerifySmartcard(operator, smartcardNo) {
  return apiFetch(`/transactions/verify-smartcard?operator=${encodeURIComponent(operator)}&smartcardNo=${encodeURIComponent(smartcardNo)}`);
}

/** Verify Electricity Meter number */
export async function apiVerifyMeter(operator, meterNumber, meterType) {
  return apiFetch(`/transactions/verify-meter?operator=${encodeURIComponent(operator)}&meterNumber=${encodeURIComponent(meterNumber)}&meterType=${encodeURIComponent(meterType)}`);
}



