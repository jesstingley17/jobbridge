// Pinecone-powered job search and matching utilities
import { getPineconeIndex, queryVectors, upsertVectors, deleteVectors } from './pinecone.js';
import { getAIClient } from './aiGateway.js';
import OpenAI from 'openai';

const DEFAULT_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'jobbridge-jobs';
const EMBEDDING_MODEL = 'text-embedding-3-small'; // OpenAI embedding model

/**
 * Generate embeddings for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const aiClient = getAIClient();
  
  if (!aiClient) {
    throw new Error('No AI client configured. Cannot generate embeddings.');
  }

  let openaiClient: OpenAI;
  
  if (aiClient.type === 'openai') {
    openaiClient = aiClient.client;
  } else {
    // For gateway, we need to create a direct OpenAI client for embeddings
    // Embeddings typically need direct OpenAI access
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
    
    if (!apiKey) {
      throw new Error('OpenAI API key required for embeddings. Set AI_INTEGRATIONS_OPENAI_API_KEY');
    }
    
    openaiClient = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });
  }

  try {
    const response = await openaiClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('[Pinecone Jobs] Failed to generate embedding:', error.message);
    throw error;
  }
}

/**
 * Index a job in Pinecone for semantic search
 */
export async function indexJob(job: {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  type?: string;
  requirements?: string;
}) {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('[Pinecone Jobs] Pinecone not configured, skipping job indexing');
    return;
  }

  try {
    // Create a searchable text from job details
    const searchableText = [
      job.title,
      job.description,
      job.company,
      job.location,
      job.type,
      job.requirements,
    ]
      .filter(Boolean)
      .join(' ');

    // Generate embedding
    const embedding = await generateEmbedding(searchableText);

    // Upsert to Pinecone
    await upsertVectors(DEFAULT_INDEX_NAME, [
      {
        id: `job-${job.id}`,
        values: embedding,
        metadata: {
          jobId: job.id,
          title: job.title,
          company: job.company || '',
          location: job.location || '',
          type: job.type || '',
          source: 'jobbridge',
        },
      },
    ]);

    console.log(`[Pinecone Jobs] Indexed job: ${job.title} (${job.id})`);
  } catch (error: any) {
    console.error(`[Pinecone Jobs] Failed to index job ${job.id}:`, error.message);
    // Don't throw - allow job creation to continue even if indexing fails
  }
}

/**
 * Search jobs using semantic similarity
 */
export async function searchJobsSemantic(
  query: string,
  topK: number = 20,
  filters?: {
    location?: string;
    type?: string;
    company?: string;
  }
): Promise<Array<{ jobId: string; score: number; metadata: any }>> {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('[Pinecone Jobs] Pinecone not configured, returning empty results');
    return [];
  }

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build metadata filter if provided
    const filter: Record<string, any> = {};
    if (filters?.location) {
      filter.location = { $eq: filters.location };
    }
    if (filters?.type) {
      filter.type = { $eq: filters.type };
    }
    if (filters?.company) {
      filter.company = { $eq: filters.company };
    }

    // Query Pinecone
    const results = await queryVectors(
      DEFAULT_INDEX_NAME,
      queryEmbedding,
      topK,
      Object.keys(filter).length > 0 ? filter : undefined
    );

    // Map results
    return (results.matches || []).map((match: any) => ({
      jobId: match.metadata?.jobId || match.id?.replace('job-', ''),
      score: match.score || 0,
      metadata: match.metadata || {},
    }));
  } catch (error: any) {
    console.error('[Pinecone Jobs] Semantic search failed:', error.message);
    return [];
  }
}

/**
 * Match resume to jobs using semantic similarity
 */
export async function matchResumeToJobs(
  resumeText: string,
  topK: number = 10
): Promise<Array<{ jobId: string; score: number; metadata: any }>> {
  return searchJobsSemantic(resumeText, topK);
}

/**
 * Remove a job from Pinecone index
 */
export async function removeJobFromIndex(jobId: string) {
  if (!process.env.PINECONE_API_KEY) {
    return;
  }

  try {
    await deleteVectors(DEFAULT_INDEX_NAME, [`job-${jobId}`]);
    console.log(`[Pinecone Jobs] Removed job ${jobId} from index`);
  } catch (error: any) {
    console.error(`[Pinecone Jobs] Failed to remove job ${jobId}:`, error.message);
  }
}
