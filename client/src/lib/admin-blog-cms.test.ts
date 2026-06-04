import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loadStaticBlogPosts } from "../../../server/data/static-blog-content";
import { getBlogPostById, listAllBlogPosts } from "../../../server/services/blog";

type FakePostRecord = Record<string, unknown> & {
  id: string;
  slug: string;
};

function createFakeBlogDb(posts: FakePostRecord[] = []) {
  return {
    collection(name: string) {
      if (name === "categories") {
        return {
          orderBy: () => ({
            get: async () => ({ docs: [] }),
          }),
        };
      }

      if (name === "blog_posts") {
        return {
          get: async () => ({
            docs: posts.map((post) => ({
              id: post.id,
              data: () => post,
            })),
          }),
          doc: (id: string) => ({
            get: async () => {
              const post = posts.find((candidate) => candidate.id === id);
              return {
                exists: Boolean(post),
                id,
                data: () => post,
              };
            },
          }),
        };
      }

      throw new Error(`Unexpected collection ${name}`);
    },
  };
}

describe("admin blog CMS content", () => {
  it("lists the static MDX catalog in the admin inventory even before every article is stored", async () => {
    const staticPosts = loadStaticBlogPosts();
    const [databasePost, staticOnlyPost] = staticPosts;
    const editedDatabasePost = {
      ...databasePost,
      title: "Edited database version",
      updatedAt: "2026-06-01T00:00:00.000Z",
    };

    const posts = await listAllBlogPosts(createFakeBlogDb([editedDatabasePost]) as never);
    const slugs = posts.map((post) => post.slug);
    const databaseMatches = posts.filter((post) => post.slug === databasePost.slug);

    expect(posts.length).toBeGreaterThanOrEqual(staticPosts.length);
    expect(slugs).toContain(staticOnlyPost.slug);
    expect(databaseMatches).toHaveLength(1);
    expect(databaseMatches[0].title).toBe("Edited database version");
  });

  it("loads a static MDX article detail so admin edit opens with content populated", async () => {
    const staticOnlyPost = loadStaticBlogPosts()[0];

    const byId = await getBlogPostById(staticOnlyPost.id, createFakeBlogDb() as never);
    const bySlug = await getBlogPostById(staticOnlyPost.slug, createFakeBlogDb() as never);

    expect(byId).toMatchObject({
      id: staticOnlyPost.id,
      slug: staticOnlyPost.slug,
      title: staticOnlyPost.title,
      status: "published",
    });
    expect(byId?.content).toContain("<");
    expect(bySlug?.id).toBe(staticOnlyPost.id);
  });

  it("keeps the admin editor from mounting an empty form while article detail is loading", () => {
    const source = readFileSync("client/src/pages/admin/blog.page.tsx", "utf8");

    expect(source).toContain("Loading article...");
    expect(source).toContain("editorPost");
    expect(source).toContain("noopener,noreferrer");
    expect(source).toContain(">Preview</Button>");
    expect(source).not.toContain('post={detailData?.post ?? null}');
  });
});
