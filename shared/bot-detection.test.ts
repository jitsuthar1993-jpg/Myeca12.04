// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isCrawlerUserAgent } from "./bot-detection";

describe("isCrawlerUserAgent", () => {
  it("matches the main search-engine crawlers", () => {
    const uas = [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; https://duckduckgo.com/duckduckbot)",
      "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
      "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
    ];
    for (const ua of uas) {
      expect(isCrawlerUserAgent(ua), `expected crawler match for: ${ua}`).toBe(true);
    }
  });

  it("matches the social link-preview agents we explicitly added", () => {
    const uas = [
      // Facebook
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      // WhatsApp — note: no \"bot\" keyword in the UA
      "WhatsApp/2.23.20.0",
      // Slack
      "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
      "Slack-ImgProxy 1.144 (+https://api.slack.com/robots)",
      // Twitter / X
      "Twitterbot/1.0",
      // LinkedIn
      "LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com)",
      // Telegram
      "TelegramBot (like TwitterBot)",
      // Discord
      "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
      // Skype
      "SkypeUriPreview Preview/0.5",
      // Pinterest
      "Pinterest/0.2 (+http://www.pinterest.com/bot.html)",
      // Embedly (used by Medium, Notion, etc.)
      "Embedly/0.2",
    ];
    for (const ua of uas) {
      expect(isCrawlerUserAgent(ua), `expected crawler match for: ${ua}`).toBe(true);
    }
  });

  it("matches AI assistant fetchers", () => {
    const uas = [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.0",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-Web/1.0",
    ];
    for (const ua of uas) {
      expect(isCrawlerUserAgent(ua), `expected crawler match for: ${ua}`).toBe(true);
    }
  });

  it("does NOT match mainstream browser user agents", () => {
    const uas = [
      // Chrome on Windows
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      // Firefox on Windows
      "Mozilla/5.0 (Windows NT 10.0; rv:121.0) Gecko/20100101 Firefox/121.0",
      // Safari on macOS
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      // Mobile Safari on iPhone
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      // Edge
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      // Brave (same UA family as Chrome)
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      // Android Chrome
      "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    ];
    for (const ua of uas) {
      expect(isCrawlerUserAgent(ua), `expected NO crawler match for: ${ua}`).toBe(false);
    }
  });

  it("returns false for empty, undefined, or null input", () => {
    expect(isCrawlerUserAgent("")).toBe(false);
    expect(isCrawlerUserAgent(undefined)).toBe(false);
    expect(isCrawlerUserAgent(null)).toBe(false);
  });
});
