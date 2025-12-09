import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import {
  MessageSquare,
  Sparkles,
  Play,
  Send,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  Target,
  Loader2,
  ChevronRight,
  ThumbsUp,
  ArrowRight,
} from "lucide-react";

const setupFormSchema = z.object({
  jobTitle: z.string().min(2, "Please enter a job title"),
  jobDescription: z.string().optional(),
});

type SetupFormData = z.infer<typeof setupFormSchema>;

interface Question {
  id: number;
  text: string;
  answered: boolean;
  answer?: string;
  feedback?: string;
}

const interviewTips = [
  "Take a moment to gather your thoughts before answering",
  "Use the STAR method (Situation, Task, Action, Result)",
  "Be specific with examples from your experience",
  "It's okay to ask for clarification",
  "Practice makes perfect - do multiple rounds",
];

export default function Interview() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const { toast } = useToast();
  const { handleApiError } = useSubscriptionContext();

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
    },
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: SetupFormData) => {
      const response = await apiRequest("POST", "/api/interview/questions", data);
      return response.json();
    },
    onSuccess: (data) => {
      const generatedQuestions: Question[] = data.questions.map((q: { question: string }, i: number) => ({
        id: i + 1,
        text: q.question,
        answered: false,
      }));
      setQuestions(generatedQuestions);
      setSessionStarted(true);
      setJobTitle(form.getValues("jobTitle"));
      toast({
        title: "Interview Session Started",
        description: `${generatedQuestions.length} questions prepared for you.`,
      });
    },
    onError: (error) => {
      if (handleApiError(error)) return;
      toast({
        title: "Failed to Generate Questions",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const analyzeAnswerMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; jobTitle: string }) => {
      const response = await apiRequest("POST", "/api/interview/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === currentIndex
            ? { ...q, answered: true, answer: currentAnswer, feedback: data.feedback }
            : q
        )
      );
      setCurrentAnswer("");
      toast({
        title: "Answer Analyzed",
        description: "Check your feedback below.",
      });
    },
    onError: (error) => {
      if (handleApiError(error)) return;
      toast({
        title: "Analysis Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitSetup = (data: SetupFormData) => {
    generateQuestionsMutation.mutate(data);
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    analyzeAnswerMutation.mutate({
      question: questions[currentIndex].text,
      answer: currentAnswer,
      jobTitle,
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer("");
    }
  };

  const resetSession = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setCurrentAnswer("");
    setSessionStarted(false);
    setJobTitle("");
    form.reset();
  };

  const progress = questions.length > 0
    ? (questions.filter((q) => q.answered).length / questions.length) * 100
    : 0;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-Powered Practice
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Interview <span className="text-primary">Preparation</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Practice with AI-generated questions tailored to your target role and get personalized feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12" aria-labelledby="interview-prep-heading">
        <h2 id="interview-prep-heading" className="sr-only">Interview Preparation</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!sessionStarted ? (
            <div className="mx-auto max-w-2xl">
              <Card className="overflow-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                    Start Practice Session
                  </CardTitle>
                  <CardDescription>
                    Tell us about the role you're preparing for and we'll generate relevant interview questions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitSetup)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Software Engineer, Data Analyst"
                                {...field}
                                data-testid="input-interview-job-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="jobDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Paste the job description for more tailored questions..."
                                className="min-h-32 resize-none"
                                {...field}
                                data-testid="textarea-job-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={generateQuestionsMutation.isPending}
                        data-testid="button-start-practice"
                      >
                        {generateQuestionsMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Generating Questions...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" aria-hidden="true" />
                            Start Practice
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
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
                    Interview Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" role="list">
                    {interviewTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Questions List */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20 overflow-visible">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base">Questions</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSession}
                        className="gap-1"
                        data-testid="button-reset-session"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Reset
                      </Button>
                    </div>
                    <div className="mt-2">
                      <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" aria-label="Interview progress" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {questions.map((q, index) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors ${
                          index === currentIndex
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                        data-testid={`button-question-${q.id}`}
                      >
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${
                            q.answered
                              ? "bg-primary text-primary-foreground"
                              : "border border-muted-foreground/30"
                          }`}
                        >
                          {q.answered ? (
                            <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            q.id
                          )}
                        </div>
                        <span className="line-clamp-1 text-sm">Question {q.id}</span>
                        {index === currentIndex && (
                          <ChevronRight className="ml-auto h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Current Question */}
              <div className="lg:col-span-2">
                <Card className="overflow-visible">
                  <CardHeader>
                    <Badge variant="secondary" className="mb-2 w-fit">
                      Question {currentIndex + 1} of {questions.length}
                    </Badge>
                    <CardTitle className="text-xl leading-relaxed" data-testid="text-current-question">
                      {currentQuestion?.text}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentQuestion?.answered ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-medium">Your Answer</h4>
                          <div className="rounded-md bg-muted/50 p-4 text-sm" data-testid="text-user-answer">
                            {currentQuestion.answer}
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-2 flex items-center gap-2 font-medium">
                            <ThumbsUp className="h-4 w-4 text-primary" aria-hidden="true" />
                            AI Feedback
                          </h4>
                          <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm" data-testid="text-feedback">
                            {currentQuestion.feedback}
                          </div>
                        </div>
                        {currentIndex < questions.length - 1 && (
                          <Button onClick={nextQuestion} className="w-full gap-2" data-testid="button-next-question">
                            Next Question
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="answer" className="mb-2 block font-medium">
                            Your Answer
                          </label>
                          <Textarea
                            id="answer"
                            placeholder="Type your answer here..."
                            className="min-h-40 resize-none"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            data-testid="textarea-answer"
                          />
                        </div>
                        <Button
                          onClick={submitAnswer}
                          className="w-full gap-2"
                          disabled={!currentAnswer.trim() || analyzeAnswerMutation.isPending}
                          data-testid="button-submit-answer"
                        >
                          {analyzeAnswerMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" aria-hidden="true" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
