import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Clock, Mail } from "lucide-react";

// Beta tester signup page - accessible at /beta-tester and /beta
export default function BetaTester() {
  const [, setLocation] = useLocation();

  // Load HubSpot forms script and apply custom styling
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="hsforms.net/forms/embed"]')) {
      // Script already loaded, just apply styles
      applyHubSpotStyles();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-na2.hsforms.net/forms/embed/developer/244677572.js';
    script.defer = true;
    
    // Wait for script to load, then wait for form to render
    script.onload = () => {
      // Wait for form to be injected into DOM
      const checkForm = setInterval(() => {
        const formContainer = document.querySelector('.hs-form-html');
        if (formContainer && (formContainer.querySelector('.hs-form') || formContainer.querySelector('form'))) {
          clearInterval(checkForm);
          applyHubSpotStyles();
        }
      }, 100);
      
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkForm), 10000);
    };
    
    document.head.appendChild(script);

    // Apply styles function
    function applyHubSpotStyles() {
      // Check if styles already applied
      if (document.getElementById('hubspot-form-custom-styles')) {
        return;
      }

      // Add custom CSS for HubSpot form accessibility and styling
      const style = document.createElement('style');
      style.id = 'hubspot-form-custom-styles';
      style.textContent = `
      /* HubSpot Form Accessibility & Design Styling */
      .hs-form-html,
      .hs-form-frame {
        font-family: var(--font-sans, Inter, system-ui, sans-serif);
      }

      /* Form container */
      .hs-form-html .hs-form,
      .hs-form-html form,
      .hs-form-frame .hs-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Field groups */
      .hs-form-html .hs-form-field,
      .hs-form-frame .hs-form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0;
      }

      /* Labels - High contrast, clear typography */
      .hs-form-html label,
      .hs-form-frame label {
        font-size: 0.875rem;
        font-weight: 500;
        color: hsl(var(--foreground)) !important;
        line-height: 1.5;
        margin-bottom: 0.375rem;
      }

      .hs-form-html label.hs-form-required:after,
      .hs-form-frame label.hs-form-required:after {
        content: " *";
        color: hsl(0 84% 45%);
        font-weight: 600;
      }

      /* Input fields - Match design system */
      .hs-form-html input[type="text"],
      .hs-form-html input[type="email"],
      .hs-form-html input[type="tel"],
      .hs-form-html input[type="number"],
      .hs-form-html textarea,
      .hs-form-html select,
      .hs-form-frame input[type="text"],
      .hs-form-frame input[type="email"],
      .hs-form-frame input[type="tel"],
      .hs-form-frame input[type="number"],
      .hs-form-frame textarea,
      .hs-form-frame select {
        width: 100%;
        min-height: 2.75rem;
        padding: 0.625rem 0.875rem;
        font-size: 0.875rem;
        line-height: 1.5;
        color: hsl(var(--foreground));
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--input));
        border-radius: 0.5625rem;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      /* Focus states - High visibility for accessibility */
      .hs-form-html input:focus,
      .hs-form-html textarea:focus,
      .hs-form-html select:focus,
      .hs-form-frame input:focus,
      .hs-form-frame textarea:focus,
      .hs-form-frame select:focus {
        outline: none;
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
      }

      /* Hover states */
      .hs-form-html input:hover,
      .hs-form-html textarea:hover,
      .hs-form-html select:hover,
      .hs-form-frame input:hover,
      .hs-form-frame textarea:hover,
      .hs-form-frame select:hover {
        border-color: hsl(var(--input) / 0.8);
      }

      /* Textarea */
      .hs-form-html textarea,
      .hs-form-frame textarea {
        min-height: 6rem;
        resize: vertical;
      }

      /* Select dropdowns */
      .hs-form-html select,
      .hs-form-frame select {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 0.75rem;
        padding-right: 2.5rem;
        appearance: none;
      }

      /* Checkboxes and radio buttons - Larger touch targets */
      .hs-form-html input[type="checkbox"],
      .hs-form-html input[type="radio"],
      .hs-form-frame input[type="checkbox"],
      .hs-form-frame input[type="radio"] {
        width: 1.25rem;
        height: 1.25rem;
        min-width: 1.25rem;
        min-height: 1.25rem;
        margin-right: 0.5rem;
        cursor: pointer;
        accent-color: hsl(var(--primary));
      }

      .hs-form-html .hs-form-radio,
      .hs-form-frame .hs-form-radio {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .hs-form-html .hs-form-radio label,
      .hs-form-frame .hs-form-radio label {
        margin-bottom: 0;
        cursor: pointer;
      }

      /* Submit button - Match design system */
      .hs-form-html input[type="submit"],
      .hs-form-html .hs-button,
      .hs-form-html button[type="submit"],
      .hs-form-frame input[type="submit"],
      .hs-form-frame .hs-button {
        min-height: 2.75rem;
        padding: 0.625rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: hsl(var(--primary-foreground));
        background-color: hsl(var(--primary));
        border: 1px solid hsl(var(--primary-border));
        border-radius: 0.5625rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        width: 100%;
        margin-top: 0.5rem;
      }

      .hs-form-html input[type="submit"]:hover,
      .hs-form-html .hs-button:hover,
      .hs-form-html button[type="submit"]:hover,
      .hs-form-frame input[type="submit"]:hover,
      .hs-form-frame .hs-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .hs-form-html input[type="submit"]:focus,
      .hs-form-html .hs-button:focus,
      .hs-form-html button[type="submit"]:focus,
      .hs-form-frame input[type="submit"]:focus,
      .hs-form-frame .hs-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
      }

      .hs-form-html input[type="submit"]:active,
      .hs-form-html .hs-button:active,
      .hs-form-html button[type="submit"]:active,
      .hs-form-frame input[type="submit"]:active,
      .hs-form-frame .hs-button:active {
        transform: translateY(0);
      }

      /* Error messages - High contrast, clear */
      .hs-form-html .hs-error-msgs,
      .hs-form-frame .hs-error-msgs {
        list-style: none;
        padding: 0;
        margin: 0.375rem 0 0 0;
      }

      .hs-form-html .hs-error-msgs li,
      .hs-form-frame .hs-error-msgs li {
        color: hsl(0 84% 45%);
        font-size: 0.8125rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .hs-form-html .hs-error-msgs li:before,
      .hs-form-frame .hs-error-msgs li:before {
        content: "⚠";
        font-size: 1rem;
      }

      /* Success messages */
      .hs-form-html .hs-main-font-element,
      .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      /* Field descriptions/help text */
      .hs-form-html .hs-field-desc,
      .hs-form-frame .hs-field-desc {
        font-size: 0.8125rem;
        color: hsl(var(--muted-foreground)) !important;
        margin-top: 0.25rem;
        line-height: 1.4;
      }

      /* Ensure all text elements use proper colors */
      .hs-form-html,
      .hs-form-html *,
      .hs-form-frame,
      .hs-form-frame * {
        color: inherit;
      }

      .hs-form-html p,
      .hs-form-html span,
      .hs-form-html div:not(.hs-form-field),
      .hs-form-frame p,
      .hs-form-frame span,
      .hs-form-frame div:not(.hs-form-field) {
        color: hsl(var(--foreground)) !important;
      }

      /* Required field indicator */
      .hs-form-html .hs-form-required,
      .hs-form-frame .hs-form-required {
        color: hsl(var(--foreground));
      }

      /* Loading state */
      .hs-form-html .hs-submit-loading,
      .hs-form-frame .hs-submit-loading {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Dark mode support */
      .dark .hs-form-html input[type="text"],
      .dark .hs-form-html input[type="email"],
      .dark .hs-form-html input[type="tel"],
      .dark .hs-form-html input[type="number"],
      .dark .hs-form-html textarea,
      .dark .hs-form-html select,
      .dark .hs-form-frame input[type="text"],
      .dark .hs-form-frame input[type="email"],
      .dark .hs-form-frame input[type="tel"],
      .dark .hs-form-frame input[type="number"],
      .dark .hs-form-frame textarea,
      .dark .hs-form-frame select,
      [data-theme="dark"] .hs-form-html input[type="text"],
      [data-theme="dark"] .hs-form-html input[type="email"],
      [data-theme="dark"] .hs-form-html input[type="tel"],
      [data-theme="dark"] .hs-form-html input[type="number"],
      [data-theme="dark"] .hs-form-html textarea,
      [data-theme="dark"] .hs-form-html select,
      [data-theme="dark"] .hs-form-frame input[type="text"],
      [data-theme="dark"] .hs-form-frame input[type="email"],
      [data-theme="dark"] .hs-form-frame input[type="tel"],
      [data-theme="dark"] .hs-form-frame input[type="number"],
      [data-theme="dark"] .hs-form-frame textarea,
      [data-theme="dark"] .hs-form-frame select {
        background-color: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        border-color: hsl(var(--input)) !important;
      }

      .dark .hs-form-html label,
      .dark .hs-form-frame label,
      [data-theme="dark"] .hs-form-html label,
      [data-theme="dark"] .hs-form-frame label {
        color: hsl(var(--foreground)) !important;
      }

      .dark .hs-form-html .hs-main-font-element,
      .dark .hs-form-frame .hs-main-font-element,
      [data-theme="dark"] .hs-form-html .hs-main-font-element,
      [data-theme="dark"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
      }

      .dark .hs-form-html .hs-field-desc,
      .dark .hs-form-frame .hs-field-desc,
      [data-theme="dark"] .hs-form-html .hs-field-desc,
      [data-theme="dark"] .hs-form-frame .hs-field-desc {
        color: hsl(var(--muted-foreground)) !important;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .hs-form-html input[type="text"],
        .hs-form-html input[type="email"],
        .hs-form-html input[type="tel"],
        .hs-form-html input[type="number"],
        .hs-form-html textarea,
        .hs-form-html select,
        .hs-form-frame input[type="text"],
        .hs-form-frame input[type="email"],
        .hs-form-frame input[type="tel"],
        .hs-form-frame input[type="number"],
        .hs-form-frame textarea,
        .hs-form-frame select {
          font-size: 1rem; /* Prevent zoom on iOS */
        }
      }

      /* Ensure proper spacing */
      .hs-form-html .hs-form-field:last-child,
      .hs-form-frame .hs-form-field:last-child {
        margin-bottom: 0;
      }

      /* Accessibility: Ensure all interactive elements are keyboard accessible */
      .hs-form-html *:focus-visible,
      .hs-form-frame *:focus-visible {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }

      /* Override HubSpot's default styles with !important where needed */
      .hs-form-html .hs-form input[type="text"],
      .hs-form-html .hs-form input[type="email"],
      .hs-form-html .hs-form input[type="tel"],
      .hs-form-html .hs-form input[type="number"],
      .hs-form-html .hs-form textarea,
      .hs-form-html .hs-form select,
      .hs-form-html form input[type="text"],
      .hs-form-html form input[type="email"],
      .hs-form-html form input[type="tel"],
      .hs-form-html form input[type="number"],
      .hs-form-html form textarea,
      .hs-form-html form select,
      .hs-form-frame .hs-form input[type="text"],
      .hs-form-frame .hs-form input[type="email"],
      .hs-form-frame .hs-form input[type="tel"],
      .hs-form-frame .hs-form input[type="number"],
      .hs-form-frame .hs-form textarea,
      .hs-form-frame .hs-form select {
        width: 100% !important;
        min-height: 2.75rem !important;
        padding: 0.625rem 0.875rem !important;
        font-size: 0.875rem !important;
        line-height: 1.5 !important;
        color: hsl(var(--foreground)) !important;
        background-color: hsl(var(--background)) !important;
        border: 1px solid hsl(var(--input)) !important;
        border-radius: 0.5625rem !important;
        font-family: var(--font-sans, Inter, system-ui, sans-serif) !important;
      }

      .hs-form-html .hs-form input[type="text"]:focus,
      .hs-form-html .hs-form input[type="email"]:focus,
      .hs-form-html .hs-form input[type="tel"]:focus,
      .hs-form-html .hs-form input[type="number"]:focus,
      .hs-form-html .hs-form textarea:focus,
      .hs-form-html .hs-form select:focus,
      .hs-form-html form input[type="text"]:focus,
      .hs-form-html form input[type="email"]:focus,
      .hs-form-html form input[type="tel"]:focus,
      .hs-form-html form input[type="number"]:focus,
      .hs-form-html form textarea:focus,
      .hs-form-html form select:focus,
      .hs-form-frame .hs-form input[type="text"]:focus,
      .hs-form-frame .hs-form input[type="email"]:focus,
      .hs-form-frame .hs-form input[type="tel"]:focus,
      .hs-form-frame .hs-form input[type="number"]:focus,
      .hs-form-frame .hs-form textarea:focus,
      .hs-form-frame .hs-form select:focus {
        border-color: hsl(var(--primary)) !important;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1) !important;
        outline: none !important;
      }

      .hs-form-html .hs-form input[type="submit"],
      .hs-form-html .hs-form .hs-button,
      .hs-form-html .hs-form button[type="submit"],
      .hs-form-html form input[type="submit"],
      .hs-form-html form button[type="submit"],
      .hs-form-frame .hs-form input[type="submit"],
      .hs-form-frame .hs-form .hs-button {
        min-height: 2.75rem !important;
        padding: 0.625rem 1.5rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: hsl(var(--primary-foreground)) !important;
        background-color: hsl(var(--primary)) !important;
        border: 1px solid hsl(var(--primary-border)) !important;
        border-radius: 0.5625rem !important;
        width: 100% !important;
        font-family: var(--font-sans, Inter, system-ui, sans-serif) !important;
      }

      .hs-form-html .hs-form label,
      .hs-form-html form label,
      .hs-form-frame .hs-form label {
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: hsl(var(--foreground)) !important;
        font-family: var(--font-sans, Inter, system-ui, sans-serif) !important;
      }
    `;
      document.head.appendChild(style);
    }

    // Apply styles immediately (in case form is already loaded)
    applyHubSpotStyles();

    // Also try applying after a delay to catch late-loading forms
    const delayedApply = setTimeout(() => {
      applyHubSpotStyles();
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(delayedApply);
      const existingStyle = document.getElementById('hubspot-form-custom-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
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
            <h1 className="text-4xl font-bold mb-4">Apply for Beta Access</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Be among the first to experience The JobBridge and help shape the future of accessible job searching
            </p>
            
            {/* Beta Tester Benefits */}
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/50 bg-primary/10 px-4 py-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-primary">Full Platform Access</p>
                <p className="text-sm text-muted-foreground">
                  Beta testers get access to <strong>all features</strong> including Pro and Enterprise tier functionality at no cost.
                </p>
              </div>
            </div>

            {/* Manual Approval Warning */}
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <div className="text-left">
                <p className="font-semibold text-amber-900 dark:text-amber-100">Manual Approval Required</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Beta access is granted by manual review. You'll receive an email notification once your application has been reviewed.
                </p>
              </div>
            </div>

            {/* Active Participation Requirement */}
            <div className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 mb-4">
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Active Participation Required</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Beta testers must be <strong>actively using the platform</strong> and <strong>providing regular feedback</strong> to maintain access. Inactive accounts may have access revoked.
                </p>
              </div>
            </div>
          </div>

          {/* HubSpot Form */}
          <Card>
            <CardHeader>
              <CardTitle>Beta Tester Application</CardTitle>
              <CardDescription className="space-y-2">
                <p>
                  <strong className="text-foreground">Important:</strong> This is an application form, not an immediate signup.
                </p>
                <p>
                  Your application will be reviewed manually by our team. If approved, you'll receive an email with instructions to create your account and access the platform.
                </p>
                <div className="rounded-md bg-primary/10 border border-primary/20 p-3 mt-3">
                  <p className="text-sm font-semibold text-foreground mb-1">Beta Tester Benefits:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Full access to all platform features (Pro + Enterprise tiers)</li>
                    <li>No subscription fees during beta period</li>
                    <li>Direct input on product development</li>
                  </ul>
                  <p className="text-sm font-semibold text-foreground mt-3 mb-1">Requirements:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Active platform usage (regular logins and feature testing)</li>
                    <li>Regular feedback submission (bug reports, feature requests, usability insights)</li>
                    <li>Participation in beta surveys and interviews when requested</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground italic mt-3">
                  Please allow 2-5 business days for review. We'll notify you via email once a decision has been made.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="hs-form-html" 
                data-region="na2" 
                data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0" 
                data-portal-id="244677572"
                role="form"
                aria-label="Beta tester application form"
              ></div>
            </CardContent>
          </Card>

          {/* Approval Process Info */}
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 text-center">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">1. Submit Your Application</p>
                    <p className="text-sm text-muted-foreground">Fill out the form above with your information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">2. Manual Review Process</p>
                    <p className="text-sm text-muted-foreground">Our team will review your application (typically 2-5 business days).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3. Approval Notification</p>
                    <p className="text-sm text-muted-foreground">If approved, you'll receive an email with account creation instructions.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline p-0 h-auto bg-transparent border-0 cursor-pointer"
                onClick={() => setLocation("/auth")}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
