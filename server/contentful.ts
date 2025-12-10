// Contentful integration for automated blog posts
import { createClient, type Entry, type EntryCollection } from 'contentful';

interface ContentfulConfig {
  space: string;
  accessToken: string;
  environment?: string;
}

let contentfulClient: ReturnType<typeof createClient> | null = null;

export function getContentfulClient() {
  if (contentfulClient) {
    return contentfulClient;
  }

  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  if (!space || !accessToken) {
    console.warn('Contentful not configured. Set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN');
    return null;
  }

  contentfulClient = createClient({
    space,
    accessToken,
    environment,
  });

  return contentfulClient;
}

export interface ContentfulBlogPost {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: {
      fields?: {
        file?: {
          url?: string;
        };
      };
      sys?: {
        id?: string;
      };
    };
    tags?: string[];
    author?: {
      fields?: {
        name?: string;
        email?: string;
      };
    };
    publishedDate?: string;
  };
}

/**
 * Fetch all published blog posts from Contentful
 */
export async function fetchContentfulPosts(): Promise<ContentfulBlogPost[]> {
  const client = getContentfulClient();
  if (!client) {
    return [];
  }

  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost', // Adjust this to match your Contentful content type
      order: ['-fields.publishedDate', '-sys.createdAt'] as any,
      limit: 100, // Adjust limit as needed
    });

    // Filter published posts (if published field exists)
    const publishedPosts = entries.items.filter((item: any) => {
      const published = item.fields?.published;
      return published !== false; // Include if published is true or undefined
    });

    return publishedPosts as any[];
  } catch (error) {
    console.error('Error fetching Contentful posts:', error);
    return [];
  }
}

/**
 * Fetch a single blog post by slug from Contentful
 */
export async function fetchContentfulPostBySlug(slug: string): Promise<ContentfulBlogPost | null> {
  const client = getContentfulClient();
  if (!client) {
    return null;
  }

  try {
    const entries: EntryCollection<any> = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': slug,
      limit: 1,
    });

    if (entries.items.length === 0) {
      return null;
    }

    return entries.items[0] as any;
  } catch (error) {
    console.error('Error fetching Contentful post by slug:', error);
    return null;
  }
}

/**
 * Convert Contentful post to our database format
 */
export function convertContentfulPostToDbFormat(
  contentfulPost: ContentfulBlogPost
): {
  contentfulId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  published: boolean;
  tags?: string[];
  authorName?: string;
  publishedAt?: Date;
  contentfulUpdatedAt: Date;
} {
  const fields = contentfulPost.fields;
  const featuredImageUrl = fields.featuredImage?.fields?.file?.url 
    ? `https:${fields.featuredImage.fields.file.url}`
    : undefined;

  const publishedDate = fields.publishedDate 
    ? new Date(fields.publishedDate)
    : new Date(contentfulPost.sys.createdAt);

  return {
    contentfulId: contentfulPost.sys.id,
    title: fields.title || '',
    slug: fields.slug || contentfulPost.sys.id,
    excerpt: fields.excerpt,
    content: fields.content || '',
    featuredImage: featuredImageUrl,
    published: true,
    tags: fields.tags || [],
    authorName: fields.author?.fields?.name || 'The JobBridge Team',
    publishedAt: publishedDate,
    contentfulUpdatedAt: new Date(contentfulPost.sys.updatedAt),
  };
}

/**
 * Sync all posts from Contentful to database
 */
export async function syncContentfulPosts(
  upsertBlogPost: (post: any) => Promise<any>
): Promise<{ synced: number; errors: number }> {
  const posts = await fetchContentfulPosts();
  let synced = 0;
  let errors = 0;

  for (const contentfulPost of posts) {
    try {
      const dbPost = convertContentfulPostToDbFormat(contentfulPost);
      await upsertBlogPost(dbPost);
      synced++;
    } catch (error) {
      console.error(`Error syncing post ${contentfulPost.sys.id}:`, error);
      errors++;
    }
  }

  return { synced, errors };
}

