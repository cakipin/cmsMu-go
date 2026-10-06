const BLOCKED_TAGS =
  /<(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select)[\s\S]*?>[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select)\b[^>]*\/?\s*>/gi;
const EVENT_ATTRS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_URLS =
  /\s+(href|src)\s*=\s*(["'])\s*(?:javascript:|data:text\/html)[\s\S]*?\2/gi;
const STYLE_URLS =
  /\s+style\s*=\s*(["'])[^"']*(?:expression\s*\(|url\s*\(\s*['"]?\s*javascript:)[^"']*\1/gi;

export function sanitizeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(BLOCKED_TAGS, "")
    .replace(EVENT_ATTRS, "")
    .replace(DANGEROUS_URLS, "")
    .replace(STYLE_URLS, "");
}

export function cleanSlug(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

export function boundedText(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}
