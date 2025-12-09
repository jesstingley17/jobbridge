import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CareerDimension, UserDimensionScore } from "@shared/schema";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, Brain, Users, Lightbulb, Heart, Accessibility, Target } from "lucide-react";

const CATEGORY_ORDER = [
  "Strengths",
  "Work Environment", 
  "Skills",
  "Interests",
  "Values",
  "Accessibility",
];

const categoryIcons: Record<string, typeof Brain> = {
  "Strengths": Target,
  "Work Environment": Users,
  "Skills": Lightbulb,
  "Interests": Heart,
  "Values": Brain,
  "Accessibility": Accessibility,
};

const categoryDescriptions: Record<string, string> = {
  "Strengths": "Discover your core professional strengths and how they can shine in the workplace.",
  "Work Environment": "Find out what work settings help you perform at your best.",
  "Skills": "Assess your current skill levels to match with the right opportunities.",
  "Interests": "Explore the industries and fields that energize you.",
  "Values": "Understand what matters most to you in a career.",
  "Accessibility": "Let us know your accommodation needs so we can find the right fit.",
};

export default function CareerDNA() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: dimensions, isLoading: dimensionsLoading } = useQuery<CareerDimension[]>({
    queryKey: ['/api/career-dna/dimensions'],
  });

  const { data: existingScores, isLoading: scoresLoading } = useQuery<UserDimensionScore[]>({
    queryKey: ['/api/career-dna/scores'],
    enabled: !!user,
  });

  useEffect(() => {
    if (dimensions && dimensions.length > 0) {
      const initialScores: Record<string, number> = {};
      dimensions.forEach(d => {
        initialScores[d.id] = 50;
      });
      
      if (existingScores && existingScores.length > 0) {
        existingScores.forEach(s => {
          initialScores[s.dimensionId] = s.score;
        });
        if (existingScores.length === dimensions.length) {
          setIsCompleted(true);
        }
      }
      
      setScores(initialScores);
    }
  }, [existingScores, dimensions]);

  const saveScoresMutation = useMutation({
    mutationFn: async (scoreData: { dimensionId: string; score: number }[]) => {
      return apiRequest('POST', '/api/career-dna/scores', { scores: scoreData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-dna/scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsCompleted(true);
      toast({
        title: "Career DNA Complete",
        description: "Your Career DNA profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading || dimensionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="loading-assessment">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <Brain className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to take the Career DNA assessment and discover your unique professional profile.
            </p>
            <Button onClick={() => setLocation('/api/login')} data-testid="button-login">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = CATEGORY_ORDER;
  const currentCategory = categories[currentCategoryIndex];
  const categoryDimensions = dimensions?.filter(d => d.category === currentCategory) || [];
  
  const totalQuestions = dimensions?.length || 0;
  const answeredQuestions = Object.keys(scores).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleSliderChange = (dimensionId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [dimensionId]: value[0] }));
  };

  const isCategoryComplete = categoryDimensions.every(d => scores[d.id] !== undefined);
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isFirstCategory = currentCategoryIndex === 0;

  const handleNext = () => {
    if (isLastCategory) {
      const scoreData = Object.entries(scores).map(([dimensionId, score]) => ({
        dimensionId,
        score,
      }));
      saveScoresMutation.mutate(scoreData);
    } else {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (!isFirstCategory) {
      setCurrentCategoryIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleRetake = () => {
    setScores({});
    setCurrentCategoryIndex(0);
    setIsCompleted(false);
  };

  const CategoryIcon = currentCategory ? categoryIcons[currentCategory] || Brain : Brain;

  if (isCompleted && dimensions) {
    return <ResultsView dimensions={dimensions} scores={scores} onRetake={handleRetake} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-assessment-title">
          Career DNA Assessment
        </h1>
        <p className="text-muted-foreground text-lg">
          Answer these questions to discover your unique career profile
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Category {currentCategoryIndex + 1} of {categories.length}
          </span>
          <span className="text-sm text-muted-foreground" data-testid="text-progress">
            {answeredQuestions} of {totalQuestions} questions answered
          </span>
        </div>
        <Progress value={progress} className="h-2" data-testid="progress-assessment" />
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CategoryIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl" data-testid="text-category-title">
              {currentCategory}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              {currentCategory ? categoryDescriptions[currentCategory] : ""}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {categoryDimensions.map((dimension, index) => (
              <div key={dimension.id} className="space-y-4" data-testid={`question-${dimension.id}`}>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <label className="text-base font-medium" id={`label-${dimension.id}`}>
                      {dimension.questionText}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dimension.description}
                    </p>
                  </div>
                </div>
                <div className="pl-10">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-12">Low</span>
                    <Slider
                      value={[scores[dimension.id] ?? 50]}
                      onValueChange={(value) => handleSliderChange(dimension.id, value)}
                      max={100}
                      step={1}
                      className="flex-1"
                      aria-labelledby={`label-${dimension.id}`}
                      data-testid={`slider-${dimension.id}`}
                    />
                    <span className="text-sm text-muted-foreground w-12 text-right">High</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-lg font-semibold text-primary" data-testid={`value-${dimension.id}`}>
                      {scores[dimension.id] ?? 50}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstCategory}
          data-testid="button-previous"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isCategoryComplete || saveScoresMutation.isPending}
          data-testid="button-next"
        >
          {saveScoresMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isLastCategory ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {isLastCategory ? "Complete Assessment" : "Next Category"}
        </Button>
      </div>
    </div>
  );
}

function ResultsView({ 
  dimensions, 
  scores, 
  onRetake 
}: { 
  dimensions: CareerDimension[]; 
  scores: Record<string, number>; 
  onRetake: () => void;
}) {
  const [, setLocation] = useLocation();
  
  const categories = CATEGORY_ORDER;
  
  const categoryAverages = categories.map(category => {
    const catDimensions = dimensions.filter(d => d.category === category);
    const catScores = catDimensions.map(d => scores[d.id] ?? 0);
    const average = catScores.length > 0 
      ? Math.round(catScores.reduce((a, b) => a + b, 0) / catScores.length)
      : 0;
    return { category, average };
  });

  const topStrengths = dimensions
    .filter(d => d.category === "Strengths")
    .map(d => ({ ...d, score: scores[d.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topInterests = dimensions
    .filter(d => d.category === "Interests")
    .map(d => ({ ...d, score: scores[d.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const topValues = dimensions
    .filter(d => d.category === "Values")
    .map(d => ({ ...d, score: scores[d.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-results-title">
          Your Career DNA Results
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's what makes you unique in the workplace
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {categoryAverages.map(({ category, average }) => {
          const Icon = categoryIcons[category] || Brain;
          return (
            <Card key={category} data-testid={`card-category-${category}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{category}</h3>
                </div>
                <div className="mb-2">
                  <Progress value={average} className="h-3" />
                </div>
                <p className="text-2xl font-bold text-primary">{average}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topStrengths.map(s => (
                <li key={s.id} className="flex items-center justify-between" data-testid={`strength-${s.id}`}>
                  <span>{s.name}</span>
                  <span className="font-semibold text-primary">{s.score}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Top Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topInterests.map(s => (
                <li key={s.id} className="flex items-center justify-between" data-testid={`interest-${s.id}`}>
                  <span>{s.name}</span>
                  <span className="font-semibold text-primary">{s.score}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Top Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topValues.map(s => (
                <li key={s.id} className="flex items-center justify-between" data-testid={`value-${s.id}`}>
                  <span>{s.name}</span>
                  <span className="font-semibold text-primary">{s.score}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Your scores for all dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.map(category => {
              const catDimensions = dimensions.filter(d => d.category === category);
              return (
                <div key={category}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {(() => {
                      const Icon = categoryIcons[category] || Brain;
                      return <Icon className="h-4 w-4" />;
                    })()}
                    {category}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {catDimensions.map(d => (
                      <div key={d.id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{d.name}</span>
                            <span className="text-sm font-medium">{scores[d.id] ?? 0}%</span>
                          </div>
                          <Progress value={scores[d.id] ?? 0} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="outline" onClick={onRetake} data-testid="button-retake">
          Retake Assessment
        </Button>
        <Button onClick={() => setLocation('/jobs')} data-testid="button-find-jobs">
          Find Matching Jobs
        </Button>
        <Button variant="outline" onClick={() => setLocation('/profile')} data-testid="button-view-profile">
          View Profile
        </Button>
      </div>
    </div>
  );
}
