/**
 * Compress an image file using Canvas.
 * Returns a new File object with the compressed content.
 */
export async function compressImage(file: File, quality: number = 0.7, maxWidth: number = 1920): Promise<File> {
  // If it's not an image, return original file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if exceeds maxWidth
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Generate a preview URL for a given file.
 * Returns an Object URL. Remember to revoke it when done.
 */
export function getFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Sanitizes a filename to prevent directory traversal and special character issues.
 */
export function sanitizeFilename(filename: string): string {
  // Remove path information
  const basename = filename.split(/[\\/]/).pop() || 'file';

  // Replace anything that isn't a letter, number, dot, or hyphen with a hyphen
  return basename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-') // collapse multiple hyphens
    .substring(0, 100); // limit length
}

export async function prepareDocumentForUpload(file: File): Promise<File> {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a PDF, image, Word, or Excel file.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large. Max limit is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
  }

  const preparedFile = file.type.startsWith('image/')
    ? await compressImage(file)
    : file;

  if (!ALLOWED_FILE_TYPES.includes(preparedFile.type)) {
    throw new Error("Invalid compressed file type.");
  }

  if (preparedFile.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Compressed file is still too large. Max limit is ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
  }

  return preparedFile;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
