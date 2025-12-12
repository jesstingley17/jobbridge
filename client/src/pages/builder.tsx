import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { registerBuilderComponents } from "@/lib/builder-registry";

// Get API key from environment variable
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || "";

// Initialize Builder.io if API key is available
if (BUILDER_API_KEY) {
  builder.init(BUILDER_API_KEY);
  // Register custom components for Builder.io
  registerBuilderComponents();
}

export default function BuilderPage() {
  const [location] = useLocation();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isPreviewing = useIsPreviewing();

  // Extract page path from URL (e.g., /cms/page-name or /cms/)
  // Remove /cms prefix and use the remaining path, default to "/" if empty
  const pagePath = location.startsWith("/cms") 
    ? (location === "/cms" ? "/" : location.replace("/cms", "") || "/")
    : location;

  useEffect(() => {
    if (!BUILDER_API_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch Builder.io content using userAttributes.urlPath
    builder
      .get("page", {
        userAttributes: {
          urlPath: pagePath,
        },
        options: {
          includeRefs: true,
        },
      })
      .promise()
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Builder.io content:", error);
        setLoading(false);
      });
  }, [pagePath]);

  // Show error if no API key
  if (!BUILDER_API_KEY) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Builder.io Not Configured</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please set the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">VITE_BUILDER_API_KEY</code> environment variable.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            You can get your API key from{" "}
            <a
              href="https://builder.io/account/space"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Builder.io Settings
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading && !isPreviewing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  // Show message if no content found (only if not previewing)
  if (!content && !isPreviewing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No Builder.io content found for path: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{pagePath}</code>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Create this page in{" "}
            <a
              href="https://builder.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Builder.io
            </a>{" "}
            and set the URL path to match this route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      <BuilderComponent model="page" content={content} />
    </div>
  );
}
