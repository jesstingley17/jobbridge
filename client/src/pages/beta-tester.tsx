import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

// Beta tester signup page - accessible at /beta-tester and /beta
export default function BetaTester() {
  const [, setLocation] = useLocation();

  // Load HubSpot forms script and apply custom styling
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="hsforms.net"]')) {
      // Script already loaded, just apply styles
      applyHubSpotStyles();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-na2.hsforms.net/forms/embed/244677572.js';
    script.defer = true;
    
    // Wait for script to load, then wait for form to render
    script.onload = () => {
      // Wait for form to be injected into DOM
      const checkForm = setInterval(() => {
        const formFrame = document.querySelector('.hs-form-frame');
        if (formFrame && formFrame.querySelector('.hs-form')) {
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
      .hs-form-frame {
        font-family: var(--font-sans, Inter, system-ui, sans-serif);
      }

      /* Form container */
      .hs-form-frame .hs-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Field groups */
      .hs-form-frame .hs-form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0;
      }

      /* Labels - High contrast, clear typography */
      .hs-form-frame label {
        font-size: 0.875rem;
        font-weight: 500;
        color: hsl(var(--foreground)) !important;
        line-height: 1.5;
        margin-bottom: 0.375rem;
      }

      .hs-form-frame label.hs-form-required:after {
        content: " *";
        color: hsl(0 84% 45%);
        font-weight: 600;
      }

      /* Input fields - Match design system */
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
      .hs-form-frame input:focus,
      .hs-form-frame textarea:focus,
      .hs-form-frame select:focus {
        outline: none;
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
      }

      /* Hover states */
      .hs-form-frame input:hover,
      .hs-form-frame textarea:hover,
      .hs-form-frame select:hover {
        border-color: hsl(var(--input) / 0.8);
      }

      /* Textarea */
      .hs-form-frame textarea {
        min-height: 6rem;
        resize: vertical;
      }

      /* Select dropdowns */
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

      .hs-form-frame .hs-form-radio {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .hs-form-frame .hs-form-radio label {
        margin-bottom: 0;
        cursor: pointer;
      }

      /* Submit button - Match design system */
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

      .hs-form-frame input[type="submit"]:hover,
      .hs-form-frame .hs-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .hs-form-frame input[type="submit"]:focus,
      .hs-form-frame .hs-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
      }

      .hs-form-frame input[type="submit"]:active,
      .hs-form-frame .hs-button:active {
        transform: translateY(0);
      }

      /* Error messages - High contrast, clear */
      .hs-form-frame .hs-error-msgs {
        list-style: none;
        padding: 0;
        margin: 0.375rem 0 0 0;
      }

      .hs-form-frame .hs-error-msgs li {
        color: hsl(0 84% 45%);
        font-size: 0.8125rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .hs-form-frame .hs-error-msgs li:before {
        content: "⚠";
        font-size: 1rem;
      }

      /* Success messages */
      .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      /* Field descriptions/help text */
      .hs-form-frame .hs-field-desc {
        font-size: 0.8125rem;
        color: hsl(var(--muted-foreground)) !important;
        margin-top: 0.25rem;
        line-height: 1.4;
      }

      /* Ensure all text elements use proper colors */
      .hs-form-frame,
      .hs-form-frame * {
        color: inherit;
      }

      .hs-form-frame p,
      .hs-form-frame span,
      .hs-form-frame div:not(.hs-form-field) {
        color: hsl(var(--foreground)) !important;
      }

      /* Required field indicator */
      .hs-form-frame .hs-form-required {
        color: hsl(var(--foreground));
      }

      /* Loading state */
      .hs-form-frame .hs-submit-loading {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Dark mode support */
      .dark .hs-form-frame input[type="text"],
      .dark .hs-form-frame input[type="email"],
      .dark .hs-form-frame input[type="tel"],
      .dark .hs-form-frame input[type="number"],
      .dark .hs-form-frame textarea,
      .dark .hs-form-frame select,
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

      .dark .hs-form-frame label,
      [data-theme="dark"] .hs-form-frame label {
        color: hsl(var(--foreground)) !important;
      }

      .dark .hs-form-frame .hs-main-font-element,
      [data-theme="dark"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
      }

      .dark .hs-form-frame .hs-field-desc,
      [data-theme="dark"] .hs-form-frame .hs-field-desc {
        color: hsl(var(--muted-foreground)) !important;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
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
      .hs-form-frame .hs-form-field:last-child {
        margin-bottom: 0;
      }

      /* Accessibility: Ensure all interactive elements are keyboard accessible */
      .hs-form-frame *:focus-visible {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }

      /* Override HubSpot's default styles with !important where needed */
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
            <h1 className="text-4xl font-bold mb-4">Join Our Beta Program</h1>
            <p className="text-lg text-muted-foreground">
              Be among the first to experience The JobBridge and help shape the future of accessible job searching
            </p>
          </div>

          {/* HubSpot Form */}
          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>
                After submitting, you'll be redirected to create your account and access the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="hs-form-frame" 
                data-region="na2" 
                data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0" 
                data-portal-id="244677572"
                role="form"
                aria-label="Beta tester application form"
              ></div>
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
