import { Builder } from '@builder.io/react';

// Initialize Builder.io with your API key
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || '16cf08dded47468cae4597515afd4bac';

if (!BUILDER_API_KEY) {
  console.warn('⚠️ VITE_BUILDER_API_KEY environment variable not set.');
}

Builder.init(BUILDER_API_KEY);

export { Builder };
