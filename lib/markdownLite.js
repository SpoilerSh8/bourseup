function parseInline(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), bold: false });
  return parts.length ? parts : [{ text, bold: false }];
}

export function parseLetter(raw) {
  const lines = (raw || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let buffer = [];

  function flush() {
    if (buffer.length) {
      blocks.push({ type: "p", runs: parseInline(buffer.join(" ")) });
      buffer = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: `h${heading[1].length}`, runs: parseInline(heading[2]) });
      continue;
    }
    // Une ligne entièrement en gras est souvent utilisée comme sous-titre (ex: "**Introduction**")
    const boldLine = line.match(/^\*\*(.+)\*\*$/);
    if (boldLine && boldLine[1].length < 80) {
      flush();
      blocks.push({ type: "h3", runs: [{ text: boldLine[1], bold: true }] });
      continue;
    }
    buffer.push(line);
  }
  flush();
  return blocks;
}
