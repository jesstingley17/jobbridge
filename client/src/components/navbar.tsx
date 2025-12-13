import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
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
import { Menu, X, Briefcase, FileText, MessageSquare, LayoutDashboard, Sparkles, User, LogOut, Dna, ClipboardList, Users, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase/client";
import { Logo } from "./logo";
import { CommunityUsernameEditor } from "./community-username-editor";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
  { href: "/pricing", label: "Pricing" },
  { href: "/beta-tester", label: "Beta" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  
  // Use Supabase Auth
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation("/auth/sign-in");
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocation("/auth/sign-up");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear query cache
      const { queryClient } = await import("@/lib/queryClient");
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to home
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if signOut fails
      setLocation("/");
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  // Helper to get user display info
  const getUserDisplayInfo = () => {
    if (user) {
      return {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.profileImageUrl || undefined,
        initials: getInitials(user.firstName, user.lastName),
      };
    }
    return null;
  };

  const userDisplay = getUserDisplayInfo();

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
            <Link href="/" data-testid="link-logo">
              <Logo size="sm" />
            </Link>

            <div className="hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href ? "text-primary" : "text-foreground"
                  }`}
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              {/* Show buttons when not authenticated */}
              {!isAuthenticated && (
                <>
                  <Button 
                    variant="ghost" 
                    data-testid="button-login" 
                    onClick={handleSignInClick}
                  >
                    Log In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                    data-testid="button-get-started" 
                    onClick={handleSignUpClick}
                  >
                    Get Started
                  </Button>
                </>
              )}
              
              {/* Show user menu when authenticated */}
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                      <Avatar className="h-7 w-7">
                        {userDisplay ? (
                          <>
                            <AvatarImage src={userDisplay.imageUrl} alt={`${userDisplay.firstName} ${userDisplay.lastName}`} />
                            <AvatarFallback className="text-xs">{userDisplay.initials}</AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="text-xs">U</AvatarFallback>
                        )}
                      </Avatar>
                      {userDisplay && <span className="hidden sm:inline">{userDisplay.firstName}</span>}
                      {!userDisplay && <span className="hidden sm:inline">User</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {userDisplay && (
                      <>
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
                        <DropdownMenuItem asChild>
                          <Link href="/applications" className="flex items-center gap-2" data-testid="link-applications">
                            <ClipboardList className="h-4 w-4" />
                            My Applications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5">
                          <CommunityUsernameEditor />
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
