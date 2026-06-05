type AdminCatalogCandidate = {
  id?: string | number;
  name?: string;
  title?: string;
  path?: string;
};

export type AdminCatalogSourceService = AdminCatalogCandidate & {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: string;
  popular?: boolean;
};

export function isAdminCatalogService(service: AdminCatalogCandidate) {
  const path = service.path || "";
  const identity = `${service.id || ""} ${service.name || ""} ${service.title || ""}`.toLowerCase();
  return path !== "/calculators" && !path.startsWith("/calculators/") && !identity.includes("calculat");
}

function catalogPrice(value?: string) {
  const match = String(value || "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function adminCatalogCategory(category: string) {
  const value = category.toLowerCase();
  if (value.includes("tax") || value.includes("filing")) return "tax-filing";
  if (value.includes("business") || value.includes("startup")) return "business-registration";
  if (value.includes("compliance") || value.includes("accounting")) return "compliance";
  if (value.includes("consult") || value.includes("advisory")) return "consultation";
  if (value.includes("certification")) return "certification";
  return "other";
}

export function serializeAdminCatalogService(service: AdminCatalogSourceService, bookingsCount: number) {
  return {
    id: service.id,
    name: service.title,
    description: service.description,
    category: adminCatalogCategory(service.category),
    price: catalogPrice(service.price),
    isPopular: Boolean(service.popular),
    isActive: true,
    features: "",
    estimatedDuration: "",
    requirements: "",
    bookingsCount,
    createdAt: null,
    updatedAt: null,
  };
}
