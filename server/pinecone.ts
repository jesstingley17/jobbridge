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
    pineconeClient = new Pinecone({
      apiKey: apiKey,
    });
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
