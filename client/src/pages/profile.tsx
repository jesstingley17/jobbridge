import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { User, Mail, MapPin, Briefcase, ArrowRight, CheckCircle2, Circle, Pencil, Save, X } from "lucide-react";
import type { UserProfile, CareerDimension, UserDimensionScore } from "@shared/schema";
import { AiSkillsGapAnalysis } from "@/components/dashboard/AiSkillsGapAnalysis";

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { hasFeature } = useSubscriptionContext();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: dimensions } = useQuery<CareerDimension[]>({
    queryKey: ["/api/career-dna/dimensions"],
    enabled: isAuthenticated,
  });

  const { data: scores } = useQuery<UserDimensionScore[]>({
    queryKey: ["/api/career-dna/scores"],
    enabled: isAuthenticated,
  });

  const [formData, setFormData] = useState({
    headline: "",
    bio: "",
    location: "",
    phone: "",
    linkedinUrl: "",
    portfolioUrl: "",
    skills: "",
    accessibilityNeeds: "",
    preferredJobTypes: "",
    preferredLocations: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startEditing = () => {
    setFormData({
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      phone: profile?.phone || "",
      linkedinUrl: profile?.linkedinUrl || "",
      portfolioUrl: profile?.portfolioUrl || "",
      skills: profile?.skills?.join(", ") || "",
      accessibilityNeeds: profile?.accessibilityNeeds?.join(", ") || "",
      preferredJobTypes: profile?.preferredJobTypes?.join(", ") || "",
      preferredLocations: profile?.preferredLocations?.join(", ") || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };


  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If not authenticated, show sign in prompt
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign in to view your profile</CardTitle>
            <CardDescription>
              Create an account or log in to access your personalized job search dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild data-testid="button-login-prompt">
              <a href="/auth">Log in</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated but user data is still loading, show loading state
  if (!user && isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Fallback if user is null but we're authenticated (shouldn't happen, but handle gracefully)
  const displayUser = user || { firstName: "", lastName: "", email: "" };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const completedDimensions = scores?.length || 0;
  const totalDimensions = dimensions?.length || 0;
  const progressPercentage = totalDimensions > 0 ? Math.round((completedDimensions / totalDimensions) * 100) : 0;

  const dimensionCategories = dimensions?.reduce((acc, dim) => {
    if (!acc[dim.category]) {
      acc[dim.category] = [];
    }
    acc[dim.category].push(dim);
    return acc;
  }, {} as Record<string, CareerDimension[]>);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Card data-testid="card-profile-header">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={displayUser.profileImageUrl || undefined} alt={`${displayUser.firstName} ${displayUser.lastName}`} />
                <AvatarFallback className="text-2xl">{getInitials(displayUser.firstName, displayUser.lastName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold" data-testid="text-user-name">
                    {displayUser.firstName} {displayUser.lastName}
                  </h1>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-profile">
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                {profile?.headline && !isEditing && (
                  <p className="text-muted-foreground" data-testid="text-headline">{profile.headline}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-2">
                  {displayUser.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span data-testid="text-email">{displayUser.email}</span>
                    </div>
                  )}
                  {profile?.location && !isEditing && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span data-testid="text-location">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Card data-testid="card-profile-edit">
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
              <CardDescription>Update your information to get better job recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Professional Headline</Label>
                    <Input
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g., Software Developer | Accessibility Advocate"
                      data-testid="input-headline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., New York, NY"
                      data-testid="input-location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Me</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell employers about yourself..."
                    rows={4}
                    data-testid="input-bio"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g., (555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      data-testid="input-linkedin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g., JavaScript, React, Project Management"
                    data-testid="input-skills"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferredJobTypes">Preferred Job Types (comma-separated)</Label>
                    <Input
                      id="preferredJobTypes"
                      value={formData.preferredJobTypes}
                      onChange={(e) => setFormData({ ...formData, preferredJobTypes: e.target.value })}
                      placeholder="e.g., Full-time, Remote, Contract"
                      data-testid="input-job-types"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredLocations">Preferred Locations (comma-separated)</Label>
                    <Input
                      id="preferredLocations"
                      value={formData.preferredLocations}
                      onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                      placeholder="e.g., Remote, New York, San Francisco"
                      data-testid="input-preferred-locations"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessibilityNeeds">Accessibility Needs (comma-separated)</Label>
                  <Input
                    id="accessibilityNeeds"
                    value={formData.accessibilityNeeds}
                    onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                    placeholder="e.g., Screen reader compatible, Flexible hours, Remote work"
                    data-testid="input-accessibility"
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us match you with employers who can accommodate your needs
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={cancelEditing} data-testid="button-cancel-edit">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* AI Skills Gap Analysis */}
        {hasFeature("aiSkillsGap") && <AiSkillsGapAnalysis />}

        <Card data-testid="card-career-dna">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career DNA Assessment
              </CardTitle>
              <CardDescription>
                Discover your unique career profile across {totalDimensions} dimensions
              </CardDescription>
            </div>
            <Button asChild data-testid="button-start-assessment">
              <Link href="/career-dna">
                {profile?.careerDnaCompleted ? "View Results" : "Start Assessment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium" data-testid="text-progress">
                  {completedDimensions} / {totalDimensions} dimensions completed ({progressPercentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                  data-testid="progress-bar"
                />
              </div>

              {dimensionCategories && Object.entries(dimensionCategories).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {Object.entries(dimensionCategories).map(([category, dims]) => {
                    const categoryScores = scores?.filter(s => 
                      dims.some(d => d.id === s.dimensionId)
                    ) || [];
                    const isComplete = categoryScores.length === dims.length;
                    return (
                      <div 
                        key={category} 
                        className="flex items-center gap-2 text-sm"
                        data-testid={`category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={isComplete ? "text-foreground" : "text-muted-foreground"}>
                          {category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isEditing && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card data-testid="card-skills">
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" data-testid={`badge-skill-${index}`}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add your skills by editing your profile
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-preferences">
                <CardHeader>
                  <CardTitle className="text-lg">Job Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile?.preferredJobTypes && profile.preferredJobTypes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Job Types</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredJobTypes.map((type, index) => (
                            <Badge key={index} variant="outline" data-testid={`badge-job-type-${index}`}>
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile?.preferredLocations && profile.preferredLocations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Preferred Locations</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredLocations.map((loc, index) => (
                            <Badge key={index} variant="outline" data-testid={`badge-location-${index}`}>
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!profile?.preferredJobTypes?.length && !profile?.preferredLocations?.length) && (
                      <p className="text-sm text-muted-foreground">
                        Set your job preferences by editing your profile
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {profile?.accessibilityNeeds && profile.accessibilityNeeds.length > 0 && (
              <Card data-testid="card-accessibility">
                <CardHeader>
                  <CardTitle className="text-lg">Accessibility Preferences</CardTitle>
                  <CardDescription>
                    Your workplace accommodation needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.accessibilityNeeds.map((need, index) => (
                      <Badge key={index} variant="secondary" data-testid={`badge-accessibility-${index}`}>
                        {need}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
