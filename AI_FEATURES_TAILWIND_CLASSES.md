# AI Features - Tailwind CSS Classes Reference

Complete Tailwind CSS class reference for all 5 AI features, aligned with The Job Bridge design system.

## Design System Foundation

### Colors (from your design system)
- **Primary**: `primary` (purple/teal gradient)
- **Muted**: `muted` / `muted-foreground`
- **Accent**: `accent` / `accent-foreground`
- **Gradients**: `from-purple-50/50 via-teal-50/30 to-pink-50/50`

### Typography
- **Font**: Inter (default)
- **Sizes**: `text-xs`, `text-sm`, `text-base`, `text-lg`
- **Weights**: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Spacing
- **Padding**: `p-3` (12px), `p-4` (16px), `p-6` (24px)
- **Margin**: `mt-2` (8px), `mt-4` (16px), `mt-6` (24px)
- **Gap**: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)

---

## 1. AI Job Match Score

### Match Score Badge
```tsx
// Score 80-100 (Green)
<Badge className="gap-1 text-green-600 bg-green-50 border-green-200" variant="outline">
  <Target className="h-3 w-3" />
  {score}% Match
</Badge>

// Score 60-79 (Blue)
<Badge className="gap-1 text-blue-600 bg-blue-50 border-blue-200" variant="outline">
  <Target className="h-3 w-3" />
  {score}% Match
</Badge>

// Score 40-59 (Yellow)
<Badge className="gap-1 text-yellow-600 bg-yellow-50 border-yellow-200" variant="outline">
  <Target className="h-3 w-3" />
  {score}% Match
</Badge>

// Score 0-39 (Orange)
<Badge className="gap-1 text-orange-600 bg-orange-50 border-orange-200" variant="outline">
  <Target className="h-3 w-3" />
  {score}% Match
</Badge>

// Loading State
<Badge variant="outline" className="gap-1">
  <Loader2 className="h-3 w-3 animate-spin" />
  Calculating...
</Badge>
```

### Match Analysis Card
```tsx
<div className="mt-4 rounded-lg border p-3 bg-muted/30">
  <p className="text-xs font-medium mb-1">Match Analysis</p>
  <p className="text-xs text-muted-foreground mb-2">{strengths}</p>
  <p className="text-xs text-muted-foreground">{recommendation}</p>
</div>
```

### Helper Function for Score Colors
```tsx
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-orange-600 bg-orange-50 border-orange-200";
};
```

---

## 2. AI Job Description Simplifier

### Simplify Button
```tsx
<Button
  variant="ghost"
  size="sm"
  className="mt-2 gap-2"
  onClick={handleSimplify}
  disabled={isSimplifying}
>
  {isSimplifying ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Simplifying...
    </>
  ) : (
    <>
      <Sparkles className="h-4 w-4" />
      Simplify Description
    </>
  )}
</Button>
```

### Simplified Description Container
```tsx
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium text-primary">Simplified Description</p>
    <Button variant="ghost" size="sm" onClick={() => setShowSimplified(false)}>
      Show Original
    </Button>
  </div>
  <div className="rounded-lg border p-4 bg-muted/50">
    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
      {simplifiedDescription}
    </div>
  </div>
</div>
```

### Original Description (with button)
```tsx
<div>
  <p className="text-sm text-muted-foreground line-clamp-2">
    {job.description}
  </p>
  <Button variant="ghost" size="sm" className="mt-2 gap-2" onClick={handleSimplify}>
    <Sparkles className="h-4 w-4" />
    Simplify Description
  </Button>
</div>
```

---

## 3. AI Application Tips

### Collapsible Container
```tsx
<Collapsible open={showTips} onOpenChange={setShowTips}>
  <div className="rounded-lg border p-4">
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        className="w-full justify-between p-0 h-auto"
        onClick={handleLoadTips}
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <div className="text-left">
            <p className="font-medium">AI Application Tips</p>
            <p className="text-sm text-muted-foreground">
              Get personalized tips for this application
            </p>
          </div>
        </div>
        <Zap className="h-4 w-4" />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent className="mt-4">
      {/* Tips content */}
    </CollapsibleContent>
  </div>
</Collapsible>
```

### Loading State
```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
</div>
```

### Tip Card
```tsx
<Card className="border-l-4 border-l-primary">
  <CardContent className="p-4">
    <h4 className="font-semibold mb-2">{tip.tip}</h4>
    <p className="text-sm text-muted-foreground mb-2">{tip.importance}</p>
    <p className="text-sm">
      <span className="font-medium">Example: </span>
      {tip.example}
    </p>
  </CardContent>
</Card>
```

### Tips Container
```tsx
<div className="space-y-4">
  {applicationTips.map((tip, index) => (
    <TipCard key={index} tip={tip} />
  ))}
</div>
```

---

## 4. AI Job Recommendations

### Recommendations Card
```tsx
<Card className="overflow-visible">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle className="text-base flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        AI Job Recommendations
      </CardTitle>
      {!showRecommendations && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLoadRecommendations}
          disabled={isLoadingRecommendations}
        >
          {isLoadingRecommendations ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Load"
          )}
        </Button>
      )}
    </div>
  </CardHeader>
  {showRecommendations && (
    <CardContent>
      {/* Content */}
    </CardContent>
  )}
</Card>
```

### Loading State
```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
</div>
```

### Recommendation Card
```tsx
<Card className="border-l-4 border-l-primary">
  <CardContent className="p-4">
    <h4 className="font-semibold mb-1">{rec.role}</h4>
    <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
    <div className="flex flex-wrap gap-2">
      {rec.searchTerms.map((term, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {term}
        </Badge>
      ))}
    </div>
    <Link href={`/jobs?query=${encodeURIComponent(rec.role)}`}>
      <Button variant="ghost" size="sm" className="mt-3 gap-2">
        Search Jobs
        <Search className="h-3 w-3" />
      </Button>
    </Link>
  </CardContent>
</Card>
```

### Recommendations Container
```tsx
<div className="space-y-3">
  {recommendations.map((rec, index) => (
    <RecommendationCard key={index} rec={rec} />
  ))}
</div>
```

### Empty State
```tsx
<p className="text-sm text-muted-foreground text-center py-4">
  No recommendations available. Update your profile to get personalized suggestions.
</p>
```

---

## 5. AI Skills Gap Analysis

### Main Card
```tsx
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-primary" />
      AI Skills Gap Analysis
    </CardTitle>
    <CardDescription>
      Identify skills you need to develop for your target role
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Inputs and results */}
  </CardContent>
</Card>
```

### Input Section
```tsx
<div className="space-y-2">
  <Label htmlFor="target-role">Target Role</Label>
  <Input
    id="target-role"
    value={targetRole}
    onChange={(e) => setTargetRole(e.target.value)}
    placeholder="e.g., Software Developer, Project Manager"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="job-description">Job Description (Optional)</Label>
  <Textarea
    id="job-description"
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
    placeholder="Paste a job description for more accurate analysis..."
    rows={3}
  />
</div>
```

### Analyze Button
```tsx
<Button
  onClick={handleAnalyzeSkillsGap}
  disabled={isAnalyzing || !targetRole.trim()}
  className="w-full gap-2"
>
  {isAnalyzing ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Analyzing...
    </>
  ) : (
    <>
      <Target className="h-4 w-4" />
      Analyze Skills Gap
    </>
  )}
</Button>
```

### Results Container
```tsx
<div className="mt-6 space-y-4 rounded-lg border p-4">
  {/* Matching skills and gaps */}
</div>
```

### Matching Skills Section
```tsx
<div>
  <h4 className="font-semibold mb-2 flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-500" />
    Skills You Already Have
  </h4>
  <div className="flex flex-wrap gap-2">
    {matchingSkills.map((skill, i) => (
      <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
        {skill}
      </Badge>
    ))}
  </div>
</div>
```

### Skill Gaps Section
```tsx
<div>
  <h4 className="font-semibold mb-2 flex items-center gap-2">
    <AlertCircle className="h-4 w-4 text-orange-500" />
    Skills to Develop
  </h4>
  <div className="space-y-3">
    {skillGaps.map((gap, i) => (
      <SkillGapCard key={i} gap={gap} />
    ))}
  </div>
</div>
```

### Skill Gap Card
```tsx
<Card className="border-l-4 border-l-orange-500">
  <CardContent className="p-4">
    <div className="flex items-start justify-between mb-2">
      <h5 className="font-medium">{gap.name}</h5>
      <div className="flex gap-2">
        <Badge
          variant={
            gap.priority === "high"
              ? "destructive"
              : gap.priority === "medium"
              ? "default"
              : "secondary"
          }
        >
          {gap.priority} priority
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          {gap.timeToLearn}
        </Badge>
      </div>
    </div>
    {gap.resources.length > 0 && (
      <div className="mt-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Learning Resources:
        </p>
        <div className="flex flex-wrap gap-1">
          {gap.resources.map((resource, j) => (
            <Badge key={j} variant="outline" className="text-xs gap-1">
              <BookOpen className="h-3 w-3" />
              {resource}
            </Badge>
          ))}
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

---

## Common Patterns

### Loading Spinners
```tsx
// Small spinner (16px)
<Loader2 className="h-4 w-4 animate-spin" />

// Medium spinner (24px)
<Loader2 className="h-6 w-6 animate-spin" />

// With text
<Loader2 className="h-4 w-4 animate-spin" />
<span>Loading...</span>
```

### Icon Sizes
```tsx
// Extra small (12px)
<Icon className="h-3 w-3" />

// Small (16px)
<Icon className="h-4 w-4" />

// Medium (20px)
<Icon className="h-5 w-5" />

// Large (24px)
<Icon className="h-6 w-6" />
```

### Card Borders (Left Accent)
```tsx
// Primary accent
<Card className="border-l-4 border-l-primary">

// Orange accent
<Card className="border-l-4 border-l-orange-500">

// Green accent
<Card className="border-l-4 border-l-green-500">
```

### Badge Variants
```tsx
// Default
<Badge variant="default">

// Secondary
<Badge variant="secondary">

// Outline
<Badge variant="outline">

// Destructive
<Badge variant="destructive">
```

### Text Colors
```tsx
// Primary text
className="text-primary"

// Muted text
className="text-muted-foreground"

// Success (green)
className="text-green-600" or "text-green-500"

// Warning (orange)
className="text-orange-600" or "text-orange-500"

// Info (blue)
className="text-blue-600" or "text-blue-500"
```

### Background Colors
```tsx
// Muted background
className="bg-muted" or "bg-muted/30" or "bg-muted/50"

// Colored backgrounds (for badges/cards)
className="bg-green-50"
className="bg-blue-50"
className="bg-yellow-50"
className="bg-orange-50"
```

### Spacing Utilities
```tsx
// Padding
className="p-3"  // 12px
className="p-4"  // 16px
className="p-6"  // 24px

// Margin Top
className="mt-2"  // 8px
className="mt-4"  // 16px
className="mt-6"  // 24px

// Gap (for flex/grid)
className="gap-1"  // 4px
className="gap-2"  // 8px
className="gap-3"  // 12px
className="gap-4"  // 16px

// Space Y (vertical spacing between children)
className="space-y-3"  // 12px
className="space-y-4"  // 16px
```

### Flexbox Layouts
```tsx
// Horizontal flex with gap
className="flex items-center gap-2"

// Vertical flex with gap
className="flex flex-col gap-4"

// Justify between
className="flex items-center justify-between"

// Wrap
className="flex flex-wrap gap-2"
```

### Border Radius
```tsx
className="rounded-lg"  // 8px (most common)
className="rounded-md"  // 6px
className="rounded-full"  // 9999px (for circles)
```

### Text Utilities
```tsx
// Line clamp (truncate with ellipsis)
className="line-clamp-2"  // 2 lines

// Whitespace
className="whitespace-pre-wrap"  // Preserve line breaks

// Text alignment
className="text-left"
className="text-center"
className="text-right"
```

---

## Complete Component Examples

### Full Match Score Implementation
```tsx
{isAuthenticated && matchScore && (
  <>
    <Badge className={`gap-1 ${getScoreColor(matchScore.score)}`} variant="outline">
      <Target className="h-3 w-3" />
      {matchScore.score}% Match
    </Badge>
    <div className="mt-4 rounded-lg border p-3 bg-muted/30">
      <p className="text-xs font-medium mb-1">Match Analysis</p>
      <p className="text-xs text-muted-foreground mb-2">{matchScore.strengths}</p>
      <p className="text-xs text-muted-foreground">{matchScore.recommendation}</p>
    </div>
  </>
)}
```

### Full Simplifier Implementation
```tsx
{showSimplified && simplifiedDescription ? (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-primary">Simplified Description</p>
      <Button variant="ghost" size="sm" onClick={() => setShowSimplified(false)}>
        Show Original
      </Button>
    </div>
    <div className="rounded-lg border p-4 bg-muted/50">
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
        {simplifiedDescription}
      </div>
    </div>
  </div>
) : (
  <div>
    <p className="text-sm text-muted-foreground line-clamp-2">
      {job.description}
    </p>
    <Button
      variant="ghost"
      size="sm"
      className="mt-2 gap-2"
      onClick={handleSimplify}
      disabled={isSimplifying}
    >
      {isSimplifying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Simplifying...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Simplify Description
        </>
      )}
    </Button>
  </div>
)}
```

---

## Responsive Considerations

All components use Tailwind's responsive prefixes where needed:

```tsx
// Mobile-first approach
className="text-sm md:text-base"  // Small on mobile, base on desktop
className="p-4 md:p-6"  // Less padding on mobile
className="flex-col md:flex-row"  // Stack on mobile, row on desktop
className="gap-2 md:gap-4"  // Smaller gaps on mobile
```

---

## Accessibility Classes

```tsx
// Screen reader only
className="sr-only"

// Focus visible (keyboard navigation)
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"

// ARIA labels (use aria-label prop, not className)
<Button aria-label="Simplify job description">
```

---

## Dark Mode Support

Your design system should handle dark mode automatically through CSS variables. All classes using semantic colors (like `text-muted-foreground`, `bg-muted`) will adapt:

```tsx
// These automatically adapt to dark mode
className="bg-muted/30"
className="text-muted-foreground"
className="border"

// For colored backgrounds, add dark: variants if needed
className="bg-green-50 dark:bg-green-950"
```

---

## Usage Tips

1. **Consistency**: Always use the same spacing scale (2, 4, 6, 8, 12, 16, 20, 24)
2. **Semantic Colors**: Prefer `text-muted-foreground` over `text-gray-500` for theme compatibility
3. **Component Variants**: Use shadcn/ui component variants (`variant="outline"`, `size="sm"`) instead of custom classes
4. **Responsive**: Test on mobile - most layouts should stack vertically on small screens
5. **Accessibility**: Always include proper ARIA labels and keyboard navigation support

---

This reference matches your existing design system and can be used directly in your Figma designs or code implementation.

