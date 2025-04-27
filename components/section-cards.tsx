"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import {
  getSubjects,
  getPreviousSemestersSubjects,
  getLastSemesterSubjects,
} from "@/lib/actions/subject.action";
import { Subject } from "@/lib/types";

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

// Function to count repeat courses (F grades)
const countRepeats = (subjects: Subject[]): number => {
  return subjects.filter((subject) => subject.grade === "F").length;
};

export function SectionCards() {
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [previousSubjects, setPreviousSubjects] = useState<Subject[]>([]);
  const [lastSemesterSubjects, setLastSemesterSubjects] = useState<Subject[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [allResponse, previousResponse, lastSemesterResponse] =
          await Promise.all([
            getSubjects(),
            getPreviousSemestersSubjects(),
            getLastSemesterSubjects(),
          ]);

        if (allResponse.success && allResponse.data) {
          setAllSubjects(allResponse.data);
        }

        if (previousResponse.success && previousResponse.data) {
          setPreviousSubjects(previousResponse.data);
        }

        if (lastSemesterResponse.success && lastSemesterResponse.data) {
          setLastSemesterSubjects(lastSemesterResponse.data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from subjects
  const stats = useMemo(() => {
    // Calculate total GPA based on all subjects
    const totalGpa = calculateGPA(allSubjects);

    // Calculate previous GPA (before last semester)
    const previousGpa = calculateGPA(previousSubjects);

    // Calculate last semester GPA
    const lastSemesterGpa = calculateGPA(lastSemesterSubjects);

    // Calculate total credits for all subjects
    const totalCredits = allSubjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );

    // Calculate credits from previous semesters
    const previousCredits = previousSubjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );

    // Calculate credits from last semester
    const lastSemesterCredits = lastSemesterSubjects.reduce(
      (sum, subject) => sum + subject.credits,
      0
    );

    // Count repeats (F grades) in all semesters
    const totalRepeats = countRepeats(allSubjects);

    // Count repeats from previous semesters
    const previousRepeats = countRepeats(previousSubjects);

    // Calculate growth rate (compare current GPA with previous semesters' GPA)
    const growthRate =
      previousGpa > 0 ? ((totalGpa - previousGpa) / previousGpa) * 100 : 0;

    return {
      totalGpa,
      previousGpa,
      lastSemesterGpa,
      totalCredits,
      previousCredits,
      lastSemesterCredits,
      totalRepeats,
      previousRepeats,
      growthRate,
    };
  }, [allSubjects, previousSubjects, lastSemesterSubjects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total GPA</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalGpa.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.growthRate >= 0 ? (
                <>
                  <IconTrendingUp className="mr-1" />+
                  {Math.abs(stats.growthRate).toFixed(1)}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="mr-1" />-
                  {Math.abs(stats.growthRate).toFixed(1)}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.growthRate >= 0 ? (
              <>
                Improved from {stats.previousGpa.toFixed(2)}
                <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Dropped from {stats.previousGpa.toFixed(2)}
                <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Based on {allSubjects.length} subjects
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Credits</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalCredits}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="mr-1" />+{stats.lastSemesterCredits}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.lastSemesterCredits} credits this semester
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.previousCredits} credits from previous sem
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Failing Grades</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalRepeats.toString().padStart(2, "0")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.totalRepeats > stats.previousRepeats ? (
                <>
                  <IconTrendingUp className="mr-1" />+
                  {stats.totalRepeats - stats.previousRepeats}
                </>
              ) : (
                <>
                  <IconTrendingDown className="mr-1" />
                  +0
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.totalRepeats === 0 ? (
              <>
                No failed subjects <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Failed subjects need attention{" "}
                <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            {stats.totalRepeats - stats.previousRepeats} new failures this
            semester
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Last Semester GPA</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.growthRate.toFixed(2)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.lastSemesterGpa >= stats.previousGpa ? (
                <>
                  <IconTrendingUp className="mr-1" />+
                  {(stats.lastSemesterGpa - stats.previousGpa).toFixed(2)}
                </>
              ) : (
                <>
                  <IconTrendingDown className="mr-1" />
                  {(stats.lastSemesterGpa - stats.previousGpa).toFixed(2)}
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.lastSemesterGpa >= stats.previousGpa ? (
              <>
                performance improved <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                performance decreased <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Based on {lastSemesterSubjects.length} courses this semester
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
