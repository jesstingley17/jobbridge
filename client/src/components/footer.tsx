import { Link } from "wouter";
import { Heart, Shield, Accessibility, Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-br from-purple-50/50 via-teal-50/30 to-pink-50/50 dark:from-purple-950/20 dark:via-teal-950/10 dark:to-pink-950/20" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" data-testid="link-footer-logo">
              <Logo size="md" showText={true} variant="horizontal" />
            </Link>
            <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
              Breaking employment barriers for people with disabilities through AI-powered tools and inclusive hiring solutions.
            </p>
            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-500" aria-hidden="true" />
                <a href="mailto:info@thejobbridge-inc.com" className="hover:text-teal-600 transition-colors">
                  info@thejobbridge-inc.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-purple-500" aria-hidden="true" />
                <a href="tel:+13802662079" className="hover:text-purple-600 transition-colors">
                  +1 (380) 266-2079
                </a>
              </div>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="font-semibold mb-4 text-purple-600 dark:text-purple-400">Platform</h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link href="/jobs" className="text-sm text-foreground/70 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-jobs">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-sm text-foreground/70 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-resume">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/interview" className="text-sm text-foreground/70 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-interview">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-foreground/70 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4 text-teal-600 dark:text-teal-400">Company</h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link href="/features" className="text-sm text-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" data-testid="link-footer-features">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" data-testid="link-footer-blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility Column */}
          <div>
            <h3 className="font-semibold mb-4 text-pink-600 dark:text-pink-400">Accessibility</h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-center gap-2 text-sm text-foreground/70">
                <Accessibility className="h-4 w-4 text-pink-500" aria-hidden="true" />
                WCAG 2.1 Compliant
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/70">
                <Shield className="h-4 w-4 text-orange-500" aria-hidden="true" />
                Screen Reader Support
              </li>
              <li className="flex items-center gap-2 text-sm text-foreground/70">
                <Heart className="h-4 w-4 text-pink-500" aria-hidden="true" />
                Keyboard Navigation
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-foreground/70">
              &copy; {new Date().getFullYear()} The Job Bridge Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors" data-testid="link-footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-foreground/70 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" data-testid="link-footer-terms">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-sm text-foreground/70 hover:text-pink-600 dark:hover:text-pink-400 transition-colors" data-testid="link-footer-accessibility">
                Accessibility Statement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
