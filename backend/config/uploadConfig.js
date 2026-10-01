// =====================================================
// UPLOAD / STORAGE CONFIGURATION
//
// Centralised, configurable constants for the document
// upload system. Nothing in uploadRoutes.js should
// hardcode a byte value or MIME list — it should all
// come from here so limits are easy to change later
// (via env vars, without touching route logic).
// =====================================================

// ---------------------------------------------------
// INDIVIDUAL FILE SIZE LIMIT
//
// Default: 20 MB per file.
//
// Reasoning: the total per-user quota is only 50 MB,
// so a single file should never be allowed to consume
// the majority of that quota in one upload. 20 MB is
// generous enough for a scanned PDF or a several-minute
// MP3/MP4 recording, while still leaving room for a user
// to store more than one file. Override with
// MAX_FILE_SIZE_MB if you need a different value.
// ---------------------------------------------------
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB) || 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ---------------------------------------------------
// TOTAL PER-USER STORAGE QUOTA
//
// Default: 50 MB per user (per product requirement).
// Override with MAX_USER_STORAGE_MB if needed.
// ---------------------------------------------------
const MAX_USER_STORAGE_MB = Number(process.env.MAX_USER_STORAGE_MB) || 50;
const MAX_USER_STORAGE_BYTES = MAX_USER_STORAGE_MB * 1024 * 1024;

// ---------------------------------------------------
// ALLOWED FILE TYPES
//
// Only PDF, MP3 and MP4 are accepted. Browsers /
// operating systems don't always agree on the exact
// MIME string for MP3, so we accept the common
// variants but map everything to one of three logical
// kinds: "pdf", "mp3", "mp4".
// ---------------------------------------------------
const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "audio/mpeg",
  "video/mp4",
];

// Mimetypes (as sent by the browser in the multipart
// request) that we still accept, mapped to a logical
// kind. This list is intentionally narrow — no images,
// no other audio/video containers.
const MIME_TO_KIND = {
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "video/mp4": "mp4",
};

// Allowed extensions per logical kind, used as a second,
// independent check alongside MIME type (defense in depth
// — never rely on extension alone).
const KIND_TO_EXTENSIONS = {
  pdf: [".pdf"],
  mp3: [".mp3"],
  mp4: [".mp4"],
};

function getKindFromMimetype(mimetype) {
  return MIME_TO_KIND[(mimetype || "").toLowerCase()] || null;
}

function isExtensionAllowedForKind(filename, kind) {
  const ext = require("path").extname(filename || "").toLowerCase();
  const allowed = KIND_TO_EXTENSIONS[kind] || [];
  return allowed.includes(ext);
}

// ---------------------------------------------------
// FILE SIGNATURE ("MAGIC BYTES") VALIDATION
//
// We never trust the extension or the browser-supplied
// MIME type alone. Before a file is accepted, we inspect
// its actual first bytes on disk and confirm they match
// the claimed kind.
//
// PDF  -> starts with "%PDF-"                (25 50 44 46 2D)
// MP4  -> "ftyp" box type at byte offset 4    (.. .. .. .. 66 74 79 70)
// MP3  -> either an ID3v2 tag ("ID3") at the
//         start, or a valid MPEG audio frame
//         sync word (11 bits of 1s) at the
//         start of the file.
// ---------------------------------------------------
function detectSignatureKind(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // PDF: "%PDF-"
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "pdf";
  }

  // MP4: box size (4 bytes) + "ftyp"
  if (
    buffer.length >= 8 &&
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    return "mp4";
  }

  // MP3: ID3v2 tag
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) {
    return "mp3";
  }

  // MP3: raw MPEG audio frame sync (11 set bits: 0xFF Ex/Fx..)
  if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) {
    return "mp3";
  }

  return null;
}

module.exports = {
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  MAX_USER_STORAGE_MB,
  MAX_USER_STORAGE_BYTES,
  SUPPORTED_FILE_TYPES,
  MIME_TO_KIND,
  KIND_TO_EXTENSIONS,
  getKindFromMimetype,
  isExtensionAllowedForKind,
  detectSignatureKind,
};
