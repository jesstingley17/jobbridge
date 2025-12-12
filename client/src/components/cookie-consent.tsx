import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie, X, Settings, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  thirdParty: boolean;
}

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    functional: false,
    analytics: false,
    thirdParty: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      // Show banner on first visit
      setShowBanner(true);
    } else if (savedPreferences) {
      // Load saved preferences
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (e) {
        console.error("Error parsing cookie preferences:", e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      thirdParty: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      thirdParty: false,
    };
    savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    
    // Trigger custom event for other components to react to cookie preferences
    window.dispatchEvent(new CustomEvent("cookiePreferencesUpdated", { detail: prefs }));
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
    setShowBanner(false);
  };

  const handleShowBanner = () => {
    setShowBanner(true);
    setShowSettings(false);
  };

  if (!showBanner && !showSettings) {
    // Show a small button to reopen cookie settings
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleShowBanner}
          variant="outline"
          size="sm"
          className="gap-2 shadow-lg"
          aria-label="Manage cookie preferences"
        >
          <Cookie className="h-4 w-4" />
          Cookie Settings
        </Button>
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div className="fixed inset-0 bg-black/50" onClick={() => setShowSettings(false)} aria-hidden="true" />
        <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold">Cookie Preferences</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                aria-label="Close cookie settings"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Manage your cookie preferences. You can enable or disable different types of cookies below. 
              Essential cookies are always required for the website to function properly.
            </p>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Essential Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Required for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Always Active</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These cookies enable core features such as session authentication, security, and load balancing.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Functional Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Remember your preferences and enhance your experience.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These cookies remember your theme preferences, language settings, and user preferences.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Analytics Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors use our website.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These cookies collect information about website usage, such as pages visited and time spent on the site.
                </p>
              </div>

              {/* Third-Party Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">Third-Party Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Set by our partners for payment processing and content delivery.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.thirdParty}
                      onChange={(e) =>
                        setPreferences({ ...preferences, thirdParty: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These cookies are set by Stripe, Google Fonts, Vercel, Contentful, Supabase, and SearchAtlas/OTTO.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSavePreferences} className="flex-1">
                Save Preferences
              </Button>
              <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              For more information, please read our{" "}
              <Link href="/cookies" className="text-purple-600 dark:text-purple-400 hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-4xl shadow-2xl border-2">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <Cookie className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">We Use Cookies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences 
                or reject non-essential cookies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/cookies"
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Learn more in our Cookie Policy
                </Link>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto"
                size="sm"
              >
                Accept All
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="w-full sm:w-auto"
                size="sm"
              >
                Reject All
              </Button>
              <Button
                onClick={handleOpenSettings}
                variant="ghost"
                className="w-full sm:w-auto"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


