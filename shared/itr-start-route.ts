export const ITR_START_ROUTE = "/which-itr-form-to-file";
export const LEGACY_ITR_START_ROUTE = "/itr/start";

export function buildItrStartRedirectLocation(sourceUrl: string) {
  const queryIndex = sourceUrl.indexOf("?");
  const hashIndex = sourceUrl.indexOf("#");
  const suffixIndexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  const suffixIndex = suffixIndexes.length > 0 ? Math.min(...suffixIndexes) : -1;

  return suffixIndex >= 0
    ? `${ITR_START_ROUTE}${sourceUrl.slice(suffixIndex)}`
    : ITR_START_ROUTE;
}
