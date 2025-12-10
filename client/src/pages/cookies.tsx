import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, Settings, BarChart, Mail, ExternalLink } from "lucide-react";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Cookie className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-3xl">Cookie Policy</CardTitle>
            </div>
            <p className="text-muted-foreground">Last Updated: December 10, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p className="lead">
              At The JobBridge, Inc. ("we", "us", "our"), we are committed to protecting your privacy 
              and ensuring that your personal information is handled in a safe and responsible manner. 
              This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, 
              and your choices regarding cookies when you visit our website at{" "}
              <a href="https://thejobbridge-inc.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                https://thejobbridge-inc.com
              </a>{" "}
              (the "Website").
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Cookie className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              What Are Cookies?
            </h2>
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, smartphone) 
              when you visit a website. They are widely used to make websites work more efficiently, as well 
              as to provide information to the owners of the site. Cookies can be classified into different 
              categories based on their purpose and duration.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Types of Cookies We Use
            </h2>

            <h3>Essential Cookies:</h3>
            <p>
              These cookies are necessary for the functionality of our Website. They enable core features such 
              as session authentication, security, and load balancing. Without these cookies, the Website cannot 
              function properly.
            </p>
            <p><strong>Examples</strong>: Session cookies for maintaining login sessions, security cookies to protect against unauthorized access.</p>

            <h3>Functional Cookies:</h3>
            <p>
              Functional cookies allow us to remember your preferences and enhance your experience on our Website. 
              These cookies enable us to provide personalized features such as theme preferences and language settings.
            </p>
            <p><strong>Examples</strong>: Cookies that remember your user preferences during your visit.</p>

            <h3>Analytics Cookies:</h3>
            <p>
              These cookies help us analyze how our visitors use the Website, allowing us to improve its performance 
              and user experience. We use analytics cookies to collect information about website usage, such as the 
              pages visited and the time spent on the site.
            </p>
            <p><strong>Examples</strong>: Cookies from SearchAtlas/OTTO for usage statistics.</p>

            <h3>Third-Party Cookies:</h3>
            <p>
              We also use third-party cookies provided by our partners for various purposes, including payment 
              processing and content delivery. These cookies may collect information about your online activities 
              over time and across different websites.
            </p>
            <p><strong>Examples:</strong></p>
            <ul>
              <li><strong>Stripe</strong>: For secure payment processing and managing subscriptions.</li>
              <li><strong>Google Fonts</strong>: For delivering font styles used on our Website.</li>
              <li><strong>Vercel</strong>: For hosting and analytics purposes.</li>
              <li><strong>Contentful</strong>: For delivering blog content.</li>
              <li><strong>Supabase</strong>: For database management.</li>
              <li><strong>SearchAtlas/OTTO</strong>: For SEO analytics.</li>
            </ul>

            <h2 className="mt-8">Cookie Duration</h2>
            <p>Cookies can be classified based on their duration:</p>
            <ul>
              <li><strong>Session Cookies</strong>: These cookies expire once you close your browser. They are used to maintain your session on our Website.</li>
              <li><strong>Persistent Cookies</strong>: These cookies remain on your device for a specified period, ranging from 7 days to 2 years, depending on the type of cookie. They are used to remember your preferences for future visits.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-8">
              <BarChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              How We Use Cookies
            </h2>
            <p>We use cookies for the following purposes:</p>
            <ol>
              <li><strong>Authentication and Security</strong>: To maintain login sessions and protect against unauthorized access.</li>
              <li><strong>Website Functionality</strong>: To enable core features and remember your preferences.</li>
              <li><strong>Performance Optimization</strong>: To analyze performance and optimize load times.</li>
              <li><strong>User Experience Enhancement</strong>: To personalize your experience and remember your settings.</li>
              <li><strong>Analytics and Insights</strong>: To understand user behavior and track feature usage.</li>
              <li><strong>Payment Processing</strong>: To securely process transactions through Stripe.</li>
              <li><strong>Content Delivery</strong>: To deliver blog content and optimize loading times.</li>
            </ol>

            <h2 className="flex items-center gap-2 mt-8">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Your Choices Regarding Cookies
            </h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can manage your cookie 
              preferences in the following ways:
            </p>
            <ul>
              <li>
                <strong>Browser Settings</strong>: Most web browsers allow you to control cookies through their settings. 
                You can set your browser to refuse cookies or to alert you when cookies are being sent. However, if you 
                choose to refuse cookies, you may not be able to use the full functionality of our Website.
              </li>
              <li>
                <strong>Cookie Consent Banner</strong>: When you first visit our Website, you will see a cookie consent 
                banner that provides information about our use of cookies. You can accept or reject non-essential cookies 
                through this banner.
              </li>
              <li>
                <strong>Opt-Out Links</strong>: For certain third-party cookies, you may find opt-out links provided by 
                the respective service providers.
              </li>
            </ul>

            <h2 className="mt-8">Changes to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
              operational, legal, or regulatory reasons. We encourage you to review this Cookie Policy periodically to 
              stay informed about our use of cookies.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Contact Us
            </h2>
            <p>If you have any questions about our Cookie Policy or our practices regarding cookies, please contact us at:</p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold mb-2">The JobBridge, Inc.</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <strong>Email:</strong>{" "}
                <a href="mailto:help@thejobbridge-inc.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                  help@thejobbridge-inc.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <strong>Website:</strong>{" "}
                <a href="https://thejobbridge-inc.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  https://thejobbridge-inc.com
                </a>
              </div>
            </div>

            <p className="mt-8 text-muted-foreground">
              By using our Website, you consent to our use of cookies as described in this Cookie Policy. 
              Thank you for taking the time to understand our cookie practices.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
