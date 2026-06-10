import {
  mergeCampaignAttribution,
  normalizeCampaignAttribution,
  readCampaignAttributionFromParams,
  type CampaignAttribution,
} from "@shared/campaign-attribution";

export const CAMPAIGN_ATTRIBUTION_STORAGE_KEY = "myeca:campaign-attribution";
export const CAMPAIGN_ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function availableStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
}

export function readStoredCampaignAttribution(now = Date.now()): CampaignAttribution | undefined {
  const storage = availableStorage();
  if (!storage) return undefined;

  try {
    const raw = storage.getItem(CAMPAIGN_ATTRIBUTION_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = normalizeCampaignAttribution(JSON.parse(raw));
    if (!parsed || new Date(parsed.firstTouchAt).getTime() + CAMPAIGN_ATTRIBUTION_TTL_MS <= now) {
      storage.removeItem(CAMPAIGN_ATTRIBUTION_STORAGE_KEY);
      return undefined;
    }
    return parsed;
  } catch {
    storage.removeItem(CAMPAIGN_ATTRIBUTION_STORAGE_KEY);
    return undefined;
  }
}

export function captureCampaignAttribution(
  params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search),
  now = new Date().toISOString(),
) {
  const storage = availableStorage();
  const attribution = mergeCampaignAttribution(
    readStoredCampaignAttribution(new Date(now).getTime()),
    readCampaignAttributionFromParams(params, now),
  );

  if (storage && attribution) {
    try {
      storage.setItem(CAMPAIGN_ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Attribution is best effort when browser storage is blocked.
    }
  }

  return attribution;
}
