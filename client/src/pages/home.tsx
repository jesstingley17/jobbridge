import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Search,
  ClipboardList,
  Accessibility,
  Brain,
  Heart,
  Shield,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Job Matching",
    description: "Advanced algorithms analyze 50+ career dimensions to create your unique Career DNA and match you with perfect opportunities.",
  },
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description: "Create ATS-optimized resumes with AI assistance that highlights your strengths and adapts to any job posting.",
  },
  {
    icon: MessageSquare,
    title: "Interview Preparation",
    description: "Practice with AI-generated questions tailored to your target role and receive personalized feedback.",
  },
  {
    icon: Search,
    title: "Accessible Job Search",
    description: "Find disability-friendly employers with comprehensive accommodation filters and accessibility features.",
  },
  {
    icon: ClipboardList,
    title: "Application Tracking",
    description: "Monitor all your applications in one place with insights on success rates and interview performance.",
  },
  {
    icon: Heart,
    title: "Wellness Support",
    description: "Mental health resources and career wellness guidance throughout your job search journey.",
  },
];

const stats = [
  { value: "10,000+", label: "Job Seekers Helped" },
  { value: "95%", label: "Accessibility Rating" },
  { value: "500+", label: "Inclusive Employers" },
  { value: "4.9/5", label: "User Satisfaction" },
];

const howItWorks = [
  {
    step: "1",
    title: "Create Your Profile",
    description: "Tell us about your skills, experience, and accessibility needs to build your Career DNA.",
  },
  {
    step: "2",
    title: "Get Matched",
    description: "Our AI finds opportunities from top job boards that match your unique profile.",
  },
  {
    step: "3",
    title: "Prepare & Apply",
    description: "Use our resume builder and interview prep tools to submit winning applications.",
  },
  {
    step: "4",
    title: "Track Progress",
    description: "Monitor your applications and get insights to improve your success rate.",
  },
];

export default function Home() {
  const { toast } = useToast();

  // Load HubSpot forms script and apply custom styling for waitlist form
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="hsforms.net/forms/embed"]')) {
      // Script already loaded, just apply styles
      applyHubSpotWaitlistStyles();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js-na2.hsforms.net/forms/embed/developer/244677572.js';
    script.defer = true;
    
    // Wait for script to load, then wait for form to render
    script.onload = () => {
      // Wait for form to be injected into DOM
      const checkForm = setInterval(() => {
        const waitlistForm = document.querySelector('[data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"]');
        if (waitlistForm && (waitlistForm.querySelector('.hs-form') || waitlistForm.querySelector('form'))) {
          clearInterval(checkForm);
          applyHubSpotWaitlistStyles();
        }
      }, 100);
      
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkForm), 10000);
    };
    
    document.head.appendChild(script);

    // Apply styles function
    function applyHubSpotWaitlistStyles() {
      // Check if styles already applied
      if (document.getElementById('hubspot-waitlist-form-custom-styles')) {
        return;
      }

      // Add custom CSS for HubSpot waitlist form accessibility and styling
      const style = document.createElement('style');
      style.id = 'hubspot-waitlist-form-custom-styles';
      style.textContent = `
      /* HubSpot Waitlist Form Accessibility & Design Styling */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame {
        font-family: var(--font-sans, Inter, system-ui, sans-serif);
      }

      /* Form container */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Field groups */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-field,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form-field,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0;
      }

      /* Labels - High contrast, clear typography */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame label {
        font-size: 0.875rem;
        font-weight: 500;
        color: hsl(var(--foreground)) !important;
        line-height: 1.5;
        margin-bottom: 0.375rem;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] label.hs-form-required:after,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html label.hs-form-required:after,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame label.hs-form-required:after {
        content: " *";
        color: hsl(0 84% 45%);
        font-weight: 600;
      }

      /* Input fields - Match design system */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select {
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
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select:focus {
        outline: none;
        border-color: hsl(var(--primary));
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1);
      }

      /* Hover states */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select:hover {
        border-color: hsl(var(--input) / 0.8);
      }

      /* Submit button - Match design system with gradient */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-button,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-button,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-button {
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

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="submit"]:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-button:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] button[type="submit"]:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="submit"]:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-button:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html button[type="submit"]:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="submit"]:hover,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-button:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="submit"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-button:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] button[type="submit"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="submit"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-button:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html button[type="submit"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="submit"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-button:focus {
        outline: none;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="submit"]:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-button:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] button[type="submit"]:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="submit"]:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-button:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html button[type="submit"]:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="submit"]:active,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-button:active {
        transform: translateY(0);
      }

      /* Error messages - High contrast, clear */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-error-msgs,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-error-msgs,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-error-msgs {
        list-style: none;
        padding: 0;
        margin: 0.375rem 0 0 0;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-error-msgs li,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-error-msgs li,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-error-msgs li {
        color: hsl(0 84% 45%);
        font-size: 0.8125rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-error-msgs li:before,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-error-msgs li:before,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-error-msgs li:before {
        content: "⚠";
        font-size: 1rem;
      }

      /* Field descriptions/help text */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-field-desc,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-field-desc,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-field-desc {
        font-size: 0.8125rem;
        color: hsl(var(--muted-foreground)) !important;
        margin-top: 0.25rem;
        line-height: 1.4;
      }

      /* Checkboxes and radio buttons */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="checkbox"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="radio"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="checkbox"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="radio"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="checkbox"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="radio"] {
        width: 1.25rem;
        height: 1.25rem;
        min-width: 1.25rem;
        min-height: 1.25rem;
        margin-right: 0.5rem;
        cursor: pointer;
        accent-color: hsl(var(--primary));
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-radio,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form-radio,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form-radio {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-radio label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form-radio label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form-radio label {
        margin-bottom: 0;
        cursor: pointer;
      }

      /* Loading state */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-submit-loading,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-submit-loading,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-submit-loading {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* Success messages */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-main-font-element,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-main-font-element,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      /* Dark mode support */
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="text"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="email"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="tel"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="number"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="text"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="email"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="tel"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="number"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="text"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="email"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="tel"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="number"],
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="text"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="email"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="tel"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="number"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="text"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="email"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="tel"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="number"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="text"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="email"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="tel"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="number"],
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select {
        background-color: hsl(var(--background)) !important;
        color: hsl(var(--foreground)) !important;
        border-color: hsl(var(--input)) !important;
      }

      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] label,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html label,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame label,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] label,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html label,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame label {
        color: hsl(var(--foreground)) !important;
      }

      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-main-font-element,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-main-font-element,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-main-font-element,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-main-font-element,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-main-font-element,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-main-font-element {
        color: hsl(var(--foreground)) !important;
      }

      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-field-desc,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-field-desc,
      .dark [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-field-desc,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-field-desc,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-field-desc,
      [data-theme="dark"] [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-field-desc {
        color: hsl(var(--muted-foreground)) !important;
      }

      /* Ensure all text elements use proper colors */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] *,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html *,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame * {
        color: inherit;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] p,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] span,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] div:not(.hs-form-field),
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html p,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html span,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html div:not(.hs-form-field),
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame p,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame span,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame div:not(.hs-form-field) {
        color: hsl(var(--foreground)) !important;
      }

      /* Required field indicator */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-required,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form-required,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form-required {
        color: hsl(var(--foreground));
      }

      /* Accessibility: Ensure all interactive elements are keyboard accessible */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] *:focus-visible,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html *:focus-visible,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame *:focus-visible {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="text"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="email"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="tel"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] input[type="number"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] textarea,
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] select,
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="text"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="email"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="tel"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html input[type="number"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html textarea,
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html select,
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="text"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="email"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="tel"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame input[type="number"],
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame textarea,
        [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame select {
          font-size: 1rem; /* Prevent zoom on iOS */
        }
      }

      /* Ensure proper spacing */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-field:last-child,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form-field:last-child,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form-field:last-child {
        margin-bottom: 0;
      }

      /* Override HubSpot's default styles with !important where needed */
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form select,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="text"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="email"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="tel"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="number"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form textarea,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form select {
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

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="text"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="email"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="tel"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="number"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="text"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="email"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="tel"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="number"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="text"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="email"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="tel"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="number"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="text"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="email"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="tel"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="number"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form select:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="text"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="email"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="tel"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="number"]:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form textarea:focus,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form select:focus {
        border-color: hsl(var(--primary)) !important;
        box-shadow: 0 0 0 3px hsl(var(--primary) / 0.1) !important;
        outline: none !important;
      }

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form .hs-button,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form .hs-button,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form button[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form input[type="submit"],
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form .hs-button {
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

      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] form label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html .hs-form label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-html form label,
      [data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb"] .hs-form-frame .hs-form label {
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: hsl(var(--foreground)) !important;
        font-family: var(--font-sans, Inter, system-ui, sans-serif) !important;
      }
    `;
      document.head.appendChild(style);
    }

    // Apply styles immediately (in case form is already loaded)
    applyHubSpotWaitlistStyles();

    // Also try applying after a delay to catch late-loading forms
    const delayedApply = setTimeout(() => {
      applyHubSpotWaitlistStyles();
    }, 2000);

    // Cleanup function
    return () => {
      clearTimeout(delayedApply);
      const existingStyle = document.getElementById('hubspot-waitlist-form-custom-styles');
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950/20 dark:via-pink-950/20 dark:to-background py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Large Logo */}
            <div className="mb-8 flex justify-center">
              <Logo size="xl" variant="vertical" showText={true} />
            </div>

            {/* CTA Button */}
            <div className="mb-8 flex justify-center">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-0 gap-2 px-8 py-6 text-lg"
                  data-testid="button-join-revolution"
                >
                  <Rocket className="h-5 w-5" aria-hidden="true" />
                  Join the JobBridge Revolution
                </Button>
              </Link>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Breaking Employment{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Barriers
              </span>{" "}
              for Everyone
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              The most comprehensive, accessible, and user-friendly job search platform designed with the success and wellbeing of people with disabilities in mind.
            </p>

            {/* Waitlist Form - HubSpot Integration */}
            <Card className="mt-10 mx-auto max-w-md border-primary/20 bg-background/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6 pb-6">
                <div 
                  className="hs-form-html" 
                  data-region="na2" 
                  data-form-id="1f0d787b-0c7b-4516-acdb-5f1baf3f4cfb" 
                  data-portal-id="244677572"
                  role="form"
                  aria-label="Waitlist signup form"
                ></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y bg-muted/30 py-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="features-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful AI tools and accessibility features designed to help you find and land your dream job.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="group relative overflow-visible">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="how-it-works-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your journey to meaningful employment in four simple steps.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Promise */}
      <section className="py-20 md:py-32" aria-labelledby="accessibility-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 id="accessibility-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for Accessibility from Day One
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Every feature is designed with accessibility at its core. We follow WCAG 2.1 guidelines and continuously test with assistive technologies.
              </p>
              <ul className="mt-8 space-y-4" role="list">
                {[
                  "Full screen reader support with ARIA labels",
                  "Complete keyboard navigation",
                  "High contrast color schemes",
                  "Adjustable text sizes up to 200%",
                  "Reduced motion options",
                  "Clear focus indicators",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Accessibility className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">WCAG 2.1</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Level AA Compliant</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Shield className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Privacy First</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Secure Data Handling</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Users className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">Community</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Peer Support Network</p>
                </CardContent>
              </Card>
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Zap className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold">AI Powered</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Smart Matching</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Join thousands of job seekers who have found meaningful employment through The Job Bridge.
          </p>
          <div className="mt-10">
            <Link href="/beta-tester">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 py-6 text-lg"
                data-testid="button-cta-get-started"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
