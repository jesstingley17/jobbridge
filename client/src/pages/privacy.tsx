import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Mail, Phone, MapPin } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-muted-foreground">Effective Date: December 10, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p className="lead">
              At The JobBridge, Inc. ("we," "us," or "our"), we are committed to protecting your privacy. 
              This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when 
              you visit our website, thejobbridge-inc.com (the "Site"), or use our services (collectively, the "Services"). 
              We comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA) 
              to ensure your data is handled with care and in accordance with applicable laws.
            </p>

            <p>
              By accessing or using our Services, you agree to the terms of this Privacy Policy. If you do not agree 
              with the terms of this policy, please do not access the Site or use our Services.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              1. Information We Collect
            </h2>
            <p>We collect various types of information to provide and improve our Services. The information we collect includes:</p>

            <h3>1.1 Personal Information</h3>
            <ul>
              <li><strong>Contact Information</strong>: Name, email address, phone number, and location.</li>
              <li><strong>Profile Images</strong>: Images uploaded by users for their profiles.</li>
            </ul>

            <h3>1.2 Account Data</h3>
            <ul>
              <li><strong>Authentication Information</strong>: Hashed passwords, session tokens, and user roles.</li>
            </ul>

            <h3>1.3 Career Data</h3>
            <ul>
              <li><strong>Professional Information</strong>: Skills, accessibility needs, Career DNA scores, resume content, work and education history.</li>
            </ul>

            <h3>1.4 Application Data</h3>
            <ul>
              <li><strong>Job Application Information</strong>: Job applications, cover letters, and interview sessions.</li>
            </ul>

            <h3>1.5 Payment Data</h3>
            <ul>
              <li><strong>Financial Information</strong>: Stripe customer/subscription IDs for payment processing.</li>
            </ul>

            <h3>1.6 Usage Data</h3>
            <ul>
              <li><strong>Analytics</strong>: Application counts, view counts, and feature usage statistics.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-8">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              2. Purpose of Data Collection
            </h2>
            <p>We collect and process your information for the following purposes:</p>
            <ul>
              <li><strong>Account Management</strong>: To create and manage your account and provide authentication.</li>
              <li><strong>Job Matching</strong>: To provide AI-powered job matching and recommendations tailored to your profile.</li>
              <li><strong>Resume Services</strong>: To assist in building and optimizing resumes.</li>
              <li><strong>Interview Preparation</strong>: To prepare personalized interview questions based on your profile.</li>
              <li><strong>Career Guidance</strong>: To conduct Career DNA assessments and provide career guidance.</li>
              <li><strong>Community Features</strong>: To facilitate mentoring and peer connections within our community.</li>
              <li><strong>Payment Processing</strong>: To manage subscriptions and process payments securely through Stripe.</li>
              <li><strong>Customer Support</strong>: To communicate with you regarding your inquiries and provide customer support.</li>
              <li><strong>Platform Improvement</strong>: To analyze usage data for improving our Services and user experience.</li>
              <li><strong>Legal Compliance</strong>: To comply with applicable laws and regulations.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-8">
              <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              3. Legal Basis for Processing Personal Data (GDPR)
            </h2>
            <p>If you are located in the European Economic Area (EEA), our legal basis for collecting and using your personal information is as follows:</p>
            <ul>
              <li><strong>Consent</strong>: We may process your data if you have given us explicit consent to use your personal information for a specific purpose.</li>
              <li><strong>Contractual Necessity</strong>: We may process your data to fulfill our contractual obligations to you.</li>
              <li><strong>Legal Obligation</strong>: We may process your data to comply with applicable legal obligations.</li>
              <li><strong>Legitimate Interests</strong>: We may process your data when it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
            </ul>

            <h2 className="mt-8">4. Your Rights Under GDPR and CCPA</h2>

            <h3>4.1 GDPR Rights</h3>
            <p>If you are a resident of the EEA, you have the following rights under the GDPR:</p>
            <ul>
              <li><strong>Right to Access</strong>: You have the right to request copies of your personal data.</li>
              <li><strong>Right to Rectification</strong>: You have the right to request that we correct any information you believe is inaccurate or incomplete.</li>
              <li><strong>Right to Erasure</strong>: You have the right to request the deletion of your personal data under certain conditions.</li>
              <li><strong>Right to Restrict Processing</strong>: You have the right to request that we restrict the processing of your personal data under certain conditions.</li>
              <li><strong>Right to Data Portability</strong>: You have the right to request that we transfer the data we have collected to another organization, or directly to you, under certain conditions.</li>
              <li><strong>Right to Withdraw Consent</strong>: You have the right to withdraw your consent at any time where we rely on your consent to process your personal data.</li>
            </ul>

            <h3>4.2 CCPA Rights</h3>
            <p>If you are a California resident, you have the following rights under the CCPA:</p>
            <ul>
              <li><strong>Right to Know</strong>: You have the right to request information about the categories and specific pieces of personal data we have collected about you.</li>
              <li><strong>Right to Delete</strong>: You have the right to request the deletion of your personal data, subject to certain exceptions.</li>
              <li><strong>Right to Opt-Out</strong>: You have the right to opt-out of the sale of your personal data.</li>
              <li><strong>Right to Non-Discrimination</strong>: You have the right not to receive discriminatory treatment for exercising your CCPA rights.</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the contact information provided below.</p>

            <h2 className="mt-8">5. Sharing Your Information</h2>
            <p>We do not sell your personal information to third parties. We may share your information with the following third-party service providers to facilitate our Services:</p>
            <ul>
              <li><strong>Stripe</strong>: For payment processing.</li>
              <li><strong>OpenAI/Vercel AI Gateway</strong>: For AI-powered features.</li>
              <li><strong>Resend</strong>: For email communications.</li>
              <li><strong>Contentful</strong>: For blog content management.</li>
              <li><strong>Supabase</strong>: For database management.</li>
              <li><strong>Vercel</strong>: For hosting services.</li>
              <li><strong>Google SERP API/RapidAPI Indeed</strong>: For job search functionalities.</li>
              <li><strong>SearchAtlas/OTTO</strong>: For SEO analytics.</li>
              <li><strong>Google Fonts</strong>: For typography services.</li>
              <li><strong>PostgreSQL</strong>: For data storage.</li>
            </ul>
            <p>These third parties are obligated to protect your information and may only use it for the purposes specified by us.</p>

            <h2 className="mt-8">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, 
              loss, misuse, or alteration. However, no method of transmission over the internet or method of electronic storage is 100% secure. 
              While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>

            <h2 className="mt-8">7. Data Retention</h2>
            <p>
              We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy 
              or as required by law. When we no longer need your personal information, we will securely delete or anonymize it.
            </p>

            <h2 className="mt-8">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy 
              on this page and updating the effective date at the top. You are advised to review this Privacy Policy periodically for any changes. 
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              9. Contact Us
            </h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <strong>Email:</strong>{" "}
                <a href="mailto:info@thejobbridge-inc.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                  info@thejobbridge-inc.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <strong>Phone:</strong>{" "}
                <a href="tel:+13802662079" className="text-purple-600 dark:text-purple-400 hover:underline">
                  +1 (380) 266-2079
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <strong>Address:</strong>{" "}
                <span className="text-foreground">
                  The JobBridge, Inc., 175 S 3rd Street, Columbus, OH 43215, USA
                </span>
              </div>
            </div>

            <p className="mt-8 text-muted-foreground">
              Thank you for choosing The JobBridge, Inc. We are committed to protecting your privacy and providing you 
              with a safe and secure experience while using our Services.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


