"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getSubjects } from "@/lib/actions/subject.action";
import { Subject } from "@/lib/types";

export const description = "An interactive GPA chart";

// Helper function to calculate GPA from letter grades
const getGradePoint = (grade: string): number => {
  const gradePoints: Record<string, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
    "N/A": 0.0, // Default for grades not yet assigned
  };
  return gradePoints[grade] || 0;
};

// Function to calculate GPA for a list of subjects
const calculateGPA = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  const totalCredits = subjects.reduce(
    (sum, subject) => sum + subject.credits,
    0
  );
  const totalPoints = subjects.reduce(
    (sum, subject) => sum + getGradePoint(subject.grade) * subject.credits,
    0
  );
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Group subjects by year and semester
const groupSubjectsBySemester = (subjects: Subject[]) => {
  // Group by year and semester
  const grouped = subjects.reduce<Record<string, Subject[]>>((acc, subject) => {
    const key = `${subject.year}-${subject.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(subject);
    return acc;
  }, {});

  // Convert to array and map to chart data format
  return Object.entries(grouped)
    .map(([key, subjects]) => {
      const [year, semester] = key.split("-").map(Number);
      const gpa = calculateGPA(subjects);
      const credits = subjects.reduce(
        (sum, subject) => sum + subject.credits,
        0
      );
      return {
        year,
        semester,
        semesterLabel: `Y${year}S${semester}`,
        displayLabel: `Year ${year}, Sem ${semester}`,
        gpa,
        credits,
        count: subjects.length,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.semester - b.semester;
    });
};

const chartConfig = {
  gpa: {
    label: "GPA",
    color: "var(--primary)",
  },
  credits: {
    label: "Credits",
    color: "var(--color-accent)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [filter, setFilter] = React.useState("all");
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch subjects data
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getSubjects();
        if (response.success) {
          setSubjects(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setFilter("last");
    }
  }, [isMobile]);

  // Group subjects by semester and prepare chart data
  const semesterData = React.useMemo(() => {
    if (subjects.length === 0) return [];

    // Get all semesters
    return groupSubjectsBySemester(subjects);
  }, [subjects]);

  // Filter data based on selected filter
  const filteredData = React.useMemo(() => {
    if (semesterData.length === 0) return [];

    if (filter === "last") {
      // Just the last year's semesters
      const lastYear = Math.max(...semesterData.map((d) => d.year));
      const lastYearData = semesterData.filter((d) => d.year === lastYear);

      // If there's only one semester in the last year, include the last semester from previous year
      if (lastYearData.length === 1) {
        const prevYearData = semesterData.filter((d) => d.year < lastYear);
        if (prevYearData.length > 0) {
          const prevLastSemester = prevYearData[prevYearData.length - 1];
          return [prevLastSemester, ...lastYearData];
        }
      }

      return lastYearData;
    }

    return semesterData;
  }, [semesterData, filter]);

  // Calculate total GPA
  const totalGPA = React.useMemo(() => {
    return calculateGPA(subjects);
  }, [subjects]);

  // Get the last year (highest year number)
  const lastYear = React.useMemo(() => {
    if (subjects.length === 0) return 1;
    return Math.max(...subjects.map((s) => s.year));
  }, [subjects]);

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>GPA Progress</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] w-full flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>GPA Progress</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {filter === "all"
              ? `Total GPA: ${totalGPA.toFixed(2)}`
              : `Year ${lastYear} GPA Progress`}
          </span>
          <span className="@[540px]/card:hidden">
            {filter === "all" ? "Total GPA" : `Year ${lastYear}`}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={setFilter}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">Total GPA</ToggleGroupItem>
            <ToggleGroupItem value="last">Last Year</ToggleGroupItem>
          </ToggleGroup>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select view"
            >
              <SelectValue placeholder="Total GPA" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Total GPA
              </SelectItem>
              <SelectItem value="last" className="rounded-lg">
                Last Year
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillGPA" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-gpa)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-gpa)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="semesterLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={10}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name, props) => {
                    if (name === "gpa") {
                      return [
                        typeof value === "number" ? value.toFixed(2) : value,
                        `GPA: ${props.payload.displayLabel}`,
                      ];
                    }
                    return [value, name];
                  }}
                />
              }
            />
            <Area
              dataKey="gpa"
              type="monotone"
              fill="url(#fillGPA)"
              stroke="var(--color-gpa)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
