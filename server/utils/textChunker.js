export const chunkText = (
  text,
  chunkSize = 500,
  overlap = 50
) => {
  if (!text || typeof text !== "string") return [];

  const normalizedText = text.replace(/\r\n/g, "\n").trim();

  const paragraphs = normalizedText
    .split(/\n{1,2}/)
    .map(p => p.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = "";

  const pushChunkWithOverlap = (chunk) => {
    if (!chunk) return;

    if (chunks.length > 0 && overlap > 0) {
      const prev = chunks[chunks.length - 1].content;
      const overlapText = prev.slice(-overlap);
      chunks.push({ content: overlapText + chunk });
    } else {
      chunks.push({ content: chunk });
    }
  };

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    } else {
      if (currentChunk) {
        pushChunkWithOverlap(currentChunk);
        currentChunk = "";
      }

      if (para.length <= chunkSize) {
        currentChunk = para;
      } else {
        const words = para.split(/\s+/);
        let temp = "";

        for (const word of words) {
          if ((temp + " " + word).length > chunkSize) {
            pushChunkWithOverlap(temp.trim());
            temp = word;
          } else {
            temp += (temp ? " " : "") + word;
          }
        }

        if (temp) currentChunk = temp;
      }
    }
  }

  if (currentChunk) pushChunkWithOverlap(currentChunk);

  return chunks;
};

/* =========================
   RELEVANCE SEARCH
]);

export const findRelevantChunks = (
  chunks,
  query,
  maxResults = 5
) => {
  if (!Array.isArray(chunks) || !query) return [];

  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w && !STOP_WORDS.has(w));

  const scored = chunks.map(chunk => {
    let score = 0;
    const text = chunk.content.toLowerCase();

    for (const word of keywords) {
      const matches = text.match(
        new RegExp(`\\b${escapeRegex(word)}\\b`, "g")
      );
      if (matches) score += matches.length;
    }

    return { chunk, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.chunk);
};

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
