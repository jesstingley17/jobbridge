import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

// Beta tester signup page - accessible at /beta-tester and /beta
export default function BetaTester() {
  const [, setLocation] = useLocation();

  // Load HubSpot forms script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="hsforms.net"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-na2.hsforms.net/forms/embed/244677572.js';
    script.defer = true;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src*="hsforms.net"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Join Our Beta Program</h1>
            <p className="text-xl text-muted-foreground mb-2">
              Be among the first to experience The JobBridge, Inc
            </p>
            <p className="text-muted-foreground">
              Help shape the future of accessible job searching
            </p>
          </div>

          {/* HubSpot Form */}
          <Card>
            <CardHeader>
              <CardTitle>Beta Tester Application</CardTitle>
              <CardDescription>
                Fill out the form below to join our beta testing program. After submitting, you'll be redirected to create your account and access the platform.
              </CardDescription>
              {/* HubSpot form will load here */}
            </CardHeader>
            <CardContent>
              <div className="hs-form-frame" data-region="na2" data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0" data-portal-id="244677572"></div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setLocation("/auth")}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
