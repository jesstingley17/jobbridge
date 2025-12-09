import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Users, Briefcase, Code } from "lucide-react";

const roles = [
  {
    id: "participant",
    title: "Job Seeker",
    description: "I'm looking for accessible employment opportunities and career support",
    icon: Users,
  },
  {
    id: "employer",
    title: "Employer",
    description: "I want to post jobs and connect with talented candidates with disabilities",
    icon: Briefcase,
  },
  {
    id: "developer",
    title: "Developer/Partner",
    description: "I'm building tools or services to support the disability employment ecosystem",
    icon: Code,
  },
];

export default function SelectRole() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const selectRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest("POST", "/api/auth/role", { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/dashboard");
    },
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Welcome to The Job Bridge</h1>
        <p className="text-muted-foreground text-lg">
          Please select your role to personalize your experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {roles.map((role) => (
          <Card 
            key={role.id} 
            className="hover-elevate cursor-pointer"
            onClick={() => selectRoleMutation.mutate(role.id)}
            data-testid={`card-role-${role.id}`}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <role.icon className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>{role.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {role.description}
              </CardDescription>
              <Button 
                className="w-full mt-4" 
                disabled={selectRoleMutation.isPending}
                data-testid={`button-select-${role.id}`}
              >
                {selectRoleMutation.isPending ? "Selecting..." : "Select"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
