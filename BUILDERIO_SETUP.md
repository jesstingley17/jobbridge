# Builder.io Integration Setup

This guide will help you set up Builder.io for visual page editing and content management.

## 1. Create a Builder.io Account

1. Go to [builder.io](https://www.builder.io) and sign up for a free account
2. Create a new space (or use an existing one)

## 2. Get Your API Key

1. In Builder.io, go to **Account Settings** → **Space Settings**
2. Find your **Public API Key** (starts with a string like `abc123...`)
3. Copy this API key

## 3. Configure Environment Variables

1. Create or update your `.env.local` file in the project root
2. Add your Builder.io API key:

```bash
VITE_BUILDER_API_KEY=your-api-key-here
```

**Note:** The `VITE_` prefix is required for Vite to expose this variable to the client-side code.

## 4. Restart Your Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## 5. Access Builder.io Pages

Once configured, you can access Builder.io pages at:

- `/cms` - Main Builder.io page
- `/cms/your-page-name` - Any custom page you create in Builder.io
- `/auth` - Login/Sign Up page (uses Builder.io if content exists, otherwise falls back to default)

## 5.1. Custom Components Available

The following custom components are registered and available in Builder.io:

### LoginForm
A fully functional login form that connects to your authentication API.

**Available Props:**
- `emailLabel` (string) - Label for email field (default: "Email")
- `passwordLabel` (string) - Label for password field (default: "Password")
- `submitButtonText` (string) - Text for submit button (default: "Login")
- `showForgotPassword` (boolean) - Show forgot password link (default: true)
- `onSuccessRedirect` (string) - Where to redirect after successful login (default: "/early-access")

### SignUpForm
A fully functional sign up form that connects to your authentication API.

**Available Props:**
- `emailLabel` (string) - Label for email field (default: "Email")
- `passwordLabel` (string) - Label for password field (default: "Password")
- `confirmPasswordLabel` (string) - Label for confirm password field (default: "Confirm Password")
- `firstNameLabel` (string) - Label for first name field (default: "First Name")
- `lastNameLabel` (string) - Label for last name field (default: "Last Name")
- `submitButtonText` (string) - Text for submit button (default: "Sign Up")
- `showTermsCheckbox` (boolean) - Show terms and conditions checkbox (default: true)
- `showMarketingCheckbox` (boolean) - Show marketing consent checkbox (default: true)
- `onSuccessRedirect` (string) - Where to redirect after successful sign up (default: "/early-access")

## 6. Creating Pages in Builder.io

1. Log in to [builder.io](https://builder.io)
2. Go to **Content** → **Pages**
3. Click **New Page**
4. Set the page URL (e.g., `/cms/my-page` or `/cms/` for the homepage, or `/auth` for login/signup)
5. Use the visual editor to design your page
6. **To add Login/Sign Up forms:**
   - Click the **Insert** tab in the left sidebar
   - Search for "LoginForm" or "SignUpForm"
   - Drag and drop the component onto your page
   - Customize the props in the right sidebar
7. Publish your page

### Creating a Custom Login/Sign Up Page

1. Create a new page in Builder.io with URL path: `/auth`
2. Design your page layout (add images, text, etc.)
3. Add the **LoginForm** and/or **SignUpForm** components
4. Customize the form labels and settings
5. Publish the page
6. Visit `/auth` on your site to see your custom page

**Note:** If no Builder.io content exists for `/auth`, the site will automatically fall back to the default authentication page.

## 7. Visual Editing

When you're logged into Builder.io and viewing your site, you'll see a visual editing interface that allows you to:

- Drag and drop components
- Edit text directly on the page
- Style elements visually
- Add custom components

## Troubleshooting

### API Key Not Working

- Make sure the API key starts with `VITE_` in your `.env.local` file
- Restart your development server after adding the environment variable
- Check that the API key is correct in Builder.io settings

### Pages Not Loading

- Verify your page URL in Builder.io matches the route (e.g., `/cms/my-page`)
- Check the browser console for any error messages
- Ensure your Builder.io space is published and active

### Visual Editor Not Appearing

- Make sure you're logged into Builder.io in the same browser
- Check that your API key has the correct permissions
- Try refreshing the page

## Additional Resources

- [Builder.io Documentation](https://www.builder.io/c/docs)
- [Builder.io React SDK](https://www.builder.io/c/docs/react)
- [Builder.io Visual Editor Guide](https://www.builder.io/c/docs/guides/page-building)
