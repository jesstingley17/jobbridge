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
      // Also check for form after a delay
      setTimeout(() => {
        applyHubSpotStyles();
      }, 1000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-na2.hsforms.net/forms/embed/developer/244677572.js';
    script.defer = true;
    
    // Wait for script to load, then wait for form to render
    script.onload = () => {
      // Wait for form to be injected into DOM (HubSpot auto-renders forms)
      const checkForm = setInterval(() => {
        const formContainer = document.querySelector('[data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"]');
        if (formContainer && (formContainer.querySelector('.hs-form') || formContainer.querySelector('form') || formContainer.innerHTML.trim().length > 0)) {
          clearInterval(checkForm);
          applyHubSpotStyles();
        }
      }, 200);
      
      // Stop checking after 15 seconds
      setTimeout(() => clearInterval(checkForm), 15000);
    };
    
    script.onerror = () => {
      console.error('Failed to load HubSpot forms script');
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
      /* HubSpot Beta Tester Form Accessibility & Design Styling */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame {
        font-family: var(--font-sans, Inter, system-ui, sans-serif);
      }

      /* Form container */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Field groups */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-field,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form-field,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0;
      }

      /* Labels - High contrast, clear typography */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame label {
        font-size: 0.875rem;
        font-weight: 500;
        color: hsl(var(--foreground)) !important;
        line-height: 1.5;
        margin-bottom: 0.375rem;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] label.hs-form-required:after,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html label.hs-form-required:after,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame label.hs-form-required:after {
        content: " *";
        color: hsl(0 84% 45%);
        font-weight: 600;
      }

      /* Input fields - Match design system */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select {
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
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select:focus {
        outline: none;
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
      }

      /* Hover states */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select:hover {
        border-color: hsl(var(--input) / 0.8);
      }

      /* Textarea */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea {
        min-height: 6rem;
        resize: vertical;
      }

      /* Select dropdowns */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select {
        cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 0.75rem;
        padding-right: 2.5rem;
        appearance: none;
      }

      /* Checkboxes and radio buttons - Larger touch targets */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="checkbox"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="radio"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="checkbox"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="radio"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="checkbox"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="radio"] {
        width: 1.25rem;
        height: 1.25rem;
        min-width: 1.25rem;
        min-height: 1.25rem;
        margin-right: 0.5rem;
        cursor: pointer;
        accent-color: hsl(var(--primary));
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-radio,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form-radio,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form-radio {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-radio label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form-radio label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form-radio label {
        margin-bottom: 0;
        cursor: pointer;
      }

      /* Submit button - Match design system with gradient */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-button,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-button,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-button {
        min-height: 2.75rem;
        padding: 0.625rem 1.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: white !important;
        background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8)) !important;
        border: none !important;
        border-radius: 0.5625rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        width: 100%;
        margin-top: 0.5rem;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="submit"]:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-button:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] button[type="submit"]:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="submit"]:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-button:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html button[type="submit"]:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="submit"]:hover,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="submit"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-button:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] button[type="submit"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="submit"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-button:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html button[type="submit"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="submit"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="submit"]:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-button:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] button[type="submit"]:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="submit"]:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-button:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html button[type="submit"]:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="submit"]:active,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-button:active {
        transform: translateY(0);
      }

      /* Error messages - High contrast, clear */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-error-msgs,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-error-msgs,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-error-msgs {
        list-style: none;
        padding: 0;
        margin: 0.375rem 0 0 0;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-error-msgs li,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-error-msgs li,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-error-msgs li {
        color: hsl(0 84% 45%);
        font-size: 0.8125rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-error-msgs li:before,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-error-msgs li:before,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-error-msgs li:before {
        content: "⚠";
        font-size: 1rem;
      }

      /* Success messages */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-main-font-element,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-main-font-element,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      /* Field descriptions/help text */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-field-desc,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-field-desc,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-field-desc {
        font-size: 0.8125rem;
        color: hsl(var(--muted-foreground)) !important;
        margin-top: 0.25rem;
        line-height: 1.4;
      }

      /* Ensure all text elements use proper colors */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] *,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html *,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame * {
        color: inherit;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] p,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] span,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] div:not(.hs-form-field),
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html p,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html span,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html div:not(.hs-form-field),
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame p,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame span,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame div:not(.hs-form-field) {
        color: hsl(var(--foreground)) !important;
      }

      /* Required field indicator */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-required,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form-required,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form-required {
        color: hsl(var(--foreground));
      }

      /* Loading state */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-submit-loading,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-submit-loading,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-submit-loading {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Dark mode support */
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="text"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="email"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="tel"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="number"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="text"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="email"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="tel"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="number"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="text"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="email"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="tel"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="number"],
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="text"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="email"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="tel"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="number"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="text"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="email"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="tel"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="number"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="text"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="email"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="tel"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="number"],
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select {
        background-color: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        border-color: hsl(var(--input)) !important;
      }

      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] label,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html label,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame label,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] label,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html label,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame label {
        color: hsl(var(--foreground)) !important;
      }

      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-main-font-element,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-main-font-element,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-main-font-element,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-main-font-element,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-main-font-element,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
      }

      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-field-desc,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-field-desc,
      .dark [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-field-desc,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-field-desc,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-field-desc,
      [data-theme="dark"] [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-field-desc {
        color: hsl(var(--muted-foreground)) !important;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="text"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="email"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="tel"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] input[type="number"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] textarea,
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] select,
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="text"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="email"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="tel"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html input[type="number"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html textarea,
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html select,
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="text"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="email"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="tel"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame input[type="number"],
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame textarea,
        [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame select {
          font-size: 1rem; /* Prevent zoom on iOS */
        }
      }

      /* Ensure proper spacing */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-field:last-child,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form-field:last-child,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form-field:last-child {
        margin-bottom: 0;
      }

      /* Accessibility: Ensure all interactive elements are keyboard accessible */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] *:focus-visible,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html *:focus-visible,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame *:focus-visible {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }

      /* Override HubSpot's default styles with !important where needed */
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form select,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="text"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="email"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="tel"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="number"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form textarea,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form select {
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

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="text"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="email"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="tel"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="number"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="text"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="email"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="tel"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="number"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="text"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="email"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="tel"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="number"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="text"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="email"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="tel"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="number"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form select:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="text"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="email"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="tel"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="number"]:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form textarea:focus,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form select:focus {
        border-color: hsl(var(--primary)) !important;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1) !important;
        outline: none !important;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form .hs-button,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form .hs-button,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form button[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form input[type="submit"],
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form .hs-button {
        min-height: 2.75rem !important;
        padding: 0.625rem 1.5rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: white !important;
        background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8)) !important;
        border: none !important;
        border-radius: 0.5625rem !important;
        width: 100% !important;
        font-family: var(--font-sans, Inter, system-ui, sans-serif) !important;
      }

      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] form label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html .hs-form label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-html form label,
      [data-form-id="0dbbf15a-78b1-4ec3-8dd0-32cbb2ea1ad0"] .hs-form-frame .hs-form label {
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

    // Also try applying after delays to catch late-loading forms
    const delayedApply1 = setTimeout(() => {
      applyHubSpotStyles();
    }, 1000);
    
    const delayedApply2 = setTimeout(() => {
      applyHubSpotStyles();
    }, 3000);
    
    const delayedApply3 = setTimeout(() => {
      applyHubSpotStyles();
    }, 5000);

    // Cleanup function
    return () => {
      clearTimeout(delayedApply1);
      clearTimeout(delayedApply2);
      clearTimeout(delayedApply3);
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
                <p className="font-semibold text-primary">Full Platform Access Based on Your Role</p>
                <p className="text-sm text-muted-foreground">
                  Beta testers get <strong>full access to all features</strong> according to their selected role:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside ml-2">
                  <li><strong>Job Seekers</strong> → Pro tier (all AI features, unlimited applications)</li>
                  <li><strong>Employers</strong> → Enterprise tier (analytics, API access, team features)</li>
                  <li><strong>Developers/Partners</strong> → Enterprise tier (API access, advanced features)</li>
                </ul>
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
                <p className="text-sm font-semibold text-foreground mt-3">
                  🎯 <strong>Your Access Level:</strong> Beta testers receive <strong>full access to all features</strong> based on the role they select:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside ml-4">
                  <li>Select <strong>"Job Seeker"</strong> → You'll get <strong>Pro tier</strong> access (all AI features, unlimited applications)</li>
                  <li>Select <strong>"Employer"</strong> → You'll get <strong>Enterprise tier</strong> access (analytics, API, team features, job posting)</li>
                  <li>Select <strong>"Developer/Partner"</strong> → You'll get <strong>Enterprise tier</strong> access (API, analytics, all advanced features)</li>
                </ul>
                <div className="rounded-md bg-primary/10 border border-primary/20 p-3 mt-3">
                  <p className="text-sm font-semibold text-foreground mb-1">Beta Tester Benefits (Based on Your Role):</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Job Seekers:</strong> Full Pro tier access - unlimited applications, AI resume builder, interview prep, job recommendations, and all AI-powered features</li>
                    <li><strong>Employers:</strong> Full Enterprise tier access - job posting, analytics dashboard, API access, team management, and all platform features</li>
                    <li><strong>Developers/Partners:</strong> Full Enterprise tier access - API access, analytics, team features, and all platform capabilities</li>
                    <li>No subscription fees during beta period</li>
                    <li>Direct input on product development</li>
                  </ul>
                  <p className="text-sm font-semibold text-foreground mt-3 mb-1">Requirements:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Active platform usage (regular logins and feature testing)</li>
                    <li>Regular feedback submission (bug reports, feature requests, usability insights)</li>
                    <li>Participation in beta surveys and interviews when requested</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    <strong>Note:</strong> Your access level will be automatically set based on the role you select in the application form below.
                  </p>
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

          {/* Lifetime Access Incentive */}
          <Card className="mt-8 border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center rounded-full bg-green-500/20 p-3 mb-3">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-green-900 dark:text-green-100">Lifetime Access Reward</h3>
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  At the end of the beta testing period, the <strong>most active beta testers</strong> will receive <strong>lifetime free access</strong> to the platform!
                </p>
              </div>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <p className="font-semibold">How to qualify:</p>
                <ul className="space-y-1 list-disc list-inside ml-2">
                  <li>Consistent platform usage throughout the beta period</li>
                  <li>Regular, detailed feedback submissions</li>
                  <li>Active participation in beta surveys and interviews</li>
                  <li>Helpful bug reports and feature suggestions</li>
                  <li>Engagement with the beta tester community</li>
                </ul>
                <p className="mt-3 text-xs italic text-green-600 dark:text-green-400">
                  The more active and engaged you are, the better your chances of earning lifetime access!
                </p>
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
