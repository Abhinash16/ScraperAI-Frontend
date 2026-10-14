// Turns a chat message into safe HTML, the way WhatsApp shows it: *bold*,
// _italic_, ~strike~, ```mono``` and `code`, plus the Markdown bots tend to
// write (**bold**, [text](url), "- " lists, "1. " lists, "> " quotes, "# "
// headings) and clickable links. The text is escaped first, so only the tags
// added here ever reach v-html.

const escapeHtml = (text) =>
  String(text || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<]+/gi;
const TRAILING_PUNCT_RE = /(?:[.,;:!?)\]]|&quot;|&#39;)+$/;

const link = (href, label) => {
  const url = /^www\./i.test(href) ? `https://${href}` : href;
  return `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`;
};

// Bold/italic/strike markers only count next to a word edge, so "2*3*4" or
// snake_case_names stay as they are.
const wrap = (html, marker, tag) => {
  const m = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^\\w${m}])${m}(?=\\S)(.+?\\S)${m}(?![\\w${m}])`, "g");
  return html.replace(re, (_, before, inner) => `${before}<${tag}>${inner}</${tag}>`);
};

function formatInline(line, keep) {
  let html = line;
  html = html.replace(/`([^`\n]+)`/g, (_, code) => keep(`<code>${code}</code>`));
  html = html.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, (_, label, href) =>
    keep(link(href, label)),
  );
  html = html.replace(URL_RE, (match) => {
    const trailing = (match.match(TRAILING_PUNCT_RE) || [""])[0];
    const href = trailing ? match.slice(0, -trailing.length) : match;
    return keep(link(href, href)) + trailing;
  });
  html = html.replace(/\*\*(?=\S)(.+?\S)\*\*/g, "<strong>$1</strong>");
  html = wrap(html, "*", "strong");
  html = wrap(html, "_", "em");
  html = wrap(html, "~", "s");
  return html;
}

export function formatChatText(text) {
  const kept = [];
  const keep = (html) => `\uE000${kept.push(html) - 1}\uE000`;

  let source = escapeHtml(String(text || "").replace(/\uE000/g, "").replace(/\r\n?/g, "\n"));
  source = source.replace(/```\n?([\s\S]*?)```/g, (_, code) =>
    keep(`<pre>${code.replace(/\n$/, "")}</pre>`),
  );

  const out = [];
  let list = null; // { tag, items }
  const closeList = () => {
    if (!list) return;
    out.push(`<${list.tag}>${list.items.map((i) => `<li>${i}</li>`).join("")}</${list.tag}>`);
    list = null;
  };

  source.split("\n").forEach((line) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const item = bullet || numbered;
    if (item) {
      const tag = bullet ? "ul" : "ol";
      if (list && list.tag !== tag) closeList();
      if (!list) list = { tag, items: [] };
      list.items.push(formatInline(item[1], keep));
      return;
    }
    closeList();
    const quote = line.match(/^\s*&gt;\s?(.*)$/);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    if (quote) out.push(`<blockquote>${formatInline(quote[1], keep)}</blockquote>`);
    else if (heading) out.push(`<strong>${formatInline(heading[1], keep)}</strong><br>`);
    else out.push(`${formatInline(line, keep)}<br>`);
  });
  closeList();

  return out
    .join("")
    .replace(/<br>$/, "")
    .replace(/\uE000(\d+)\uE000/g, (_, i) => kept[i])
    // Blocks already start and end on their own line.
    .replace(/<br>(?=<(?:ul|ol|blockquote|pre)>)/g, "")
    .replace(/<\/pre><br>/g, "</pre>");
}
