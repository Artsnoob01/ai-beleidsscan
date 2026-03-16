// Supabase REST API helper for edge functions (no SDK needed)

function getConfig() {
  const url = Netlify.env.get("SUPABASE_URL");
  const key = Netlify.env.get("SUPABASE_SERVICE_KEY");
  return { url, key };
}

function headers(key) {
  return {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Prefer": "return=representation",
  };
}

export async function supabaseInsert(table, data) {
  const { url, key } = getConfig();
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("Supabase insert failed:", res.status, await res.text());
    return null;
  }

  const rows = await res.json();
  return rows?.[0] ?? null;
}

export async function supabaseUpdate(table, id, data) {
  const { url, key } = getConfig();
  if (!url || !key) return null;

  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: headers(key),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("Supabase update failed:", res.status, await res.text());
    return null;
  }

  const rows = await res.json();
  return rows?.[0] ?? null;
}
