import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Wrench,
  Target,
  Loader2,
} from "lucide-react";

const resumeFormSchema = z.object({
  experience: z.string().min(10, "Please describe your work experience"),
  skills: z.string().min(5, "Please list your skills"),
  education: z.string().min(5, "Please describe your education"),
  targetRole: z.string().min(2, "Please specify your target role"),
});

type ResumeFormData = z.infer<typeof resumeFormSchema>;

const tips = [
  "Quantify your achievements with numbers when possible",
  "Use action verbs to describe your accomplishments",
  "Tailor your resume to each job application",
  "Keep it to 1-2 pages for most positions",
  "Include relevant keywords from the job posting",
];

export default function Resume() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      experience: "",
      skills: "",
      education: "",
      targetRole: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: ResumeFormData) => {
      const response = await apiRequest("POST", "/api/resume/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.resume);
      toast({
        title: "Resume Generated",
        description: "Your AI-optimized resume is ready!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResumeFormData) => {
    generateMutation.mutate(data);
  };

  const copyToClipboard = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied",
        description: "Resume content copied to clipboard.",
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-Powered
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Resume <span className="text-primary">Builder</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Create an ATS-optimized resume with AI assistance that highlights your unique strengths.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12" aria-labelledby="resume-builder-heading">
        <h2 id="resume-builder-heading" className="sr-only">Resume Builder</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <div>
              <Card className="overflow-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                    Your Information
                  </CardTitle>
                  <CardDescription>
                    Fill in your details and let AI create a professional resume for you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="targetRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Target className="h-4 w-4" aria-hidden="true" />
                              Target Role
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Software Engineer, Marketing Manager"
                                {...field}
                                data-testid="input-target-role"
                              />
                            </FormControl>
                            <FormDescription>
                              The position you're applying for
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" aria-hidden="true" />
                              Work Experience
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your work history, including job titles, companies, dates, and key responsibilities..."
                                className="min-h-32 resize-none"
                                {...field}
                                data-testid="textarea-experience"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" aria-hidden="true" />
                              Skills
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List your technical and soft skills..."
                                className="min-h-24 resize-none"
                                {...field}
                                data-testid="textarea-skills"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" aria-hidden="true" />
                              Education
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Your educational background, degrees, certifications..."
                                className="min-h-24 resize-none"
                                {...field}
                                data-testid="textarea-education"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={generateMutation.isPending}
                        data-testid="button-generate-resume"
                      >
                        {generateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Generate Resume
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="mt-6 overflow-visible">
                <CardHeader>
                  <CardTitle className="text-base">Resume Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" role="list">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div>
              <Card className="sticky top-20 overflow-visible">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Generated Resume</CardTitle>
                    <CardDescription>
                      {generatedContent
                        ? "Your AI-optimized resume is ready"
                        : "Fill in the form to generate your resume"}
                    </CardDescription>
                  </div>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        aria-label="Copy to clipboard"
                        data-testid="button-copy-resume"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                        ) : (
                          <Copy className="h-4 w-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button variant="outline" size="icon" aria-label="Download resume" data-testid="button-download-resume">
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {generateMutation.isPending ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="pt-4">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="mt-2 h-4 w-full" />
                        <Skeleton className="mt-1 h-4 w-full" />
                        <Skeleton className="mt-1 h-4 w-3/4" />
                      </div>
                      <div className="pt-4">
                        <Skeleton className="h-5 w-1/4" />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-14" />
                          <Skeleton className="h-6 w-18" />
                        </div>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm" data-testid="text-generated-resume">
                        {generatedContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-64 flex-col items-center justify-center text-center">
                      <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
                      <p className="text-muted-foreground">
                        Your generated resume will appear here
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground/70">
                        Complete the form and click "Generate Resume"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
