# AI Features Design Specifications for Figma

This document provides detailed design specifications for all 5 AI features to be added to your Figma design file.

## Design System Reference
- **Colors**: Use existing gradient system (purple-50/50, teal-50/30, pink-50/50)
- **Typography**: Inter font family (as per design_guidelines.md)
- **Spacing**: Tailwind spacing system (4, 6, 8, 12, 16, 20, 24)
- **Components**: Use existing shadcn/ui component patterns

---

## 1. AI Job Match Score (Jobs Page)

### Location
- **Page**: Jobs Listing Page (`/jobs`)
- **Placement**: On each job card, top-right area near job title

### Components

#### Match Score Badge
- **Size**: Auto-width, height: 24px
- **Position**: Inline with job title, after external source badge
- **Colors** (based on score):
  - 80-100: Green (`text-green-600 bg-green-50 border-green-200`)
  - 60-79: Blue (`text-blue-600 bg-blue-50 border-blue-200`)
  - 40-59: Yellow (`text-yellow-600 bg-yellow-50 border-yellow-200`)
  - 0-39: Orange (`text-orange-600 bg-orange-50 border-orange-200`)
- **Content**: 
  - Icon: Target icon (16x16)
  - Text: "{score}% Match"
  - Variant: Outline badge
- **Loading State**: 
  - Spinner icon (16x16, animated)
  - Text: "Calculating..."

#### Match Analysis Card
- **Position**: Below job description, above accessibility features
- **Container**: 
  - Background: `bg-muted/30`
  - Border: `border` (rounded-lg)
  - Padding: `p-3`
- **Content**:
  - Header: "Match Analysis" (text-xs, font-medium)
  - Strengths: Text (text-xs, text-muted-foreground)
  - Recommendation: Text (text-xs, text-muted-foreground)
- **Spacing**: `mt-4` from description

---

## 2. AI Job Description Simplifier (Jobs Page)

### Location
- **Page**: Jobs Listing Page (`/jobs`)
- **Placement**: Below job description text

### Components

#### Simplify Button
- **Type**: Ghost button variant
- **Size**: Small (`size="sm"`)
- **Icon**: Sparkles icon (16x16) before text
- **Text**: "Simplify Description"
- **Position**: Below description, left-aligned
- **Spacing**: `mt-2` from description
- **Loading State**: 
  - Spinner icon (16x16, animated)
  - Text: "Simplifying..."

#### Simplified Description View
- **Container**:
  - Background: `bg-muted/50`
  - Border: `border` (rounded-lg)
  - Padding: `p-4`
- **Header**:
  - Text: "Simplified Description" (text-sm, font-medium, text-primary)
  - Button: "Show Original" (ghost, small, right-aligned)
- **Content**:
  - Prose styling (prose prose-sm)
  - White-space: pre-wrap
  - Text: text-sm
  - Max-width: none

---

## 3. AI Application Tips (Apply Dialog)

### Location
- **Page**: Jobs Page - Apply Dialog
- **Placement**: Top of dialog, before cover letter section

### Components

#### Collapsible Container
- **Container**:
  - Border: `border` (rounded-lg)
  - Padding: `p-4`
- **Trigger Button**:
  - Full width, ghost variant
  - Height: Auto
  - Content:
    - Left: Lightbulb icon (20x20, text-primary) + Text section
    - Right: Zap icon (16x16)
  - Text Section:
    - Title: "AI Application Tips" (font-medium)
    - Subtitle: "Get personalized tips for this application" (text-sm, text-muted-foreground)

#### Tips Content (Collapsible)
- **Spacing**: `mt-4` from trigger
- **Loading State**:
  - Centered spinner (24x24)
  - Padding: `py-8`

#### Tip Card
- **Container**: 
  - Border: `border-l-4 border-l-primary`
  - Background: Card component
  - Padding: `p-4`
- **Content**:
  - Title: Tip text (font-semibold, mb-2)
  - Importance: Text (text-sm, text-muted-foreground, mb-2)
  - Example Section:
    - Label: "Example: " (font-medium)
    - Example text: (text-sm)
- **Spacing**: `space-y-4` between cards

---

## 4. AI Job Recommendations (Dashboard)

### Location
- **Page**: Dashboard (`/dashboard`)
- **Placement**: Sidebar, above "Quick Actions" card

### Components

#### Recommendations Card
- **Container**: Card component (overflow-visible)
- **Header**:
  - Title: "AI Job Recommendations" (text-base)
  - Icon: Sparkles (16x16, text-primary) before title
  - Load Button: Ghost, small, right-aligned
    - Shows spinner when loading
    - Shows "Load" text when not loaded
- **Content Area**: Only visible when `showRecommendations` is true

#### Loading State
- Centered spinner (24x24)
- Padding: `py-8`

#### Recommendation Card
- **Container**:
  - Border: `border-l-4 border-l-primary`
  - Background: Card component
  - Padding: `p-4`
- **Content**:
  - Role Title: font-semibold, mb-1
  - Reason: text-sm, text-muted-foreground, mb-3
  - Search Terms:
    - Container: flex-wrap, gap-2
    - Badges: Secondary variant, text-xs
  - Search Button:
    - Ghost variant, small
    - Icon: Search (12x12)
    - Text: "Search Jobs"
    - Link: `/jobs?query={role}`
- **Spacing**: `space-y-3` between cards

#### Empty State
- Text: "No recommendations available. Update your profile to get personalized suggestions."
- Text size: text-sm, text-muted-foreground
- Alignment: center
- Padding: `py-4`

---

## 5. AI Skills Gap Analysis (Profile Page)

### Location
- **Page**: Profile Page (`/profile`)
- **Placement**: Above "Career DNA Assessment" card

### Components

#### Main Card
- **Container**: Card component
- **Margin**: `mb-6` (below card)
- **Header**:
  - Title: "AI Skills Gap Analysis" (CardTitle)
  - Icon: Sparkles (20x20, text-primary) before title
  - Description: "Identify skills you need to develop for your target role"

#### Input Section
- **Container**: `space-y-4`
- **Target Role Input**:
  - Label: "Target Role"
  - Input: Standard input component
  - Placeholder: "e.g., Software Developer, Project Manager"
- **Job Description Input**:
  - Label: "Job Description (Optional)"
  - Textarea: 3 rows
  - Placeholder: "Paste a job description for more accurate analysis..."

#### Analyze Button
- **Type**: Primary button
- **Size**: Full width (`w-full`)
- **Icon**: Target icon (16x16) before text
- **Text**: "Analyze Skills Gap"
- **Disabled State**: When target role is empty or analyzing
- **Loading State**: 
  - Spinner icon (16x16, animated)
  - Text: "Analyzing..."

#### Results Container
- **Container**:
  - Border: `border` (rounded-lg)
  - Padding: `p-4`
  - Margin: `mt-6`
- **Spacing**: `space-y-4` between sections

#### Matching Skills Section
- **Header**:
  - Icon: CheckCircle2 (16x16, text-green-500)
  - Text: "Skills You Already Have" (font-semibold, mb-2)
- **Skills Container**:
  - Flex-wrap, gap-2
  - Badges: 
    - Variant: Secondary
    - Colors: `bg-green-50 text-green-700`

#### Skill Gaps Section
- **Header**:
  - Icon: AlertCircle (16x16, text-orange-500)
  - Text: "Skills to Develop" (font-semibold, mb-2)
- **Gap Cards Container**: `space-y-3`

#### Skill Gap Card
- **Container**:
  - Border: `border-l-4 border-l-orange-500`
  - Background: Card component
  - Padding: `p-4`
- **Content**:
  - Header Row (flex, justify-between, mb-2):
    - Skill Name: font-medium
    - Badges (flex, gap-2):
      - Priority Badge:
        - High: destructive variant
        - Medium: default variant
        - Low: secondary variant
      - Time Badge: Outline variant
        - Icon: Clock (12x12)
        - Text: "{timeToLearn}"
  - Resources Section (mt-2):
    - Label: "Learning Resources:" (text-xs, font-medium, text-muted-foreground, mb-1)
    - Resources Container: flex-wrap, gap-1
    - Resource Badges:
      - Variant: Outline
      - Size: text-xs
      - Icon: BookOpen (12x12)

---

## Design Tokens Reference

### Colors
```css
/* Match Score Colors */
--green-600: #16a34a
--green-50: #f0fdf4
--green-200: #bbf7d0
--blue-600: #2563eb
--blue-50: #eff6ff
--blue-200: #bfdbfe
--yellow-600: #ca8a04
--yellow-50: #fefce8
--yellow-200: #fef08a
--orange-600: #ea580c
--orange-50: #fff7ed
--orange-200: #fed7aa

/* Primary Colors */
--primary: (your primary color)
--muted: (your muted color)
--muted-foreground: (your muted foreground)
```

### Spacing
- `p-3`: 12px
- `p-4`: 16px
- `p-6`: 24px
- `mt-2`: 8px
- `mt-4`: 16px
- `mt-6`: 24px
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px

### Typography
- **Font Family**: Inter
- **Sizes**:
  - text-xs: 12px
  - text-sm: 14px
  - text-base: 16px
- **Weights**:
  - font-medium: 500
  - font-semibold: 600

### Icons
- All icons from Lucide React
- Sizes: 12px, 16px, 20px, 24px
- Colors: Inherit from text color or use `text-primary`, `text-green-500`, `text-orange-500`

---

## Implementation Notes

1. **All features respect subscription tiers** - Show upgrade prompts for Pro+ features
2. **Loading states** - Always show spinners during API calls
3. **Error handling** - Graceful fallbacks with toast notifications
4. **Accessibility** - All interactive elements have proper ARIA labels
5. **Responsive** - All components work on mobile and desktop
6. **Consistent styling** - Uses existing design system components

---

## Figma Layer Structure

For each feature, create:
1. **Frame/Component** with descriptive name (e.g., "AI Job Match Score")
2. **Variants** for different states:
   - Default
   - Loading
   - Empty/No data
   - Error (optional)
3. **Auto-layout** enabled for responsive behavior
4. **Component properties** for easy theming

---

## Next Steps

1. Create these designs in Figma using the specifications above
2. Share the Figma file/node IDs when complete
3. I'll update the code to match the exact designs

