import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsletterSignupProps {
  variant?: "default" | "inline" | "compact";
  className?: string;
}

export function NewsletterSignup({ variant = "default", className = "" }: NewsletterSignupProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Create a form element to submit to AWeber
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://www.aweber.com/scripts/addlead.pl";
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    // Add hidden fields
    const addHiddenField = (name: string, value: string) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addHiddenField("meta_web_form_id", "305644354");
    addHiddenField("meta_split_id", "");
    addHiddenField("listname", "awlist6912956");
    addHiddenField("redirect", window.location.href);
    addHiddenField("meta_adtracking", "Newsletter");
    addHiddenField("meta_message", "1");
    addHiddenField("meta_required", "name (awf_first),name (awf_last),email");
    addHiddenField("meta_tooltip", "");

    // Add form data
    addHiddenField("name (awf_first)", formData.firstName);
    addHiddenField("name (awf_last)", formData.lastName);
    addHiddenField("email", formData.email);

    document.body.appendChild(form);
    form.submit();
    
    // Show success message
    toast({
      title: "Successfully subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
    
    setIsSubmitting(false);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="flex-1"
          disabled={isSubmitting}
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          size="default"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="newsletter-first-name" className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newsletter-first-name"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsletter-last-name" className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newsletter-last-name"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newsletter-email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newsletter-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          We respect your{" "}
          <a
            href="https://www.aweber.com/permission.htm"
            target="_blank"
            rel="nofollow"
            className="text-primary hover:underline"
          >
            email privacy
          </a>
        </p>
      </form>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-sm text-muted-foreground">
          Get the latest news, updates, and tips delivered to your inbox.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="newsletter-first-name-default" className="text-sm font-medium">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newsletter-first-name-default"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsletter-last-name-default" className="text-sm font-medium">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="newsletter-last-name-default"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newsletter-email-default" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newsletter-email-default"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Subscribe to Newsletter
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          We respect your{" "}
          <a
            href="https://www.aweber.com/permission.htm"
            target="_blank"
            rel="nofollow"
            className="text-primary hover:underline"
          >
            email privacy
          </a>
        </p>
      </form>
    </div>
  );
}
