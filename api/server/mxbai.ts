/**
 * Mixedbread AI (MXBAI) Integration
 * 
 * Mixedbread AI provides embedding and vector search capabilities.
 * This module provides a client for interacting with the MXBAI API.
 */

interface MXBAIConfig {
  apiKey: string;
  storeId: string;
  baseUrl?: string;
}

class MXBAIClient {
  private apiKey: string;
  private storeId: string;
  private baseUrl: string;

  constructor(config: MXBAIConfig) {
    this.apiKey = config.apiKey;
    this.storeId = config.storeId;
    this.baseUrl = config.baseUrl || 'https://api.mixedbread.ai';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create embeddings for text
   */
  async createEmbedding(text: string | string[]): Promise<any> {
    const texts = Array.isArray(text) ? text : [text];
    
    try {
      const response = await fetch(`${this.baseUrl}/v1/embeddings`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: texts,
          model: 'mixedbread-ai/mxbai-embed-large-v1',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MXBAI API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  /**
   * Search in the vector store
   */
  async search(query: string, limit: number = 10): Promise<any> {
    try {
      // First, create embedding for the query
      const embeddingResponse = await this.createEmbedding(query);
      const queryEmbedding = embeddingResponse.data[0].embedding;

      // Then search in the store
      const response = await fetch(`${this.baseUrl}/v1/stores/${this.storeId}/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query: queryEmbedding,
          limit,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MXBAI search error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Array<{ id?: string; text: string; metadata?: Record<string, any> }>): Promise<any> {
    try {
      // Create embeddings for all documents
      const texts = documents.map(doc => doc.text);
      const embeddingResponse = await this.createEmbedding(texts);
      const embeddings = embeddingResponse.data.map((item: any) => item.embedding);

      // Prepare documents with embeddings
      const documentsWithEmbeddings = documents.map((doc, index) => ({
        id: doc.id || `doc_${Date.now()}_${index}`,
        embedding: embeddings[index],
        text: doc.text,
        metadata: doc.metadata || {},
      }));

      // Add to store
      const response = await fetch(`${this.baseUrl}/v1/stores/${this.storeId}/documents`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          documents: documentsWithEmbeddings,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MXBAI add documents error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding documents:', error);
      throw error;
    }
  }
}

let mxbaiClient: MXBAIClient | null = null;

/**
 * Get or create MXBAI client instance
 */
export function getMXBAIClient(): MXBAIClient | null {
  const apiKey = process.env.MXBAI_API_KEY;
  const storeId = process.env.MXBAI_STORE_ID;

  if (!apiKey || !storeId) {
    console.warn('MXBAI_API_KEY and MXBAI_STORE_ID must be set in environment variables');
    return null;
  }

  if (!mxbaiClient) {
    mxbaiClient = new MXBAIClient({
      apiKey,
      storeId,
    });
  }

  return mxbaiClient;
}

/**
 * Helper function to create embeddings
 */
export async function createEmbedding(text: string | string[]): Promise<any> {
  const client = getMXBAIClient();
  if (!client) {
    throw new Error('MXBAI client not initialized. Check environment variables.');
  }
  return client.createEmbedding(text);
}

/**
 * Helper function to search in vector store
 */
export async function searchVectorStore(query: string, limit: number = 10): Promise<any> {
  const client = getMXBAIClient();
  if (!client) {
    throw new Error('MXBAI client not initialized. Check environment variables.');
  }
  return client.search(query, limit);
}

/**
 * Helper function to add documents to vector store
 */
export async function addDocumentsToStore(documents: Array<{ id?: string; text: string; metadata?: Record<string, any> }>): Promise<any> {
  const client = getMXBAIClient();
  if (!client) {
    throw new Error('MXBAI client not initialized. Check environment variables.');
  }
  return client.addDocuments(documents);
}


