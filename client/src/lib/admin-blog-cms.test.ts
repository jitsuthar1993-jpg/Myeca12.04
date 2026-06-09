import { readFileSync } from "node:fs";
import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadStaticBlogPosts } from "../../../server/data/static-blog-content";
import {
  listBlogInventoryPosts,
  sortBlogInventoryPosts,
  type BlogInventoryPost,
  type StoredBlogPost,
} from "../../../server/services/blog";

type FakePostRecord = Record<string, unknown> & {
  id: string;
  slug?: string;
};

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  counter: 0,
}));

function collectionStore(name: string) {
  let store = mockState.store.get(name);
  if (!store) {
    store = new Map<string, Record<string, any>>();
    mockState.store.set(name, store);
  }
  return store;
}

function createSnapshot(records: Array<[string, Record<string, any>]>) {
  return {
    empty: records.length === 0,
    size: records.length,
    docs: records.map(([id, data]) => ({
      id,
      exists: true,
      data: () => ({ ...data }),
    })),
  };
}

function makeQuery(name: string, clauses: Array<{ field: string; value: unknown }> = []) {
  return {
    where: (field: string, op: string, value: unknown) => {
      if (op !== "==") throw new Error(`Unsupported op ${op}`);
      return makeQuery(name, [...clauses, { field, value }]);
    },
    orderBy: () => makeQuery(name, clauses),
    limit: () => makeQuery(name, clauses),
    get: async () => {
      const rows = Array.from(collectionStore(name).entries()).filter(([, data]) =>
        clauses.every((clause) => data[clause.field] === clause.value),
      );
      return createSnapshot(rows);
    },
  };
}

function makeDocRef(name: string, id: string) {
  return {
    id,
    get: async () => {
      const data = collectionStore(name).get(id);
      return {
        id,
        exists: Boolean(data),
        data: () => (data ? { ...data } : undefined),
      };
    },
    set: async (data: Record<string, any>) => {
      collectionStore(name).set(id, { ...data, id: data.id ?? id });
    },
    update: async (data: Record<string, any>) => {
      const store = collectionStore(name);
      const current = store.get(id);
      if (!current) throw new Error(`Missing document ${name}/${id}`);
      store.set(id, { ...current, ...data, id });
    },
    delete: async () => {
      collectionStore(name).delete(id);
    },
  };
}

function createFakeBlogDb(posts: FakePostRecord[] = []) {
  return {
    collection(name: string) {
      if (name === "categories" || name === "users") {
        return {
          ...makeQuery(name),
          doc: (id: string) => makeDocRef(name, id),
        };
      }

      if (name === "blog_posts") {
        return {
          get: async () =>
            createSnapshot(posts.map((post) => [post.id, post])),
          where: (field: string, op: string, value: unknown) => {
            if (op !== "==") throw new Error(`Unsupported op ${op}`);
            return {
              limit: () => ({
                get: async () =>
                  createSnapshot(
                    posts
                      .filter((post) => post[field] === value)
                      .map((post) => [post.id, post]),
                  ),
              }),
            };
          },
        };
      }

      throw new Error(`Unexpected collection ${name}`);
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id ?? `${name}_${++mockState.counter}`),
      add: async (data: Record<string, any>) => {
        const id = `${name}_${++mockState.counter}`;
        await makeDocRef(name, id).set(data);
        return makeDocRef(name, id);
      },
    }),
  },
}));

vi.mock("../../../server/middleware/auth.js", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.auth = { userId: "team_1", email: "team@example.com" };
    req.user = { id: "team_1", role: "team_member" };
    next();
  },
  requireAdmin: (_req: any, _res: any, next: any) => next(),
  requireTeamMember: (_req: any, _res: any, next: any) => next(),
}));

const { default: cmsRouter } = await import("../../../server/routes/cms");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data, id });
}

function readCollection(collection: string) {
  return Array.from(collectionStore(collection).entries()).map(([id, data]) => ({
    id,
    ...data,
  }));
}

async function request(path: string, options: RequestInit = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api/cms", cmsRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const json = await response.json();
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function asStoredPost(overrides: Partial<StoredBlogPost>): StoredBlogPost {
  return {
    id: "post",
    title: "Post",
    slug: "post",
    excerpt: null,
    content: "<p>Post</p>",
    status: "published",
    categoryId: "itr-filing",
    category: null,
    coverImage: null,
    authorId: null,
    authorName: "MyeCA Editorial Team",
    authorRole: null,
    authorBio: null,
    seoTitle: null,
    seoDescription: null,
    keyHighlights: [],
    faqItems: [],
    relatedPostIds: [],
    ctaLabel: null,
    ctaHref: null,
    isFeatured: false,
    readingTimeMinutes: 1,
    publishedAt: "2026-05-01T00:00:00.000Z",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    tags: [],
    audience: "both",
    primaryKeyword: null,
    secondaryKeywords: [],
    userIntent: "informational",
    keyTopics: [],
    qualityStatus: "needs_revision",
    editorialApprovedBy: null,
    editorialApprovedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    reviewerName: null,
    reviewerRole: null,
    reviewerCredentialName: null,
    reviewerCredentialId: null,
    reviewerCredentialAuthority: null,
    sourceLinks: [],
    serviceSlug: null,
    calculatorSlug: null,
    canonicalUrl: null,
    ...overrides,
  };
}

function makeEditorPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: "Advance tax due dates and payment checks",
    slug: "advance-tax-due-dates-payment-checks",
    excerpt: "Use the correct advance-tax dates and verify payment records before filing.",
    content: [
      "<h2>Check whether advance tax applies</h2>",
      "<p>Advance tax becomes relevant when the estimated tax still payable after expected TDS and other credits crosses the applicable threshold. Begin with income already earned and a reasonable estimate of income expected for the rest of the financial year. Separate salary, professional receipts, business profit, interest, rent, dividends, and taxable gains because their timing and available records differ. Then reduce only credits that are supported by payroll data, certificates, Form 26AS, or other reliable statements. This first calculation establishes whether an instalment is needed and prevents a portal figure from replacing the taxpayer's own working.</p>",
      "<p>The estimate should use the tax regime and deductions that are actually available for the year. A salaried taxpayer may need to compare employer TDS with income outside payroll, while a freelancer or business owner may need current books, invoice totals, expenses, and GST records. Investors should update the working after a material sale rather than assuming last year's gains will repeat. Record each assumption, the date it was made, and the document used. That note makes the next estimate faster and explains why an instalment changed during the year.</p>",
      "<h2>Choose the instalment from current records</h2>",
      "<p>Compare the estimated balance with the instalment schedule that applies on the calculation date. Do not simply divide the annual estimate into equal payments after a late income event. Instead, identify what was known before each due date and update the remaining payments when receipts, gains, deductions, or TDS change. If a customer delays payment or an employer corrects payroll TDS, retain the revised working beside the earlier version. The sequence should show how the amount paid was reached without relying on memory at return-filing time.</p>",
      "<h2>Keep records that support the payment</h2>",
      "<p>Retain the challan, payment reference, computation, and income records so the final return can be reconciled. Match the assessment year, PAN, payment date, amount, and tax-payment category before treating a challan as complete. Save the bank confirmation and later verify that the credit appears in the relevant tax records. If a payment is missing or mapped incorrectly, preserve the complaint or correction trail as well. A screenshot alone is weaker evidence than a challan and bank debit that can be matched to the final computation.</p>",
      "<h2>Recalculate when the facts change</h2>",
      "<p>Review the estimate after a large bonus, new contract, property transaction, investment sale, unexpected interest receipt, deduction change, or correction to TDS. Recalculation is also useful before the final instalment because most of the year's records are then available. If the estimate remains uncertain, identify the disputed item instead of hiding it inside a rounded total. A document-based review is appropriate when the tax treatment, income head, loss adjustment, residential status, or available credit could materially change the payment or create avoidable interest.</p>",
      "<h2>Close the advance-tax file before filing</h2>",
      "<p>Before preparing the return, reconcile every instalment with the final income and tax-credit records. Keep the last estimate, each earlier working that explains a material revision, all challans, and proof of any correction request. Compare the resulting tax payable or refund with the return computation and investigate unexplained differences. This closing step turns advance tax from a set of isolated bank payments into an evidence trail that supports the filed return and helps answer a later processing query.</p>",
      "<h2>Example: revise the estimate after an investment sale</h2>",
      "<p>Suppose a salaried taxpayer sells an investment in January after the employer has already calculated payroll TDS. The taxpayer should add the supported gain or loss calculation to the existing salary and other-income estimate, then compare the revised annual liability with TDS and instalments already paid. The broker statement, acquisition-cost record, sale contract note, and tax-credit statements should remain beside the revised computation. If the sale produces a material balance before the next instalment date, the working should explain the additional payment and preserve its challan. If the cost or classification remains uncertain, the taxpayer should resolve that point before treating the estimate as final.</p>",
    ].join(""),
    status: "draft",
    authorName: "MyeCA Editorial Team",
    audience: "individuals",
    targetAudience: "Individual taxpayers estimating advance-tax instalments from current income and supported tax credits",
    primaryKeyword: "advance tax due dates",
    secondaryKeywords: ["advance tax interest"],
    userIntent: "informational",
    keyTopics: ["due dates", "payment records"],
    relatedPostIds: [
      "advance-tax-tax-year-2026-27-new-act-checklist",
      "self-assessment-tax-challan-act-1961-ay-2026-27",
      "tax-credit-mismatch-tds-form-26as-ay-2026-27",
      "wait-for-ais-form-26as-before-filing-itr-ay-2026-27",
    ],
    sourceLinks: [
      {
        label: "Income Tax Department",
        url: "https://www.incometax.gov.in/",
        checkedAt: "2026-06-06",
      },
    ],
    qualityStatus: "needs_revision",
    ...overrides,
  };
}

beforeEach(resetStore);

describe("admin blog CMS content", () => {
  it("lists static MDX posts as import-only admin inventory rows", async () => {
    const staticPost = loadStaticBlogPosts()[0];

    const posts = await listBlogInventoryPosts(createFakeBlogDb() as never);
    const row = posts.find((post) => post.slug === staticPost.slug);

    expect(row).toMatchObject({
      id: staticPost.id,
      slug: staticPost.slug,
      source: "static",
      canEdit: false,
      canDelete: false,
    });
  });

  it("uses the CMS row when a database post has the same slug as a static post", async () => {
    const staticPost = loadStaticBlogPosts()[0];
    const editedDatabasePost = {
      ...staticPost,
      id: "cms-post-1",
      title: "Edited database version",
      updatedAt: "2026-06-01T00:00:00.000Z",
    };

    const posts = await listBlogInventoryPosts(createFakeBlogDb([editedDatabasePost]) as never);
    const matches = posts.filter((post) => post.slug === staticPost.slug);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      id: "cms-post-1",
      title: "Edited database version",
      source: "cms",
      canEdit: true,
      canDelete: true,
    });
  });

  it("keeps featured posts first, then recent inventory posts", () => {
    const rows = sortBlogInventoryPosts([
      asStoredPost({ id: "old", title: "Old", slug: "old", publishedAt: "2026-01-01T00:00:00.000Z" }),
      asStoredPost({ id: "featured", title: "Featured", slug: "featured", isFeatured: true, publishedAt: "2025-01-01T00:00:00.000Z" }),
      asStoredPost({ id: "recent", title: "Recent", slug: "recent", publishedAt: "2026-06-01T00:00:00.000Z" }),
    ] as BlogInventoryPost[]);

    expect(rows.map((post) => post.slug)).toEqual(["featured", "recent", "old"]);
  });

  it("returns static rows from the CMS list route with source metadata", async () => {
    const staticPost = loadStaticBlogPosts()[0];

    const { response, json } = await request("/api/cms/posts");
    const row = json.posts.find((post: any) => post.slug === staticPost.slug);

    expect(response.status, JSON.stringify(json)).toBe(200);
    expect(row).toMatchObject({
      source: "static",
      canEdit: false,
      canDelete: false,
    });
  });

  it("imports a static post into the CMS once and returns the CMS row", async () => {
    const staticPost = loadStaticBlogPosts()[0];

    const first = await request(`/api/cms/posts/${staticPost.id}/import`, { method: "POST" });
    const second = await request(`/api/cms/posts/${staticPost.id}/import`, { method: "POST" });
    const storedPosts = readCollection("blog_posts");

    expect(first.response.status).toBe(200);
    expect(second.response.status).toBe(200);
    expect(storedPosts).toHaveLength(1);
    expect(first.json.post).toMatchObject({
      slug: staticPost.slug,
      source: "cms",
      canEdit: true,
      canDelete: true,
    });
    expect(second.json.post.id).toBe(first.json.post.id);
  });

  it("does not update or implicitly import an unimported static post", async () => {
    const staticPost = loadStaticBlogPosts()[0];

    const { response, json } = await request(`/api/cms/posts/${staticPost.id}`, {
      method: "PUT",
      body: JSON.stringify({ title: "Should not import" }),
    });

    expect(response.status).toBe(404);
    expect(json.error).toBe("Post not found");
    expect(readCollection("blog_posts")).toHaveLength(0);
  });

  it("includes bundled static blog categories in the CMS category route", async () => {
    const { response, json } = await request("/api/cms/categories");

    expect(response.status, JSON.stringify(json)).toBe(200);
    expect(json.categories.some((category: any) => category.id === "itr-filing")).toBe(true);
  });

  it("keeps static admin rows on explicit import controls instead of edit/delete", () => {
    const source = readFileSync("client/src/pages/admin/blog.page.tsx", "utf8");

    expect(source).toContain('source?: "cms" | "static"');
    expect(source).toContain("Import needed");
    expect(source).toContain('/api/cms/posts/${id}/import');
    expect(source).toContain("post.canEdit");
    expect(source).toContain("post.canDelete");
  });

  it("allows an AI-assisted or incomplete post to be saved as a draft", async () => {
    const { response, json } = await request("/api/cms/posts", {
      method: "POST",
      body: JSON.stringify(makeEditorPayload()),
    });

    expect(response.status).toBe(200);
    expect(json.post).toMatchObject({
      status: "draft",
      qualityStatus: "needs_revision",
    });
  });

  it("blocks publishing until quality approval and human approval are recorded", async () => {
    const { response, json } = await request("/api/cms/posts", {
      method: "POST",
      body: JSON.stringify(makeEditorPayload({ status: "published" })),
    });

    expect(response.status).toBe(400);
    expect(json.error).toContain("cannot be published");
    expect(readCollection("blog_posts")).toHaveLength(0);
  });

  it("blocks publishing content placed on hold even when approval fields are supplied", async () => {
    const { response, json } = await request("/api/cms/posts", {
      method: "POST",
      body: JSON.stringify(
        makeEditorPayload({
          status: "published",
          qualityStatus: "hold",
          editorialApprovedBy: "team@example.com",
          editorialApprovedAt: "2026-06-06",
        }),
      ),
    });

    expect(response.status).toBe(400);
    expect(json.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "hold_route_publish" }),
    ]));
    expect(readCollection("blog_posts")).toHaveLength(0);
  });

  it("publishes a complete approved post with recorded human approval", async () => {
    const { response, json } = await request("/api/cms/posts", {
      method: "POST",
      body: JSON.stringify(
        makeEditorPayload({
          status: "published",
          qualityStatus: "approved",
          editorialApprovedBy: "team@example.com",
          editorialApprovedAt: "2026-06-06",
        }),
      ),
    });

    expect(response.status, JSON.stringify(json)).toBe(200);
    expect(json.post).toMatchObject({
      status: "published",
      qualityStatus: "approved",
      editorialApprovedBy: "team@example.com",
    });
  });

  it("keeps webhook imports gated and WhatsApp generation draft-only", () => {
    const webhookSource = readFileSync("server/routes/blog-webhooks.ts", "utf8");
    const whatsappSource = readFileSync("server/routes/whatsapp.ts", "utf8");

    expect(webhookSource).toContain("assertBlogPublishable(payload)");
    expect(whatsappSource).toContain('status: "draft"');
    expect(whatsappSource).toContain('qualityStatus: "needs_revision"');
    expect(whatsappSource).toContain("Draft saved for human review");
    expect(whatsappSource).not.toContain('status: "published"');
  });
});
