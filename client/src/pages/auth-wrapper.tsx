import { useEffect, useState } from "react";
import { BuilderComponent, builder, useIsPreviewing } from "@builder.io/react";
import { registerBuilderComponents } from "@/lib/builder-registry";
import AuthClerk from "./auth-clerk";
import Auth from "./auth";

// Get API keys from environment variables
const BUILDER_API_KEY = import.meta.env.VITE_BUILDER_API_KEY || "";
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

// Initialize Builder.io if API key is available
if (BUILDER_API_KEY) {
  builder.init(BUILDER_API_KEY);
  registerBuilderComponents();
}

export default function AuthWrapper() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isPreviewing = useIsPreviewing();

  useEffect(() => {
    if (!BUILDER_API_KEY) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Fetch Builder.io content for /auth page
    builder
      .get("page", {
        userAttributes: {
          urlPath: "/auth",
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
  }, []);

  // Priority: Builder.io > Clerk > Default Auth
  // If Builder.io content exists, use it
  if (BUILDER_API_KEY && (content || isPreviewing)) {
    if (loading && !isPreviewing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="builder-auth-page">
        <BuilderComponent model="page" content={content} />
      </div>
    );
  }

  // If Clerk is configured, use Clerk auth
  if (CLERK_PUBLISHABLE_KEY) {
    return <AuthClerk />;
  }

  // Fall back to default auth
  return <Auth />;
}
