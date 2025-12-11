import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Users, BookOpen, Sparkles, Clock, Gift } from "lucide-react";
import { Link } from "wouter";

export default function EarlyAccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-950/20 dark:via-pink-950/20 dark:to-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-2">
              Welcome to Early Access!
            </CardTitle>
            <CardDescription className="text-lg">
              You're now part of our exclusive beta testing program
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Platform Features Coming Soon
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    The full platform features (job matching, resume builder, interview prep, etc.) are not yet available. 
                    You'll be among the <strong>first beta testers</strong> when we launch! We'll notify you as soon as 
                    features become available.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">What You'll Get Access To:</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold">Email Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about platform launches, new features, and important announcements
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <h4 className="font-semibold">Community Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Stay informed about community events, networking opportunities, and peer connections
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h4 className="font-semibold">Blog Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new blog posts, career tips, and industry insights
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">You're a Beta Tester!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    As one of our early access members, you'll be the first to:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Test new features before public launch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Provide feedback to shape the platform</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Get priority support and exclusive resources</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span>Access special beta tester benefits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="flex-1" variant="outline">
                <Link href="/blog">Browse Blog</Link>
              </Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/about">Learn More</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground pt-4">
              We'll send you an email as soon as platform features become available. 
              Thank you for being part of our journey!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

