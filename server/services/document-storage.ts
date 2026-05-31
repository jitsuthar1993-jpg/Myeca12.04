import { del, get, put } from "@vercel/blob";

export type PrivateDocumentUploadOptions = {
  contentType: string;
};

export async function putPrivateDocument(
  pathname: string,
  body: Buffer,
  options: PrivateDocumentUploadOptions,
) {
  return put(pathname, body, {
    access: "private",
    contentType: options.contentType,
  });
}

export async function getPrivateDocument(blobUrl: string) {
  return get(blobUrl, { access: "private" });
}

export async function deletePrivateDocument(blobUrl: string) {
  return del(blobUrl);
}
