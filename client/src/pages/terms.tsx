import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, CreditCard, AlertTriangle, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            </div>
            <p className="text-muted-foreground">Last Updated: December 10, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By using our Service, you affirm that you are at least 18 years of age, or you are using the Service 
              under the supervision of a parent or guardian. If you are using the Service on behalf of a business 
              or entity, you represent and warrant that you have the authority to bind that business or entity to 
              these Terms.
            </p>
            <p className="bg-muted p-4 rounded-lg">
              <strong>By creating an account, you must explicitly agree to these Terms and Conditions by checking 
              the required consent box during registration.</strong>
            </p>

            <h2>2. User Rights and Responsibilities</h2>
            <h3>2.1 User Account</h3>
            <p>
              To access certain features of the Service, you may be required to create an account. You agree to 
              provide accurate, current, and complete information during the registration process and to update 
              such information to keep it accurate, current, and complete.
            </p>
            <h3>2.2 User Conduct</h3>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul>
              <li>Use the Service in any way that violates any applicable federal, state, local, or international law or regulation.</li>
              <li>Impersonate or attempt to impersonate The JobBridge, Inc., a Company employee, another user, or any other person or entity.</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm The JobBridge, Inc. or users of the Service or expose them to liability.</li>
            </ul>
            <h3>2.3 User Content</h3>
            <p>
              You are solely responsible for any content you upload, post, or otherwise transmit via the Service 
              ("User Content"). You grant us a non-exclusive, worldwide, royalty-free, perpetual, and irrevocable 
              license to use, reproduce, modify, publish, and distribute such User Content in connection with the Service.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              3. Our Services
            </h2>
            <h3>3.1 Service Features</h3>
            <p>
              The Service includes AI-powered job matching and recommendations, resume building and optimization 
              tools, personalized interview question generation, and Career DNA assessments. While we strive to 
              provide accurate and helpful resources, we do not guarantee the success of any job placement or 
              employment outcome.
            </p>
            <h3>3.2 Third-Party Services</h3>
            <p>
              The Service may contain links to third-party websites or services that are not owned or controlled 
              by The JobBridge, Inc. We have no control over, and assume no responsibility for, the content, privacy 
              policies, or practices of any third-party websites or services. We encourage you to review the terms 
              and conditions and privacy policies of any third-party services you use.
            </p>

            <h2>4. Marketing and Communications</h2>
            <h3>4.1 Marketing Consent</h3>
            <p>
              During registration, you may optionally consent to receive marketing communications, including newsletters, 
              promotional emails, and updates about our services. This consent is optional and can be withdrawn at any 
              time by updating your preferences in your account settings, clicking the unsubscribe link in any marketing 
              email, or contacting us at help@thejobbridge-inc.com.
            </p>
            <h3>4.2 Service Communications</h3>
            <p>
              Regardless of your marketing consent preferences, you will continue to receive essential service-related 
              communications, such as account notifications, security alerts, and important updates about your account 
              or the Service.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              5. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, The JobBridge, Inc., its affiliates, and their 
              respective officers, directors, employees, agents, licensors, and service providers will not be liable 
              for any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
              loss of profits, data, use, goodwill, or other intangible losses, arising from or related to your use 
              of the Service, whether based on warranty, contract, tort (including negligence), or any other legal 
              theory, even if we have been advised of the possibility of such damage.
            </p>

            <h2>6. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless The JobBridge, Inc. and its affiliates, licensors, 
              and service providers, and its and their respective officers, directors, employees, contractors, agents, 
              licensors, service providers, subcontractors, suppliers, successors, and assigns from and against any 
              claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable 
              attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
            </p>

            <h2>7. Intellectual Property Rights</h2>
            <p>
              The Website and Services, including all content, features, functionality, and software, are owned by 
              The JobBridge, Inc. and are protected by United States and international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              8. Subscription Services and Payments
            </h2>
            <h3>6.1 Subscription Plans</h3>
            <p>
              We offer various subscription plans with different features and pricing. Subscription terms, features, 
              and pricing are subject to change at our discretion.
            </p>
            <h3>6.2 Payment Terms</h3>
            <ul>
              <li>Payments are processed through Stripe, our third-party payment processor</li>
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>All fees are non-refundable except as required by law or as otherwise stated in these Terms</li>
              <li>You are responsible for any taxes applicable to your use of the Services</li>
            </ul>
            <h3>6.3 Cancellation and Refunds</h3>
            <ul>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation will take effect at the end of your current billing period</li>
              <li>No refunds will be provided for partial billing periods</li>
              <li>We reserve the right to suspend or terminate your account for non-payment</li>
            </ul>

            <h2>7. Intellectual Property Rights</h2>
            <p>
              The Website and Services, including all content, features, functionality, and software, are owned by 
              The JobBridge, Inc. and are protected by United States and international copyright, trademark, patent, 
              trade secret, and other intellectual property laws.
            </p>

            <h2>8. AI-Powered Features</h2>
            <p>
              Our Services utilize artificial intelligence and machine learning technologies. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated content may not always be accurate or complete</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of AI-generated content</li>
              <li>You should review and verify all AI-generated content before using it</li>
            </ul>

            <h2>9. Job Listings and Employment</h2>
            <p>
              We provide job listings from various sources. We do not guarantee the accuracy, completeness, or 
              availability of job listings, endorse any specific employer, or guarantee job placement. You are 
              solely responsible for evaluating job opportunities and making your own employment decisions.
            </p>

            <h2>10. Privacy and Data Protection</h2>
            <p>
              Your use of the Services is also governed by our{" "}
              <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>{" "}
              and <a href="/cookies" className="text-purple-600 dark:text-purple-400 hover:underline">Cookie Policy</a>. 
              Please review these policies to understand how we collect, use, and protect your information.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              11. Disclaimers and Limitations of Liability
            </h2>
            <h3>11.1 Service Availability</h3>
            <p>
              We strive to provide reliable Services but do not guarantee that the Services will be available at 
              all times or free from errors, interruptions, or defects.
            </p>
            <h3>11.2 Disclaimer of Warranties</h3>
            <p className="bg-muted p-4 rounded-lg">
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
              NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <h3>11.3 Limitation of Liability</h3>
            <p className="bg-muted p-4 rounded-lg">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE JOBBRIDGE, INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER 
              INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
              RESULTING FROM YOUR USE OF THE SERVICES.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless The JobBridge, Inc., its officers, directors, 
              employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and 
              expenses arising out of or in any way connected with your use of the Services, violation of these 
              Terms, or violation of any rights of another.
            </p>

            <h2>13. Termination</h2>
            <p>
              You may terminate your account at any time. We may suspend or terminate your account immediately, 
              without prior notice, if you violate these Terms, engage in fraudulent or illegal activity, or fail 
              to pay required fees.
            </p>

            <h2>14. Dispute Resolution</h2>
            <h3>14.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Ohio, 
              United States, without regard to its conflict of law provisions.
            </p>
            <h3>14.2 Jurisdiction</h3>
            <p>
              Any legal action or proceeding arising under these Terms will be brought exclusively in the federal 
              or state courts located in Franklin County, Ohio, and you hereby consent to the personal jurisdiction 
              of such courts.
            </p>

            <h2>15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by 
              posting the updated Terms on the Website and updating the "Last Updated" date. Your continued use 
              of the Services after such modifications constitutes your acceptance of the updated Terms.
            </p>

            <h2>16. Accessibility</h2>
            <p>
              We are committed to providing accessible Services. If you encounter any accessibility barriers, 
              please contact us at help@thejobbridge-inc.com.
            </p>

            <h2 className="flex items-center gap-2 mt-8">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              20. Contact Information
            </h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
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
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <strong>Website:</strong>{" "}
                <a href="https://thejobbridge-inc.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  https://thejobbridge-inc.com
                </a>
              </div>
            </div>

            <h2>21. Acknowledgment</h2>
            <p className="bg-muted p-4 rounded-lg">
              By using our Services, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms and Conditions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

