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
      const prevChunk = chunks[chunks.length - 1];
      const overlapText = prevChunk.slice(-overlap);
      chunks.push(overlapText + chunk);
    } else {
      chunks.push(chunk);
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

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else",
  "of", "to", "in", "on", "for", "with", "at", "by", "from",
  "up", "down", "out", "over", "under", "again", "further",
  "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "this", "that", "these", "those",
  "it", "its", "as", "not", "no", "nor",
  "can", "will", "just", "should", "now",
  "you", "your", "yours", "we", "our", "ours",
  "they", "their", "theirs",
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
    .map(w => w.trim())
    .filter(w => w && !STOP_WORDS.has(w));

  if (keywords.length === 0) return [];

  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const lowerChunk = chunk.toLowerCase();

    for (const word of keywords) {
      const matches = lowerChunk.match(
        new RegExp(`\\b${escapeRegex(word)}\\b`, "g")
      );
      if (matches) score += matches.length;
    }

    return { chunk, score };
  });

  return scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.chunk);
};

const escapeRegex = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
