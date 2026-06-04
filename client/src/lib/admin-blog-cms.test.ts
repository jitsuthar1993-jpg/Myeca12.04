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

    expect(response.status).toBe(200);
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

    expect(response.status).toBe(200);
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
});
