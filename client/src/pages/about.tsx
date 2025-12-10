import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Shield, Accessibility, Zap, ArrowRight, Sparkles, Building2 } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-background dark:from-blue-950/20 dark:via-background py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[rgba(28,57,142,0)] dark:bg-blue-900/30 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              The JobBridge, Inc.
            </div>
            <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
              About Us
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
              Built for the ones the world keeps overlooking
            </p>
          </div>
        </div>
      </section>

      {/* Main About Us Section */}
      <section className="py-20 md:py-32" aria-labelledby="about-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8 text-lg text-muted-foreground leading-relaxed">
              <p className="text-2xl text-foreground leading-relaxed">
                The JobBridge was built for the ones the world keeps overlooking — the neurodivergent kids 
                who grow into brilliant adults, the wheelchair warriors, the anxiety-fighters, the late 
                bloomers, the job seekers who were always &quot;almost hired&quot; but never fully seen.
              </p>
              
              <p className="text-xl text-foreground">
                We&apos;re the tech that finally says: <span className="text-blue-700 dark:text-blue-400 italic">nah, you deserve better.</span>
              </p>
              
              <p>
                Born from lived experience, built with accessibility as the blueprint — not the afterthought — 
                The JobBridge is a next-gen job-matching ecosystem powered by AI that actually gets people. 
                It translates strengths, breaks down tasks, builds confidence, and connects job seekers with 
                employers who value what they bring, not what they lack.
              </p>
              
              <p>
                Our platform gives job developers superpowers, gives employers clarity, and gives job seekers 
                the one thing the system rarely hands them: <span className="text-foreground">a fair shot.</span>
              </p>
              
              <div className="pt-6 border-t">
                <p className="text-xl text-foreground mb-2">
                  We&apos;re rewriting the hiring world piece by piece — cleaner, kinder, smarter.
                </p>
                <p className="text-2xl text-blue-700 dark:text-blue-400">
                  A bridge, yes — but also a launchpad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Founder Section */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="founder-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 id="founder-heading" className="text-3xl tracking-tight md:text-4xl mb-4">
                About the Founder
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(28,57,142,0)] dark:bg-blue-900/30 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Jessica-Lee Tingley
              </div>
            </div>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              {/* Founder Image Placeholder */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[3/4] w-full max-w-md mx-auto lg:mx-0">
                  <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 w-full h-full shadow-lg flex items-center justify-center">
                    <Users className="h-24 w-24 text-blue-400 dark:text-blue-500" aria-hidden="true" />
                  </div>
                </div>
              </div>
              {/* Founder Bio */}
              <div className="order-1 lg:order-2 space-y-6">
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p className="text-xl text-foreground">
                    Jessica-Lee built The JobBridge the same way she rebuilt her life — from grit, 
                    intuition, and a fire that refused to die out.
                  </p>
                  <p>
                    She&apos;s a job developer, an educator, a tech founder, a survivor, and a problem-solver 
                    with main-character energy and a heart wired for service.
                  </p>
                  <p>
                    She&apos;s walked with people through trauma, disability, burnout, immigration battles, 
                    and the messy stuff no résumé ever mentions.
                  </p>
                  <p className="text-xl text-foreground">
                    And through all of it, she kept seeing the same thing:
                  </p>
                  <p className="text-xl italic text-blue-700 dark:text-blue-400">
                    brilliant humans were slipping through the cracks because the system wasn&apos;t designed for them.
                  </p>
                  <p className="text-xl text-foreground">
                    So she decided to design a new system.
                  </p>
                  <p>
                    Jess operates like a futurist with a soft touch — part philosopher, part disruptor, 
                    part big-sister energy for anyone trying to rise. She took her frontline experience, 
                    her special-education background, her VR job-development work, and her tech obsession… 
                    and spun it into a platform that blends AI, accessibility, and pure human compassion.
                  </p>
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-foreground">Rebel brain. Healer&apos;s heart. CEO precision.</p>
                    <p className="text-xl text-blue-700 dark:text-blue-400">
                      That&apos;s the force behind The JobBridge, Inc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 md:py-32" aria-labelledby="what-we-do-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 id="what-we-do-heading" className="text-3xl tracking-tight md:text-4xl mb-4">
              What We Do
            </h2>
            <p className="text-lg text-muted-foreground">
              Three powerful tools, one mission: fair employment for everyone
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "For Job Seekers",
                description: "AI-powered matching that understands your strengths, builds your confidence, and connects you with employers who see your value.",
              },
              {
                icon: Zap,
                title: "For Job Developers",
                description: "Superpowers that streamline your work, amplify your impact, and help you place more people in meaningful roles.",
              },
              {
                icon: Target,
                title: "For Employers",
                description: "Clarity on talent, accessibility insights, and tools to build truly inclusive teams that drive innovation.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-20 md:py-32" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 id="values-heading" className="text-3xl tracking-tight md:text-4xl mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Lived Experience First",
                description: "We build from real stories, real struggles, real solutions — not assumptions.",
              },
              {
                icon: Accessibility,
                title: "Accessibility by Design",
                description: "Not an afterthought. Not a feature. The blueprint from day one.",
              },
              {
                icon: Target,
                title: "Fair Shots for Everyone",
                description: "We level the playing field so talent can shine, regardless of how it&apos;s packaged.",
              },
              {
                icon: Users,
                title: "Human-Centered Tech",
                description: "AI that gets people, understands context, and amplifies human potential.",
              },
              {
                icon: Shield,
                title: "Privacy & Trust",
                description: "Your story is yours. We protect it with enterprise-grade security and radical transparency.",
              },
              {
                icon: Zap,
                title: "Disrupt with Purpose",
                description: "We&apos;re not here to maintain the status quo. We&apos;re here to rewrite it.",
              },
            ].map((value) => (
              <Card key={value.title} className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <value.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 md:py-32" aria-labelledby="impact-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 id="impact-heading" className="text-3xl tracking-tight md:text-4xl mb-8">
              Our Impact
            </h2>
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              {[
                { value: "10,000+", label: "Job Seekers Helped" },
                { value: "500+", label: "Inclusive Employers" },
                { value: "95%", label: "Accessibility Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl text-blue-700 dark:text-blue-400 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every number represents a life changed, a career launched, and a barrier broken. 
              We&apos;re proud of what we&apos;ve accomplished, but we know there&apos;s so much more work to do.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="dark:bg-blue-700 py-20 bg-[rgba(20,71,230,0.57)]" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="cta-heading" className="text-3xl tracking-tight text-white md:text-4xl">
            Ready to Build a Better System?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Whether you&apos;re a job seeker, job developer, or employer — join us in rewriting the hiring world.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 px-8 py-6 text-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8 py-6 text-lg border-white text-white hover:bg-white/10"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

