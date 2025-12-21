// Pinecone vector database client setup
// Used for semantic search, embeddings, and AI-powered features
import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

/**
 * Get or initialize Pinecone client
 * Reads PINECONE_API_KEY from environment variables
 */
export function getPineconeClient(): Pinecone | null {
  const apiKey = process.env.PINECONE_API_KEY;

  if (!apiKey) {
    console.warn('[Pinecone] PINECONE_API_KEY not set. Pinecone features will be unavailable.');
    return null;
  }

  if (pineconeClient) {
    return pineconeClient;
  }

  try {
    // Pinecone v1+ requires only apiKey, environment is optional for serverless
    pineconeClient = new Pinecone({
      apiKey: apiKey,
    } as any); // Type assertion to handle optional environment
    console.log('[Pinecone] Client initialized successfully');
    return pineconeClient;
  } catch (error: any) {
    console.error('[Pinecone] Failed to initialize client:', error.message);
    return null;
  }
}

/**
 * Get a Pinecone index by name
 * @param indexName - Name of the index to retrieve
 */
export async function getPineconeIndex(indexName: string) {
  const client = getPineconeClient();
  if (!client) {
    throw new Error('Pinecone client not initialized. Set PINECONE_API_KEY environment variable.');
  }

  try {
    const index = client.index(indexName);
    return index;
  } catch (error: any) {
    console.error(`[Pinecone] Failed to get index "${indexName}":`, error.message);
    throw error;
  }
}

/**
 * Check if Pinecone is configured
 */
export function isPineconeConfigured(): boolean {
  return !!process.env.PINECONE_API_KEY && !!getPineconeClient();
}

/**
 * List all indexes in your Pinecone project
 */
export async function listPineconeIndexes() {
  const client = getPineconeClient();
  if (!client) {
    throw new Error('Pinecone client not initialized. Set PINECONE_API_KEY environment variable.');
  }

  try {
    const indexes = await client.listIndexes();
    return indexes;
  } catch (error: any) {
    console.error('[Pinecone] Failed to list indexes:', error.message);
    throw error;
  }
}

/**
 * Upsert vectors to a Pinecone index
 * @param indexName - Name of the index
 * @param vectors - Array of vectors with id, values, and optional metadata
 */
export async function upsertVectors(
  indexName: string,
  vectors: Array<{
    id: string;
    values: number[];
    metadata?: Record<string, any>;
  }>
) {
  const index = await getPineconeIndex(indexName);
  try {
    await index.upsert(vectors);
    console.log(`[Pinecone] Upserted ${vectors.length} vectors to index "${indexName}"`);
  } catch (error: any) {
    console.error(`[Pinecone] Failed to upsert vectors to "${indexName}":`, error.message);
    throw error;
  }
}

/**
 * Query vectors from a Pinecone index
 * @param indexName - Name of the index
 * @param queryVector - The vector to search for
 * @param topK - Number of results to return (default: 10)
 * @param filter - Optional metadata filter
 */
export async function queryVectors(
  indexName: string,
  queryVector: number[],
  topK: number = 10,
  filter?: Record<string, any>
) {
  const index = await getPineconeIndex(indexName);
  try {
    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      ...(filter && { filter }),
    });
    return queryResponse;
  } catch (error: any) {
    console.error(`[Pinecone] Failed to query index "${indexName}":`, error.message);
    throw error;
  }
}

/**
 * Delete vectors from a Pinecone index
 * @param indexName - Name of the index
 * @param ids - Array of vector IDs to delete
 */
export async function deleteVectors(indexName: string, ids: string[]) {
  const index = await getPineconeIndex(indexName);
  try {
    await index.deleteMany(ids);
    console.log(`[Pinecone] Deleted ${ids.length} vectors from index "${indexName}"`);
  } catch (error: any) {
    console.error(`[Pinecone] Failed to delete vectors from "${indexName}":`, error.message);
    throw error;
  }
}
