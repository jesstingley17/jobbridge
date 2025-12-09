import type { Job } from "@shared/schema";

interface ExternalJobsCache {
  data: Job[];
  timestamp: number;
  query: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const jobsCache: Map<string, ExternalJobsCache> = new Map();

const hasRapidApiKey = !!process.env.RAPIDAPI_KEY;

function getCacheKey(query?: string, location?: string): string {
  return `${query || "all"}_${location || "all"}`;
}

function normalizeExternalJob(externalJob: any, source: string): Job {
  const jobId = `ext_${source}_${externalJob.job_id || externalJob.id || Math.random().toString(36).substr(2, 9)}`;
  
  const accessibilityFeatures: string[] = [];
  const description = (externalJob.job_description || externalJob.description || "").toLowerCase();
  
  if (description.includes("remote") || externalJob.remote) accessibilityFeatures.push("Remote Work");
  if (description.includes("flexible") || description.includes("flexible hours")) accessibilityFeatures.push("Flexible Hours");
  if (description.includes("accommodat") || description.includes("accessible")) accessibilityFeatures.push("Accommodations Available");
  if (description.includes("disability") || description.includes("inclusive")) accessibilityFeatures.push("Disability Inclusive");

  const postedDateStr = externalJob.job_posted_at_datetime_utc ? 
    new Date(externalJob.job_posted_at_datetime_utc).toISOString().split("T")[0] :
    new Date().toISOString().split("T")[0];

  return {
    id: jobId,
    title: externalJob.job_title || externalJob.title || "Position Available",
    company: externalJob.employer_name || externalJob.company || "Company",
    location: externalJob.job_city ? 
      `${externalJob.job_city}, ${externalJob.job_state || ""}`.trim() : 
      (externalJob.location || "Location Not Specified"),
    type: externalJob.job_employment_type || externalJob.employment_type || "full-time",
    salary: externalJob.job_min_salary && externalJob.job_max_salary ? 
      `$${externalJob.job_min_salary.toLocaleString()} - $${externalJob.job_max_salary.toLocaleString()}` :
      (externalJob.salary || null),
    description: externalJob.job_description || externalJob.description || "",
    requirements: externalJob.job_required_skills?.join(", ") || externalJob.requirements || "See job description for requirements",
    accommodations: accessibilityFeatures.length > 0 ? "This employer may offer workplace accommodations" : null,
    postedDate: postedDateStr,
    accessibilityFeatures: accessibilityFeatures.length > 0 ? accessibilityFeatures : null,
    externalId: externalJob.job_id || externalJob.id || null,
    externalSource: source,
    applyUrl: externalJob.job_apply_link || externalJob.apply_url || null,
    createdAt: new Date(postedDateStr),
  };
}

async function fetchIndeedJobs(query?: string, location?: string): Promise<Job[]> {
  if (!hasRapidApiKey) {
    return [];
  }

  try {
    const searchQuery = query || "accessibility";
    const searchLocation = location || "United States";
    
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}%20jobs%20in%20${encodeURIComponent(searchLocation)}&page=1&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      console.error("External API error:", response.status);
      return [];
    }

    const data = await response.json();
    return (data.data || []).map((job: any) => normalizeExternalJob(job, "indeed") as Job);
  } catch (error) {
    console.error("Error fetching external jobs:", error);
    return [];
  }
}

function getSimulatedExternalJobs(query?: string, location?: string): Job[] {
  const searchLower = (query || "").toLowerCase();
  const locationLower = (location || "").toLowerCase();

  const externalMockJobs = [
    {
      id: "ext_indeed_1",
      title: "Accessibility Specialist",
      company: "Google",
      location: "Mountain View, CA",
      type: "full-time",
      salary: "$120,000 - $160,000",
      description: "Join Google's Accessibility team to help make products usable by everyone. We're looking for someone passionate about inclusive design and assistive technologies. You'll work on Chrome, Android, and other Google products to ensure they meet WCAG standards and provide great experiences for users with disabilities.",
      requirements: "5+ years experience in accessibility. Knowledge of WCAG, ARIA, screen readers. Experience with assistive technologies.",
      accommodations: "Comprehensive disability accommodations, flexible work arrangements, on-site accessibility features",
      postedDate: "2024-12-05",
      accessibilityFeatures: ["Remote Work", "Flexible Hours", "Accommodations Available", "Disability Inclusive"],
      externalId: "google_acc_123",
      externalSource: "indeed",
      applyUrl: "https://careers.google.com",
      createdAt: new Date("2024-12-05"),
    },
    {
      id: "ext_indeed_2",
      title: "Remote Customer Support Representative",
      company: "Zapier",
      location: "Remote",
      type: "remote",
      salary: "$55,000 - $75,000",
      description: "Provide exceptional support to Zapier customers from anywhere in the world. We're a fully remote company that values work-life balance and diverse perspectives. Help customers automate their work and solve technical challenges.",
      requirements: "Strong written communication. Problem-solving skills. Tech-savvy. Experience with SaaS products preferred.",
      accommodations: "100% remote work, flexible schedules, mental health support, ergonomic equipment stipend",
      postedDate: "2024-12-06",
      accessibilityFeatures: ["Remote Work", "Flexible Hours", "Mental Health Support"],
      externalId: "zapier_support_456",
      externalSource: "indeed",
      applyUrl: "https://zapier.com/jobs",
      createdAt: new Date("2024-12-06"),
    },
    {
      id: "ext_indeed_3",
      title: "Junior Software Developer",
      company: "Microsoft",
      location: "Redmond, WA",
      type: "hybrid",
      salary: "$85,000 - $110,000",
      description: "Start your career at Microsoft working on products that reach billions of users. Our inclusive culture welcomes developers from all backgrounds. You'll learn from experienced engineers and contribute to real products.",
      requirements: "CS degree or equivalent experience. Knowledge of one programming language. Eagerness to learn.",
      accommodations: "Hybrid work options, comprehensive benefits, disability accommodations, mentorship programs",
      postedDate: "2024-12-07",
      accessibilityFeatures: ["Hybrid Work", "Accommodations Available", "Mentorship Programs"],
      externalId: "msft_dev_789",
      externalSource: "indeed",
      applyUrl: "https://careers.microsoft.com",
      createdAt: new Date("2024-12-07"),
    },
    {
      id: "ext_indeed_4",
      title: "Content Writer",
      company: "Buffer",
      location: "Remote",
      type: "remote",
      salary: "$60,000 - $80,000",
      description: "Create engaging content for Buffer's blog, social media, and marketing materials. We're a fully distributed team that prioritizes transparent communication and diverse voices. Share your unique perspective through content.",
      requirements: "Excellent writing skills. Social media experience. SEO knowledge. Portfolio of published work.",
      accommodations: "Fully remote, flexible hours, wellness benefits, professional development budget",
      postedDate: "2024-12-04",
      accessibilityFeatures: ["Remote Work", "Flexible Hours", "Wellness Benefits"],
      externalId: "buffer_writer_012",
      externalSource: "indeed",
      applyUrl: "https://buffer.com/journey",
      createdAt: new Date("2024-12-04"),
    },
    {
      id: "ext_indeed_5",
      title: "Data Entry Specialist",
      company: "Automattic",
      location: "Remote",
      type: "remote",
      salary: "$45,000 - $60,000",
      description: "Help maintain and organize data for WordPress.com and other Automattic products. Work from anywhere in the world with a flexible schedule. Attention to detail and accuracy are key.",
      requirements: "Strong attention to detail. Proficiency in spreadsheets. Good typing speed. Organizational skills.",
      accommodations: "Fully distributed company, set your own hours, home office equipment provided",
      postedDate: "2024-12-03",
      accessibilityFeatures: ["Remote Work", "Flexible Hours", "Equipment Provided"],
      externalId: "auto_data_345",
      externalSource: "indeed",
      applyUrl: "https://automattic.com/work-with-us",
      createdAt: new Date("2024-12-03"),
    },
    {
      id: "ext_indeed_6",
      title: "HR Coordinator",
      company: "Salesforce",
      location: "San Francisco, CA",
      type: "hybrid",
      salary: "$65,000 - $85,000",
      description: "Support Salesforce's HR team in creating an inclusive workplace. Coordinate onboarding, manage employee programs, and help maintain our culture of equality. We believe business is a platform for change.",
      requirements: "HR experience or degree. Strong organizational skills. Excellent communication. HRIS experience preferred.",
      accommodations: "Hybrid work, comprehensive benefits, employee resource groups, accessibility accommodations",
      postedDate: "2024-12-02",
      accessibilityFeatures: ["Hybrid Work", "Employee Resource Groups", "Accommodations Available"],
      externalId: "sf_hr_678",
      externalSource: "indeed",
      applyUrl: "https://salesforce.com/careers",
      createdAt: new Date("2024-12-02"),
    },
    {
      id: "ext_indeed_7",
      title: "QA Tester",
      company: "Mozilla",
      location: "Remote",
      type: "remote",
      salary: "$70,000 - $90,000",
      description: "Test Firefox and other Mozilla products to ensure quality and accessibility. Help us build an internet that's open and accessible to all. Work with a mission-driven team that values privacy and inclusion.",
      requirements: "Testing experience. Familiarity with bug tracking systems. Attention to detail. Passion for web standards.",
      accommodations: "Remote-first, flexible schedule, mission-driven work, inclusive culture",
      postedDate: "2024-12-01",
      accessibilityFeatures: ["Remote Work", "Flexible Hours", "Mission-Driven"],
      externalId: "moz_qa_901",
      externalSource: "indeed",
      applyUrl: "https://careers.mozilla.org",
      createdAt: new Date("2024-12-01"),
    },
    {
      id: "ext_indeed_8",
      title: "Virtual Assistant",
      company: "Belay Solutions",
      location: "Remote",
      type: "part-time",
      salary: "$20 - $30/hour",
      description: "Provide virtual administrative support to busy professionals. Work from home with flexible hours. Great opportunity for those seeking part-time remote work with schedule flexibility.",
      requirements: "Administrative experience. Strong organization. Proficient in Google Workspace or Microsoft Office. Reliable internet.",
      accommodations: "100% remote, flexible part-time hours, choose your clients, work-life balance focus",
      postedDate: "2024-12-08",
      accessibilityFeatures: ["Remote Work", "Part-Time", "Flexible Schedule"],
      externalId: "belay_va_234",
      externalSource: "indeed",
      applyUrl: "https://belaysolutions.com/careers",
      createdAt: new Date("2024-12-08"),
    },
  ] as Job[];

  return externalMockJobs.filter(job => {
    const matchesSearch = !searchLower || 
      job.title.toLowerCase().includes(searchLower) ||
      job.company.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower);
    
    const matchesLocation = !locationLower ||
      locationLower === "remote" && job.type === "remote" ||
      job.location.toLowerCase().includes(locationLower);

    return matchesSearch && matchesLocation;
  });
}

export async function getExternalJobs(query?: string, location?: string, type?: string): Promise<Job[]> {
  const cacheKey = getCacheKey(query, location);
  const cached = jobsCache.get(cacheKey);
  
  let jobs: Job[];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    jobs = cached.data;
  } else {
    if (hasRapidApiKey) {
      jobs = await fetchIndeedJobs(query, location);
      if (jobs.length === 0) {
        jobs = getSimulatedExternalJobs(query, location);
      }
    } else {
      jobs = getSimulatedExternalJobs(query, location);
    }

    jobsCache.set(cacheKey, {
      data: jobs,
      timestamp: Date.now(),
      query: cacheKey,
    });
  }

  if (type && type !== "all") {
    jobs = jobs.filter(job => job.type === type);
  }

  return jobs;
}

export function clearExternalJobsCache(): void {
  jobsCache.clear();
}
