import { BuilderComponent, useIsPreviewing } from '@builder.io/react';
import { useLocation } from 'wouter';
import '../utils/builder';

export default function BuilderPage() {
  const [location] = useLocation();
  const isPreviewing = useIsPreviewing();
  
  // Extract the path for Builder content lookup
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
