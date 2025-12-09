import { Link } from "wouter";
import { Briefcase, Heart, Shield, Accessibility } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold">The Job Bridge</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Breaking employment barriers for people with disabilities through AI-powered tools and inclusive hiring solutions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-jobs">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-resume">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/interview" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-interview">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-dashboard">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3" role="list">
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-features">
                  Features
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">About Us</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Careers</span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">Contact</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Accessibility</h3>
            <ul className="space-y-3" role="list">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Accessibility className="h-4 w-4" aria-hidden="true" />
                WCAG 2.1 Compliant
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Screen Reader Support
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Keyboard Navigation
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} The Job Bridge Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
              <span className="text-sm text-muted-foreground">Accessibility Statement</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
