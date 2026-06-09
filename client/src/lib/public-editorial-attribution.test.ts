import { describe, expect, it } from "vitest";
import { blogPosts } from "../data/blogPosts";
import { getGuideOfficialSources, TAX_GUIDES } from "../data/tax-guides";
import { VIDEO_TUTORIALS } from "../data/video-tutorials";

describe("public editorial attribution", () => {
  it("does not publish unverified named CA authors or instructors", () => {
    const attributions = [
      ...blogPosts.map((post) => ({ route: `/blog/${post.slug}`, name: post.author })),
      ...TAX_GUIDES.map((guide) => ({ route: `/learn/guide/${guide.slug}`, name: guide.author })),
      ...VIDEO_TUTORIALS.map((video) => ({ route: "/learn/videos", name: video.instructor })),
    ];

    for (const attribution of attributions) {
      expect(attribution.name, attribution.route).toBe("MyeCA Editorial Team");
    }
  });

  it("gives every interactive tax guide visible, dated official sources", () => {
    for (const guide of TAX_GUIDES) {
      const sources = getGuideOfficialSources(guide.slug);

      expect(sources.length, guide.slug).toBeGreaterThan(0);
      for (const source of sources) {
        expect(source.href, guide.slug).toMatch(/^https:\/\/[^\s]+$/);
        expect(source.checkedAt, guide.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("does not publish known overconfident or materially incomplete guide claims", () => {
    const guideText = JSON.stringify(TAX_GUIDES);

    expect(guideText).not.toMatch(/TDS in Form 16 should match Form 26AS exactly/i);
    expect(guideText).not.toMatch(/accurate computation/i);
    expect(guideText).not.toMatch(/Revenue stamps required on receipts above/i);
    expect(guideText).not.toMatch(/Include brokerage and STT in expenses/i);
    expect(guideText).not.toMatch(/ITR-1 cannot be used if you have capital gains/i);
    expect(guideText).not.toMatch(/shortest lock-in with highest return potential/i);
    expect(guideText).not.toMatch(/Let-out property: No limit on interest deduction/i);
    expect(guideText).not.toMatch(/Income is taxable on accrual basis \(when earned, not received\)/i);
    expect(guideText).not.toMatch(/No expense documentation needed for presumptive/i);
    expect(guideText).not.toMatch(/Once opted out of presumptive, can't come back for 5 years/i);
    expect(guideText).not.toMatch(/title":"File ITR-4"/i);
  });
});
