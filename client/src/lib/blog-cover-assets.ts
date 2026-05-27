const BLOG_TEXT_COVER_PATH = "/assets/blog/text-covers/";
const BLOG_TEXT_COVER_VERSION = "ay202627-cover-v2";

export function isGeneratedBlogCover(value: string | null | undefined) {
  return Boolean(value?.includes(BLOG_TEXT_COVER_PATH));
}

export function getBlogCoverImageSrc(value: string | null | undefined) {
  if (!value || !isGeneratedBlogCover(value)) return value ?? "";

  const separator = value.includes("?") ? "&" : "?";
  return `${value}${separator}v=${BLOG_TEXT_COVER_VERSION}`;
}
