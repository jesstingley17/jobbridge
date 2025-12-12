import { useUser, useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * Test page to verify Clerk integration is working
 * Visit /clerk-test to see Clerk authentication state
 */
export default function ClerkTest() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, userId, isLoaded: authLoaded } = useAuth();

  if (!authLoaded || !userLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Clerk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Clerk Integration Test</CardTitle>
          <CardDescription>
            This page verifies that Clerk authentication is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
            <SignedIn>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 font-medium">✅ Signed In</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  User ID: {userId}
                </p>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">⚠️ Not Signed In</p>
                <div className="mt-4">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      Sign In to Test
                    </button>
                  </SignInButton>
                </div>
              </div>
            </SignedOut>
          </div>

          {isSignedIn && user && (
            <div>
              <h3 className="text-lg font-semibold mb-2">User Information</h3>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>First Name:</strong> {user.firstName || "Not set"}</p>
                <p><strong>Last Name:</strong> {user.lastName || "Not set"}</p>
                <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || "Not set"}</p>
                <p><strong>Image:</strong> {user.imageUrl ? "✅ Set" : "Not set"}</p>
                {user.imageUrl && (
                  <img 
                    src={user.imageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full mt-2"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Environment Check</h3>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p>
                <strong>VITE_CLERK_PUBLISHABLE_KEY:</strong>{" "}
                {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY 
                  ? "✅ Set" 
                  : "❌ Not set"}
              </p>
              <p>
                <strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:</strong>{" "}
                {import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 
                  ? "✅ Set" 
                  : "❌ Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
