import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  Save,
  Upload,
} from "lucide-react";
import type { Resume, ResumeContact, ResumeEducation, ResumeExperience } from "@shared/schema";

const generateFormSchema = z.object({
  experience: z.string().min(10, "Please describe your work experience"),
  skills: z.string().min(5, "Please list your skills"),
  education: z.string().min(5, "Please describe your education"),
  targetRole: z.string().min(2, "Please specify your target role"),
});

type GenerateFormData = z.infer<typeof generateFormSchema>;

const resumeEditorSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  contactInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  skills: z.array(z.string()),
  education: z.array(z.object({
    school: z.string().min(1, "School name is required"),
    degree: z.string().optional(),
    major: z.string().optional(),
    gradYear: z.string().optional(),
  })),
  experience: z.array(z.object({
    company: z.string().min(1, "Company name is required"),
    title: z.string().min(1, "Job title is required"),
    dates: z.string().optional(),
    description: z.string().optional(),
  })),
});

type ResumeEditorData = z.infer<typeof resumeEditorSchema>;

const parseResumeSchema = z.object({
  resumeText: z.string().min(50, "Please paste more resume content"),
});

type ParseResumeData = z.infer<typeof parseResumeSchema>;

const tips = [
  "Quantify your achievements with numbers when possible",
  "Use action verbs to describe your accomplishments",
  "Tailor your resume to each job application",
  "Keep it to 1-2 pages for most positions",
  "Include relevant keywords from the job posting",
];

export default function Resume() {
  const [activeTab, setActiveTab] = useState("generate");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const { toast } = useToast();

  const { data: resumes, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const generateForm = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    defaultValues: {
      experience: "",
      skills: "",
      education: "",
      targetRole: "",
    },
  });

  const parseForm = useForm<ParseResumeData>({
    resolver: zodResolver(parseResumeSchema),
    defaultValues: {
      resumeText: "",
    },
  });

  const editorForm = useForm<ResumeEditorData>({
    resolver: zodResolver(resumeEditorSchema),
    defaultValues: {
      title: "",
      contactInfo: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        portfolio: "",
      },
      skills: [],
      education: [],
      experience: [],
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: editorForm.control,
    name: "education",
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: editorForm.control,
    name: "experience",
  });

  const generateMutation = useMutation({
    mutationFn: async (data: GenerateFormData) => {
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

  const parseMutation = useMutation({
    mutationFn: async (data: ParseResumeData) => {
      const response = await apiRequest("POST", "/api/resume/parse", data);
      return response.json();
    },
    onSuccess: (data: Resume) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      setSelectedResumeId(data.id);
      loadResumeIntoEditor(data);
      setActiveTab("edit");
      toast({
        title: "Resume Parsed",
        description: "Your resume has been parsed and saved!",
      });
    },
    onError: () => {
      toast({
        title: "Parsing Failed",
        description: "Could not parse the resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ResumeEditorData) => {
      if (!selectedResumeId) throw new Error("No resume selected");
      const response = await apiRequest("PATCH", `/api/resume/${selectedResumeId}`, {
        title: data.title,
        contactInfo: data.contactInfo,
        skills: data.skills,
        education: data.education,
        experience: data.experience,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      toast({
        title: "Resume Saved",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const loadResumeIntoEditor = (resume: Resume) => {
    editorForm.reset({
      title: resume.title || "",
      contactInfo: {
        name: resume.contactInfo?.name || "",
        email: resume.contactInfo?.email || "",
        phone: resume.contactInfo?.phone || "",
        linkedin: resume.contactInfo?.linkedin || "",
        portfolio: resume.contactInfo?.portfolio || "",
      },
      skills: resume.skills || [],
      education: resume.education || [],
      experience: resume.experience || [],
    });
  };

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResumeId(resume.id);
    loadResumeIntoEditor(resume);
    setActiveTab("edit");
  };

  const onGenerateSubmit = (data: GenerateFormData) => {
    generateMutation.mutate(data);
  };

  const onParseSubmit = (data: ParseResumeData) => {
    parseMutation.mutate(data);
  };

  const onEditorSubmit = (data: ResumeEditorData) => {
    updateMutation.mutate(data);
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = editorForm.getValues("skills") || [];
      editorForm.setValue("skills", [...currentSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    const currentSkills = editorForm.getValues("skills") || [];
    editorForm.setValue("skills", currentSkills.filter((_, i) => i !== index));
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
              Create, parse, and edit your resume with AI assistance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="generate" data-testid="tab-generate">Generate</TabsTrigger>
              <TabsTrigger value="parse" data-testid="tab-parse">Parse Resume</TabsTrigger>
              <TabsTrigger value="my-resumes" data-testid="tab-my-resumes">My Resumes</TabsTrigger>
              <TabsTrigger value="edit" data-testid="tab-edit" disabled={!selectedResumeId}>Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <div className="grid gap-8 lg:grid-cols-2">
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
                      <Form {...generateForm}>
                        <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} className="space-y-6">
                          <FormField
                            control={generateForm.control}
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
                            control={generateForm.control}
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
                            control={generateForm.control}
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
                            control={generateForm.control}
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
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parse">
              <div className="max-w-2xl mx-auto">
                <Card className="overflow-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
                      Parse Your Resume
                    </CardTitle>
                    <CardDescription>
                      Paste your existing resume text and our AI will extract the structured information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...parseForm}>
                      <form onSubmit={parseForm.handleSubmit(onParseSubmit)} className="space-y-6">
                        <FormField
                          control={parseForm.control}
                          name="resumeText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resume Content</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Paste your resume text here... Include your name, contact info, work experience, education, and skills."
                                  className="min-h-64 resize-none"
                                  {...field}
                                  data-testid="textarea-parse-resume"
                                />
                              </FormControl>
                              <FormDescription>
                                Copy and paste your full resume content
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full gap-2"
                          disabled={parseMutation.isPending}
                          data-testid="button-parse-resume"
                        >
                          {parseMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Parsing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" aria-hidden="true" />
                              Parse Resume
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="my-resumes">
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-visible">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                      My Resumes
                    </CardTitle>
                    <CardDescription>
                      View and edit your saved resumes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {resumesLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : resumes && resumes.length > 0 ? (
                      <div className="space-y-4">
                        {resumes.map((resume) => (
                          <div
                            key={resume.id}
                            className="flex items-center justify-between p-4 rounded-md border hover-elevate cursor-pointer"
                            onClick={() => handleResumeSelect(resume)}
                            data-testid={`resume-item-${resume.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                              <div>
                                <h3 className="font-medium">{resume.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {resume.contactInfo?.name || "No name set"}
                                  {resume.isParsed && (
                                    <Badge variant="secondary" className="ml-2">Parsed</Badge>
                                  )}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" data-testid={`button-edit-resume-${resume.id}`}>
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
                        <p className="text-muted-foreground">No resumes yet</p>
                        <p className="mt-1 text-sm text-muted-foreground/70">
                          Generate or parse a resume to get started
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="edit">
              {selectedResumeId ? (
                <div className="max-w-4xl mx-auto">
                  <Form {...editorForm}>
                    <form onSubmit={editorForm.handleSubmit(onEditorSubmit)} className="space-y-8">
                      <Card className="overflow-visible">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" aria-hidden="true" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={editorForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Resume Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="My Professional Resume" {...field} data-testid="input-resume-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={editorForm.control}
                              name="contactInfo.name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    Full Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editorForm.control}
                              name="contactInfo.email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    Email
                                  </FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="john@example.com" {...field} data-testid="input-contact-email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editorForm.control}
                              name="contactInfo.phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" aria-hidden="true" />
                                    Phone
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="(555) 123-4567" {...field} data-testid="input-contact-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editorForm.control}
                              name="contactInfo.linkedin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" aria-hidden="true" />
                                    LinkedIn
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="linkedin.com/in/johndoe" {...field} data-testid="input-contact-linkedin" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={editorForm.control}
                              name="contactInfo.portfolio"
                              render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" aria-hidden="true" />
                                    Portfolio Website
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="johndoe.com" {...field} data-testid="input-contact-portfolio" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="overflow-visible">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
                            Skills
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 mb-4">
                            <Input
                              placeholder="Add a skill..."
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addSkill();
                                }
                              }}
                              data-testid="input-add-skill"
                            />
                            <Button type="button" onClick={addSkill} variant="outline" data-testid="button-add-skill">
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editorForm.watch("skills")?.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="gap-1">
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(index)}
                                  className="ml-1 hover:text-destructive"
                                  aria-label={`Remove ${skill}`}
                                  data-testid={`button-remove-skill-${index}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="overflow-visible">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
                            Work Experience
                          </CardTitle>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendExperience({ company: "", title: "", dates: "", description: "" })}
                            data-testid="button-add-experience"
                          >
                            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                            Add
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {experienceFields.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No experience added yet</p>
                          ) : (
                            experienceFields.map((field, index) => (
                              <div key={field.id} className="space-y-4 p-4 rounded-md border">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Experience {index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeExperience(index)}
                                    data-testid={`button-remove-experience-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                  </Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FormField
                                    control={editorForm.control}
                                    name={`experience.${index}.company`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Company name" {...field} data-testid={`input-experience-company-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editorForm.control}
                                    name={`experience.${index}.title`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Job Title</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Your title" {...field} data-testid={`input-experience-title-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editorForm.control}
                                    name={`experience.${index}.dates`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Dates</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Jan 2020 - Present" {...field} data-testid={`input-experience-dates-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                <FormField
                                  control={editorForm.control}
                                  name={`experience.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Describe your responsibilities and achievements..."
                                          className="min-h-24 resize-none"
                                          {...field}
                                          data-testid={`textarea-experience-description-${index}`}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <Card className="overflow-visible">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                            Education
                          </CardTitle>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendEducation({ school: "", degree: "", major: "", gradYear: "" })}
                            data-testid="button-add-education"
                          >
                            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                            Add
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {educationFields.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No education added yet</p>
                          ) : (
                            educationFields.map((field, index) => (
                              <div key={field.id} className="space-y-4 p-4 rounded-md border">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Education {index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEducation(index)}
                                    data-testid={`button-remove-education-${index}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                                  </Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <FormField
                                    control={editorForm.control}
                                    name={`education.${index}.school`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>School</FormLabel>
                                        <FormControl>
                                          <Input placeholder="University name" {...field} data-testid={`input-education-school-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editorForm.control}
                                    name={`education.${index}.degree`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Degree</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Bachelor's, Master's, etc." {...field} data-testid={`input-education-degree-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editorForm.control}
                                    name={`education.${index}.major`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Major/Field</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Computer Science" {...field} data-testid={`input-education-major-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editorForm.control}
                                    name={`education.${index}.gradYear`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Graduation Year</FormLabel>
                                        <FormControl>
                                          <Input placeholder="2024" {...field} data-testid={`input-education-gradyear-${index}`} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </CardContent>
                      </Card>

                      <div className="flex justify-end gap-4">
                        <Button
                          type="submit"
                          className="gap-2"
                          disabled={updateMutation.isPending}
                          data-testid="button-save-resume"
                        >
                          {updateMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" aria-hidden="true" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="mb-4 h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
                  <p className="text-muted-foreground">No resume selected</p>
                  <p className="mt-1 text-sm text-muted-foreground/70">
                    Select a resume from "My Resumes" or parse a new one
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
