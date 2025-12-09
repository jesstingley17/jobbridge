import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Briefcase, FileText, MessageSquare, LayoutDashboard, Sparkles, User, LogOut, Dna } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/", label: "Home", icon: null },
  { href: "/features", label: "Features", icon: Sparkles },
  { href: "/jobs", label: "Find Jobs", icon: Briefcase },
  { href: "/resume", label: "Resume Builder", icon: FileText },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-4 focus:ring-ring"
        data-testid="link-skip-to-content"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold tracking-tight">The Job Bridge</span>
            </Link>

            <div className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    className="gap-2"
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {!isLoading && (
                isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
                          <AvatarFallback className="text-xs">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">{user.firstName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2" data-testid="link-profile">
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/career-dna" className="flex items-center gap-2" data-testid="link-career-dna">
                          <Dna className="h-4 w-4" />
                          Career DNA
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild data-testid="button-login">
                    <a href="/api/login">Log in</a>
                  </Button>
                )
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                data-testid="button-mobile-menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isOpen && (
            <div
              id="mobile-menu"
              className="border-t py-4 md:hidden"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      onClick={() => setIsOpen(false)}
                      data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.icon && <item.icon className="h-5 w-5" aria-hidden="true" />}
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
