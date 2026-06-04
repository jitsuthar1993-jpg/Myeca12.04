// Lightweight magic-byte validation so an upload's real content must match its declared MIME
// type. Operates on the in-memory buffer (the document upload paths use multer memoryStorage),
// closing the content-type spoofing gap left by trusting the client-provided `mimetype`.

type Signature = { mimes: string[]; test: (buffer: Buffer) => boolean };

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

const SIGNATURES: Signature[] = [
  { mimes: ["application/pdf"], test: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]) }, // %PDF
  { mimes: ["image/jpeg", "image/jpg"], test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  { mimes: ["image/png"], test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47]) },
  { mimes: ["image/gif"], test: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]) }, // GIF8
  {
    mimes: ["image/webp"],
    test: (b) =>
      startsWith(b, [0x52, 0x49, 0x46, 0x46]) && b.length >= 12 && b.toString("ascii", 8, 12) === "WEBP",
  },
  // Legacy OLE compound documents (.doc / .xls)
  {
    mimes: ["application/msword", "application/vnd.ms-excel"],
    test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]),
  },
  // OpenXML / ZIP-based (.docx / .xlsx)
  {
    mimes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    test: (b) =>
      startsWith(b, [0x50, 0x4b, 0x03, 0x04]) ||
      startsWith(b, [0x50, 0x4b, 0x05, 0x06]) ||
      startsWith(b, [0x50, 0x4b, 0x07, 0x08]),
  },
];

/**
 * Returns true only when the buffer's leading bytes match the declared MIME type. A declared
 * type with no known signature is rejected (returns false) so callers fail closed.
 */
export function fileBufferMatchesDeclaredType(buffer: Buffer, declaredMime: string): boolean {
  if (!buffer || buffer.length === 0) return false;
  const signature = SIGNATURES.find((entry) => entry.mimes.includes(declaredMime));
  if (!signature) return false;
  return signature.test(buffer);
}
