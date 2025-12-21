// Contentful integration for automated blog posts
import { createClient, type Entry, type EntryCollection } from 'contentful';
import * as contentfulManagement from 'contentful-management';

interface ContentfulConfig {
  space: string;
  accessToken: string;
  environment?: string;
}

let contentfulClient: ReturnType<typeof createClient> | null = null;
let contentfulManagementClient: any | null = null;

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

export function getContentfulManagementClient() {
  if (contentfulManagementClient) {
    return contentfulManagementClient;
  }

  const space = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  if (!space || !managementToken) {
    console.warn('Contentful Management API not configured. Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN');
    return null;
  }

  // Create management client
  contentfulManagementClient = contentfulManagement.createClient({
    accessToken: managementToken,
  });

  return contentfulManagementClient;
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
    // Try multiple content type names (case-insensitive matching)
    const contentTypes = ['blogPost', 'blog_post', 'Blog page', 'blogPage'];
    let entries: EntryCollection<any> | null = null;
    let lastError: any = null;

    for (const contentType of contentTypes) {
      try {
        entries = await client.getEntries({
          content_type: contentType,
          order: ['-fields.publishedDate', '-sys.createdAt'] as any,
          limit: 100,
        });
        if (entries.items.length > 0 || contentType === contentTypes[0]) {
          // Use first match or default to 'blogPost'
          break;
        }
      } catch (err: any) {
        lastError = err;
        // Continue to next content type
        continue;
      }
    }

    if (!entries) {
      console.warn('No Contentful entries found. Check content type name. Tried:', contentTypes);
      // Try to get all content types to help with debugging
      try {
        const allEntries = await client.getEntries({ limit: 100 });
        const availableTypes = Array.from(new Set(allEntries.items.map((item: any) => item.sys.contentType.sys.id)));
        console.warn('Available content types in Contentful:', availableTypes);
      } catch (e) {
        // Ignore errors when trying to get content types
      }
      return [];
    }

    // Filter published posts (if published field exists)
    const publishedPosts = entries.items.filter((item: any) => {
      const published = item.fields?.published;
      return published !== false; // Include if published is true or undefined
    });

    return publishedPosts as any[];
  } catch (error: any) {
    console.error('Error fetching Contentful posts:', error);
    // Don't throw - return empty array so app continues to work
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
): Promise<{ synced: number; errors: number; message?: string }> {
  const client = getContentfulClient();
  if (!client) {
    return { 
      synced: 0, 
      errors: 0,
      message: "Contentful not configured. Set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN to enable syncing."
    };
  }

  try {
    const posts = await fetchContentfulPosts();
    
    if (posts.length === 0) {
      return { 
        synced: 0, 
        errors: 0,
        message: "No posts found in Contentful. Make sure your content type exists and has published entries."
      };
    }

    let synced = 0;
    let errors = 0;

    for (const contentfulPost of posts) {
      try {
        const dbPost = convertContentfulPostToDbFormat(contentfulPost);
        await upsertBlogPost(dbPost);
        synced++;
      } catch (error: any) {
        console.error(`Error syncing post ${contentfulPost.sys.id}:`, error);
        errors++;
      }
    }

    return { synced, errors };
  } catch (error: any) {
    console.error('Error in syncContentfulPosts:', error);
    return { 
      synced: 0, 
      errors: 1,
      message: error.message || "Failed to sync from Contentful"
    };
  }
}

/**
 * Convert database post format to Contentful format
 */
export function convertDbPostToContentfulFormat(post: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  published: boolean;
  tags?: string[];
  authorName?: string;
  publishedAt?: Date;
}): Record<string, any> {
  const fields: Record<string, any> = {
    title: { 'en-US': post.title },
    slug: { 'en-US': post.slug },
    content: { 'en-US': post.content },
  };

  if (post.excerpt) {
    fields.excerpt = { 'en-US': post.excerpt };
  }

  if (post.authorName) {
    fields.authorName = { 'en-US': post.authorName };
  }

  if (post.tags && post.tags.length > 0) {
    // Contentful expects tags as an array of strings
    fields.tags = { 'en-US': post.tags };
  }

  if (post.published !== undefined) {
    fields.published = { 'en-US': post.published };
  }

  if (post.publishedAt) {
    fields.publishedDate = { 'en-US': post.publishedAt.toISOString() };
  }

  // Note: Featured image would need to be uploaded to Contentful first
  // For now, we'll skip it or you can implement image upload separately

  return fields;
}

/**
 * Create or update a blog post in Contentful
 */
// Helper to find the correct content type name in Contentful
async function findContentTypeName(env: any): Promise<string | null> {
  const contentTypes = ['blogPost', 'blog_post', 'Blog page', 'blogPage', 'blog'];
  
  try {
    const contentTypeList = await env.getContentTypes();
    const availableTypes = contentTypeList.items.map((ct: any) => ct.sys.id);
    
    // Try to find a matching content type
    for (const candidate of contentTypes) {
      if (availableTypes.includes(candidate)) {
        console.log(`[Contentful] Found content type: ${candidate}`);
        return candidate;
      }
    }
    
    // If no exact match, log available types for debugging
    console.warn('[Contentful] Content type not found. Tried:', contentTypes);
    console.warn('[Contentful] Available content types:', availableTypes);
    
    // Fallback to first candidate
    return contentTypes[0];
  } catch (error: any) {
    console.error('[Contentful] Error finding content type:', error);
    return 'blogPost'; // Default fallback
  }
}

export async function upsertContentfulPost(
  post: {
    contentfulId?: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    published: boolean;
    tags?: string[];
    authorName?: string;
    publishedAt?: Date;
  },
  publish: boolean = true
): Promise<{ id: string; published: boolean } | null> {
  const client = getContentfulManagementClient();
  if (!client) {
    console.error('[Contentful] Management client not available. Check CONTENTFUL_MANAGEMENT_TOKEN.');
    return null;
  }

  const space = process.env.CONTENTFUL_SPACE_ID;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  if (!space) {
    console.error('[Contentful] CONTENTFUL_SPACE_ID not set');
    return null;
  }

  try {
    console.log(`[Contentful] Upserting post: ${post.title} (slug: ${post.slug})`);
    
    // Use the traditional API: getSpace -> getEnvironment -> entry operations
    const spaceClient = await client.getSpace(space);
    const env = await spaceClient.getEnvironment(environment);
    const fields = convertDbPostToContentfulFormat(post);

    // Find the correct content type name
    const contentTypeName = await findContentTypeName(env);
    if (!contentTypeName) {
      console.error('[Contentful] Could not determine content type name');
      return null;
    }

    let entry;

    // If contentfulId exists, update existing entry
    if (post.contentfulId) {
      try {
        console.log(`[Contentful] Updating existing entry: ${post.contentfulId}`);
        entry = await env.getEntry(post.contentfulId);
        entry.fields = fields;
        entry = await entry.update();
        console.log(`[Contentful] Entry updated successfully: ${entry.sys.id}`);
      } catch (error: any) {
        if (error.response?.status === 404 || error.status === 404) {
          // Entry doesn't exist, create new one
          console.log(`[Contentful] Entry ${post.contentfulId} not found, creating new entry`);
          entry = await env.createEntry(contentTypeName, { fields });
          console.log(`[Contentful] New entry created: ${entry.sys.id}`);
        } else {
          console.error(`[Contentful] Error updating entry:`, error);
          throw error;
        }
      }
    } else {
      // Create new entry
      console.log(`[Contentful] Creating new entry with content type: ${contentTypeName}`);
      entry = await env.createEntry(contentTypeName, { fields });
      console.log(`[Contentful] Entry created successfully: ${entry.sys.id}`);
    }

    // Publish if requested
    if (publish && post.published) {
      console.log(`[Contentful] Publishing entry: ${entry.sys.id}`);
      entry = await entry.publish();
      console.log(`[Contentful] Entry published successfully`);
    }

    return {
      id: entry.sys.id,
      published: entry.sys.publishedVersion !== undefined,
    };
  } catch (error: any) {
    console.error('[Contentful] Error upserting post:', error);
    if (error.response?.data) {
      console.error('[Contentful] API error details:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.message) {
      console.error('[Contentful] Error message:', error.message);
    }
    // Don't throw - let the caller handle gracefully
    return null;
  }
}

/**
 * Delete a blog post from Contentful
 */
export async function deleteContentfulPost(contentfulId: string): Promise<boolean> {
  const client = getContentfulManagementClient();
  if (!client) {
    return false;
  }

  const space = process.env.CONTENTFUL_SPACE_ID;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

  if (!space) {
    console.error('CONTENTFUL_SPACE_ID not set');
    return false;
  }

  try {
    // Use the traditional API: getSpace -> getEnvironment -> entry operations
    const spaceClient = await client.getSpace(space);
    const env = await spaceClient.getEnvironment(environment);
    const entry = await env.getEntry(contentfulId);

    // Unpublish first if published
    if (entry.sys.publishedVersion) {
      await entry.unpublish();
    }

    // Delete the entry
    await entry.delete();

    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      // Already deleted or doesn't exist
      return true;
    }
    console.error('Error deleting Contentful post:', error);
    return false;
  }
}

