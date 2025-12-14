#!/usr/bin/env tsx
/**
 * Script to import a blog post from BLOG_POST_IMPORT.md
 * Usage: npm run import-blog-post
 * 
 * This creates a blog post in the database using the content from BLOG_POST_IMPORT.md
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { db } from "../server/db.js";
import { blogPosts } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function importBlogPost() {
  try {
    // Read the import file
    const importPath = join(process.cwd(), "BLOG_POST_IMPORT.md");
    const content = await readFile(importPath, "utf-8");

    // Parse the markdown to extract post details
    const titleMatch = content.match(/\*\*Title:\*\*\s*(.+)/);
    const slugMatch = content.match(/\*\*Slug:\*\*\s*(.+)/);
    const excerptMatch = content.match(/\*\*Excerpt:\*\*\s*(.+)/);
    const imageMatch = content.match(/\*\*Featured Image:\*\*\s*(.+)/);
    const altTextMatch = content.match(/\*\*Featured Image Alt Text:\*\*\s*(.+)/);
    const tagsMatch = content.match(/\*\*Tags:\*\*\s*(.+)/);
    
    // Extract content (everything after "## Content")
    const contentStart = content.indexOf("## Content");
    const postContent = contentStart > -1 
      ? content.substring(contentStart + 10).trim()
      : content;

    if (!titleMatch || !slugMatch) {
      throw new Error("Title and slug are required in BLOG_POST_IMPORT.md");
    }

    const title = titleMatch[1].trim();
    const slug = slugMatch[1].trim();
    const excerpt = excerptMatch?.[1].trim() || "";
    const featuredImage = imageMatch?.[1].trim() || "";
    const featuredImageAltText = altTextMatch?.[1].trim() || "";
    const tagsString = tagsMatch?.[1].trim() || "";
    const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean);

    console.log(`Importing blog post: ${title}`);
    console.log(`Slug: ${slug}`);

    // Check if post already exists
    const existing = await db
      .select()
      .from(blogPosts)
      .where(sql`${blogPosts.slug} = ${slug}`)
      .limit(1);

    if (existing.length > 0) {
      console.log(`Post with slug "${slug}" already exists. Updating...`);
      const [updated] = await db
        .update(blogPosts)
        .set({
          title,
          excerpt,
          content: postContent,
          authorName: "The JobBridge Team",
          featuredImage,
          featuredImageAltText,
          tags,
          published: true,
          updatedAt: new Date(),
        })
        .where(sql`${blogPosts.slug} = ${slug}`)
        .returning();
      
      console.log(`✅ Updated blog post: ${updated.id}`);
    } else {
      // Insert new post
      const [newPost] = await db
        .insert(blogPosts)
        .values({
          title,
          slug,
          excerpt,
          content: postContent,
          authorName: "The JobBridge Team",
          featuredImage,
          featuredImageAltText,
          tags,
          published: true,
          publishedAt: new Date(),
        })
        .returning();

      console.log(`✅ Created blog post: ${newPost.id}`);
    }

    console.log(`\n✅ Blog post imported successfully!`);
    console.log(`View at: https://thejobbridge-inc.com/blog/${slug}`);
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error importing blog post:", error);
    process.exit(1);
  }
}

importBlogPost();
