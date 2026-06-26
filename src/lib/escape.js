/**
 * Escapea un string para ser inyectado de forma segura dentro de innerHTML.
 * Reemplaza los caracteres peligrosos: & < > " '
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapea y valida que una URL sólo use http(s) para evitar javascript: schemes.
 * Devuelve '' si el esquema no es seguro.
 */
export function safeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/[^/]/.test(trimmed)) return trimmed; // rutas internas relativas
  return '';
}

/**
 * Escapea los elementos de un array y los devuelve escapados.
 */
export function escapeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => escapeHtml(item));
}