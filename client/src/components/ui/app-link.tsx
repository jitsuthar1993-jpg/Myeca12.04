import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "wouter";
import { classifyPublicHref } from "@shared/public-link-audit";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  baseUrl?: string;
  children: ReactNode;
  currentPath?: string;
  href: string;
  publicFallbackHref?: string;
};

function withSafeExternalRel(rel?: string) {
  const values = new Set((rel || "").split(/\s+/).filter(Boolean));
  values.add("noopener");
  values.add("noreferrer");
  return [...values].join(" ");
}

export function AppLink({
  baseUrl,
  children,
  currentPath = "/",
  download,
  href,
  publicFallbackHref,
  rel,
  target,
  ...props
}: AppLinkProps) {
  const classified = classifyPublicHref(href, currentPath, baseUrl);

  if (!download && classified.kind === "internal-route") {
    return (
      <Link href={`${classified.path}${classified.hash}`} {...props}>
        {children}
      </Link>
    );
  }

  if (!download && classified.kind === "private-route") {
    return (
      <Link href={publicFallbackHref ?? classified.path} {...props}>
        {children}
      </Link>
    );
  }

  if (!download && classified.kind === "same-page-anchor") {
    return (
      <a href={classified.hash} rel={rel} target={target} {...props}>
        {children}
      </a>
    );
  }

  const external = classified.kind === "external";
  return (
    <a
      href={external ? classified.href : href}
      download={download}
      rel={external ? withSafeExternalRel(rel) : rel}
      target={external ? target ?? "_blank" : target}
      {...props}
    >
      {children}
    </a>
  );
}

export default AppLink;
