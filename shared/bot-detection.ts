/**
 * Detects the User-Agent strings that should receive server-rendered SEO meta tags
 * instead of the empty SPA shell. Covers traditional search engine crawlers, social
 * link-preview agents (WhatsApp, Slack, Discord, Telegram, LinkedIn, Twitter,
 * Facebook external hit, Pinterest, Skype), AI assistants (ChatGPT, Claude), and
 * generic preview/embed bots.
 *
 * The pattern intentionally targets bot/preview tokens that do NOT appear in
 * mainstream browser UAs — Chrome, Firefox, Safari, Edge, Opera, Brave.
 */
const BOT_USER_AGENT_PATTERN =
  /bot|googlebot|crawler|spider|robot|crawling|bingbot|duckduckbot|yandexbot|slurp|facebot|ia_archiver|facebookexternalhit|whatsapp|telegrambot|linkedinbot|twitterbot|slackbot|slack-imgproxy|discordbot|skypeuripreview|pinterest|embedly|quora|outbrain|preview|chatgpt|gptbot|claude-web/i;

export function isCrawlerUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent) return false;
  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

// Re-export the pattern for callers that need the raw regex (e.g. logging or analytics).
export { BOT_USER_AGENT_PATTERN };
