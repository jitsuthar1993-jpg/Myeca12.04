export type ClassificationReference = {
  readonly kind: "hsn" | "sac";
  readonly code: string;
  readonly description: string;
};

type ClassificationSearch = {
  type: ClassificationReference["kind"];
  query: string;
};

export function searchClassificationReferences<T extends ClassificationReference>(
  entries: readonly T[],
  search: ClassificationSearch,
): T[] {
  const normalizedQuery = search.query.trim().toLocaleLowerCase("en-IN");

  return entries.filter((entry) => {
    if (entry.kind !== search.type) return false;
    if (!normalizedQuery) return true;

    return entry.code.includes(normalizedQuery)
      || entry.description.toLocaleLowerCase("en-IN").includes(normalizedQuery);
  });
}
