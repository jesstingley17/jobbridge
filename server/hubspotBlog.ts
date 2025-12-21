// HubSpot blog content integration
// Fetches blog posts from HubSpot CMS API v3

const HUBSPOT_API_BASE = 'https://api.hubapi.com';

/**
 * Fetch blog posts from HubSpot CMS API v3
 * @param accessToken - HubSpot private app access token
 * @param limit - Maximum number of posts to fetch (default: 50)
 */
export async function fetchHubSpotBlogPosts(
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
    // HubSpot CMS API v3 endpoint for blog posts
    // Use the newer v3 API which is more reliable
    const blogPostsUrl = `${HUBSPOT_API_BASE}/cms/v3/blogs/posts?limit=${limit}&sort=-createdAt`;
    
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
    const posts = data.results || data.objects || data || [];

    // Map HubSpot blog posts to our format
    return posts.map((post: any) => {
      // Extract content - HubSpot v3 API structure
      const postBody = post.postBody || post.html || post.content || '';
      const excerpt = post.postSummary || post.metaDescription || post.summary || '';
      
      return {
        id: post.id?.toString() || post.guid || '',
        title: post.name || post.title || 'Untitled',
        url: post.url || post.absoluteUrl || post.fullUrl || '',
        content: postBody,
        excerpt: excerpt,
        publishedAt: post.publishDate || post.createdAt || post.created || new Date().toISOString(),
        updatedAt: post.updatedAt || post.updated || post.publishDate,
        authorName: post.blogAuthor?.displayName || post.blogAuthor?.fullName || post.authorName || null,
        tags: post.tagIds ? 
          post.tagIds.map((tag: any) => typeof tag === 'string' ? tag : tag.name || tag) : 
          (post.tags || []),
        featuredImage: post.featuredImage || post.featuredImageUrl || post.featuredImageUrl || undefined,
      };
    });
  } catch (error: any) {
    console.error('[HubSpot Blog] Error fetching posts:', error);
    throw error;
  }
}

/**
 * Fetch a single blog post by ID
 */
export async function fetchHubSpotBlogPost(
  postId: string,
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
    // HubSpot CMS API v3 endpoint for a single post
    const postUrl = `${HUBSPOT_API_BASE}/cms/v3/blogs/posts/${postId}`;
    
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
      id: post.id?.toString() || '',
      title: post.name || post.title || 'Untitled',
      url: post.url || post.absoluteUrl || post.fullUrl || '',
      content: post.postBody || post.html || post.content || '',
      excerpt: post.postSummary || post.metaDescription || post.summary || '',
      publishedAt: post.publishDate || post.createdAt || post.created || new Date().toISOString(),
      updatedAt: post.updatedAt || post.updated || post.publishDate,
      authorName: post.blogAuthor?.displayName || post.blogAuthor?.fullName || post.authorName || null,
      tags: post.tagIds ? 
        post.tagIds.map((tag: any) => typeof tag === 'string' ? tag : tag.name || tag) : 
        (post.tags || []),
      featuredImage: post.featuredImage || post.featuredImageUrl || undefined,
    };
  } catch (error: any) {
    console.error('[HubSpot Blog] Error fetching post:', error);
    return null;
  }
}
