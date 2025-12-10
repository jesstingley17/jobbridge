import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'The Job Bridge <noreply@thejobbridge-inc.com>';

export interface WelcomeEmailParams {
  email: string;
  firstName?: string;
}

export interface MagicLinkEmailParams {
  email: string;
  firstName?: string;
  magicLink: string;
}

export async function sendWelcomeEmail({ email, firstName }: WelcomeEmailParams): Promise<boolean> {
  try {
    const name = firstName || 'there';
    
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to The Job Bridge!',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">The Job Bridge</h1>
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Empowering Careers for All</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join The Job Bridge! Our AI-powered platform is designed to help you find the perfect job opportunity.
              </p>
              
              <p style="margin: 0 0 16px; color: #18181b; font-size: 16px; font-weight: 500;">Here's what you can do:</p>
              
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #52525b; font-size: 16px; line-height: 1.8;">
                <li>Search for accessible job opportunities</li>
                <li>Build professional resumes with AI assistance</li>
                <li>Practice interview questions tailored to your target role</li>
                <li>Track your job applications in one place</li>
                <li>Connect with mentors and peers in our community</li>
              </ul>
              
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                If you have any questions, our support team is here to help. Just visit the Help Center in your dashboard.
              </p>
              
              <p style="margin: 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                Best of luck on your job search!<br>
                <strong style="color: #18181b;">The Job Bridge Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                This email was sent by The Job Bridge. If you didn't create an account, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
    
    console.log('Welcome email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendMagicLinkEmail({ email, firstName, magicLink }: MagicLinkEmailParams): Promise<boolean> {
  try {
    const name = firstName || 'there';
    
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Login Link for The Job Bridge',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">The Job Bridge</h1>
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Secure Login</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Hi ${name},</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                You requested a login link for The Job Bridge. Click the button below to sign in to your account:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                This link will expire in 15 minutes for security reasons.
              </p>
              
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; color: #2563eb; font-size: 14px; word-break: break-all;">
                ${magicLink}
              </p>
              
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                This is an automated message from The Job Bridge. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send magic link email:', error);
      return false;
    }
    
    console.log('Magic link email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending magic link email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail({ email, firstName, magicLink }: MagicLinkEmailParams): Promise<boolean> {
  try {
    const name = firstName || 'there';
    
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - The Job Bridge',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">The Job Bridge</h1>
              <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Password Reset</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Hi ${name},</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                This link will expire in 15 minutes for security reasons.
              </p>
              
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 24px; color: #2563eb; font-size: 14px; word-break: break-all;">
                ${magicLink}
              </p>
              
              <p style="margin: 0; color: #52525b; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                This is an automated message from The Job Bridge. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
    
    console.log('Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
