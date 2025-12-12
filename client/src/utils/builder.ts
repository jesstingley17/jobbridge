// Builder.io initialization - graceful fallback if package not installed
let Builder: any = null;

try {
  const builderModule = await import('@builder.io/react');
  Builder = builderModule.Builder;
  
  const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || '16cf08dded47468cae4597515afd4bac';
  
  if (!BUILDER_API_KEY) {
    console.warn('⚠️ VITE_BUILDER_API_KEY environment variable not set.');
  }
  
  if (Builder?.init) {
    Builder.init(BUILDER_API_KEY);
    console.log('✓ Builder.io initialized with API key');
  }
} catch (error) {
  console.warn('⚠️ Builder.io SDK not installed. Install with: npm install @builder.io/react @builder.io/sdk');
  console.warn('Error details:', error instanceof Error ? error.message : error);
}

export { Builder };
