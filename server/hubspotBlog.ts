// HubSpot blog content integration
// Fetches blog posts from HubSpot Content API

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

/**
 * Fetch blog posts from HubSpot
 * @param portalId - HubSpot portal ID
 * @param accessToken - HubSpot private app access token
 * @param limit - Maximum number of posts to fetch (default: 50)
 */
export async function fetchHubSpotBlogPosts(
  portalId: string,
  accessToken: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  tags?: string[];
  featuredImage?: string;
}>> {
  try {
    // First, get the blog ID (we'll use the default blog or search for it)
    // HubSpot API endpoint for blog posts
    const blogPostsUrl = `${HUBSPOT_API_BASE}/content/api/v2/blog-posts?limit=${limit}&orderBy=-publishDate&state=PUBLISHED`;
    
    const response = await fetch(blogPostsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('[HubSpot Blog] API error:', response.status, errorText);
      throw new Error(`HubSpot API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const posts = data.objects || data || [];

    // Map HubSpot blog posts to our format
    return posts.map((post: any) => ({
      id: post.id?.toString() || post.guid || '',
      title: post.name || post.title || 'Untitled',
      url: post.url || post.absoluteUrl || '',
      content: post.postBody || post.post_summary || '',
      excerpt: post.postSummary || post.metaDescription || '',
      publishedAt: post.publishDate || post.created || new Date().toISOString(),
      updatedAt: post.updated || post.publishDate,
      authorName: post.blogAuthor?.displayName || post.blogAuthor?.fullName || null,
      tags: post.tagIds ? post.tagIds.map((tag: any) => typeof tag === 'string' ? tag : tag.name) : [],
      featuredImage: post.featuredImage || post.featuredImageUrl || undefined,
    }));
  } catch (error: any) {
    console.error('[HubSpot Blog] Error fetching posts:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID or URL
 */
export async function fetchHubSpotBlogPost(
  postIdOrUrl: string,
  accessToken: string
): Promise<{
  id: string;
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  tags?: string[];
  featuredImage?: string;
} | null> {
  try {
    // Try to fetch by ID first
    const postUrl = `${HUBSPOT_API_BASE}/content/api/v2/blog-posts/${postIdOrUrl}`;
    
    const response = await fetch(postUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const post = await response.json();
    
    return {
      id: post.id?.toString() || post.guid || '',
      title: post.name || post.title || 'Untitled',
      url: post.url || post.absoluteUrl || '',
      content: post.postBody || post.post_summary || '',
      excerpt: post.postSummary || post.metaDescription || '',
      publishedAt: post.publishDate || post.created || new Date().toISOString(),
      updatedAt: post.updated || post.publishDate,
      authorName: post.blogAuthor?.displayName || post.blogAuthor?.fullName || null,
      tags: post.tagIds ? post.tagIds.map((tag: any) => typeof tag === 'string' ? tag : tag.name) : [],
      featuredImage: post.featuredImage || post.featuredImageUrl || undefined,
    };
  } catch (error: any) {
    console.error('[HubSpot Blog] Error fetching post:', error);
    return null;
  }
}
