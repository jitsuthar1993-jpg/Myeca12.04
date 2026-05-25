import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@shared/seo-schema";

export type GenerateMetadataInput = {
  title: string;
  description: string;
  slug?: string;
  type?: "website" | "article" | "service" | "calculator" | string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  image?: string | null;
};

export type GeneratedMetadata = {
  metadataBase: URL;
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: "en_IN";
    type: string;
    publishedTime?: string;
    modifiedTime?: string;
    images: Array<{ url: string; width: 1200; height: 630; alt: string }>;
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
  robots: { index: true; follow: true };
};

function normalizeSlug(slug?: string) {
  if (!slug || slug === "/") return "/";
  const clean = slug.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function absoluteUrl(value?: string | null) {
  if (!value) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export function generateMetadata(input: GenerateMetadataInput): GeneratedMetadata {
  const slug = normalizeSlug(input.slug);
  const canonical = slug === "/" ? SITE_URL : `${SITE_URL}${slug}`;
  const image = absoluteUrl(input.image);
  const ogType = input.type === "article" ? "article" : "website";

  return {
    metadataBase: new URL(SITE_URL),
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: ogType,
      publishedTime: input.publishedAt || undefined,
      modifiedTime: input.modifiedAt || undefined,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}
