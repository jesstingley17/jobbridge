import { NewsletterSignup } from "@/components/newsletter-signup";

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Sign Up for Our Newsletter
          </h1>
          <p className="mt-4 text-muted-foreground">
            Get the latest JobBridge news, feature updates, and resources for job seekers with disabilities
            delivered straight to your inbox.
          </p>
        </div>
        <div className="bg-background/80 backdrop-blur-sm border rounded-xl shadow-sm p-6 sm:p-8">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
}

