import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import '../utils/builder';

export default function BuilderPage() {
  const [location] = useLocation();
  const [BuilderComponent, setBuilderComponent] = useState<any>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBuilder = async () => {
      try {
        const { BuilderComponent, useIsPreviewing } = await import('@builder.io/react');
        setBuilderComponent(() => BuilderComponent);
        setIsPreviewing(useIsPreviewing());
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load Builder.io';
        setError(errorMsg);
        console.error('Builder.io loading error:', err);
      }
    };

    loadBuilder();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Builder.io Not Available</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">
            Install Builder.io SDK: <code className="bg-red-100 px-2 py-1 rounded">npm install @builder.io/react</code>
          </p>
        </div>
      </div>
    );
  }

  if (!BuilderComponent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Builder.io...</p>
        </div>
      </div>
    );
  }

  const path = location.replace(/^\/builder/, '') || '/';

  return (
    <div className="min-h-screen bg-white">
      <BuilderComponent 
        model="page" 
        entry={path}
        options={{
          includeRefs: true,
        }}
      />
      {isPreviewing && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
          Preview Mode
        </div>
      )}
    </div>
  );
}
