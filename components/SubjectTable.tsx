"use client";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  deleteMultipleSubjects,
  updateSubjectGrade,
} from "@/lib/actions/subject.action";

import { useSubjects, Subject } from "./SubjectsContext";

type GroupedSubjects = {
  year: number;
  semester: number;
  subjects: Subject[];
};

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
    "N/A": 0.0, // Default value for "Not Applicable"
  };
  return gradePoints[grade] || 0;
};

// Available grade options
const gradeOptions = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "F",
];

// Group subjects by year and semester
const groupSubjectsByYearAndSemester = (
  subjects: Subject[]
): GroupedSubjects[] => {
  // Group by year and semester
  const grouped = subjects.reduce((acc, subject) => {
    const key = `${subject.year}-${subject.semester}`;
    if (!acc[key]) {
      acc[key] = {
        year: subject.year,
        semester: subject.semester,
        subjects: [],
      };
    }
    acc[key].subjects.push(subject);
    return acc;
  }, {} as Record<string, GroupedSubjects>);

  // Convert to array and sort by year and semester
  return Object.values(grouped).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester - b.semester;
  });
};

export function SubjectTable() {
  const { subjects, loading, refreshSubjects } = useSubjects();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [updatingGrade, setUpdatingGrade] = useState<string | null>(null);

  // Group subjects by year and semester
  const groupedSubjects = useMemo(
    () => groupSubjectsByYearAndSemester(subjects),
    [subjects]
  );

  const totalCredits = useMemo(
    () => subjects.reduce((sum, subject) => sum + subject.credits, 0),
    [subjects]
  );

  const gpa = useMemo(() => {
    if (totalCredits === 0) return 0;
    const totalPoints = subjects.reduce(
      (sum, subject) =>
        sum + getGradePoint(subject.grade ?? "N/A") * subject.credits,
      0
    );
    return totalPoints / totalCredits;
  }, [subjects, totalCredits]);

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Handle select all for a specific group
  const toggleSelectGroup = (groupSubjects: Subject[]) => {
    const groupIds = groupSubjects.map((subject) => subject.id);
    const allSelected = groupIds.every((id) => selectedRows.includes(id));

    if (allSelected) {
      // Unselect all in this group
      setSelectedRows((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      // Select all in this group
      const newSelected = [...selectedRows];
      groupIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedRows(newSelected);
    }
  };

  // Handle delete selected
  const deleteSelected = async () => {
    if (selectedRows.length === 0) return;

    setDeleting(true);
    try {
      const result = await deleteMultipleSubjects(selectedRows);
      if (result.success) {
        toast(`${selectedRows.length} subject(s) deleted successfully`);
        await refreshSubjects(); // Refresh the subjects from context
        setSelectedRows([]); // Clear selection
      } else {
        toast(result.error || "Failed to delete subjects");
      }
    } catch (error) {
      console.error("Failed to delete subjects:", error);
      toast("Something went wrong when deleting subjects");
    } finally {
      setDeleting(false);
    }
  };

  // Handle grade change
  const handleGradeChange = async (id: string, newGrade: string) => {
    setUpdatingGrade(id);
    try {
      const result = await updateSubjectGrade(id, newGrade);
      if (result.success) {
        await refreshSubjects(); // Refresh the subjects from context
        toast("Grade updated successfully");
      } else {
        toast(result.error || "Failed to update grade");
      }
    } catch (error) {
      console.error("Failed to update grade:", error);
      toast("Something went wrong when updating grade");
    } finally {
      setUpdatingGrade(null);
    }
  };

  // Loading state - using a div with space-y-4 class to match what error shows as expected UI
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-10">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar with sticky positioning */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 py-2 bg-transparent flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-1"
          >
            {deleting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}

      {/* No subjects message */}
      {subjects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No subjects added yet. Add your first subject with the form above.
        </div>
      ) : (
        /* Table container */
        <Table>
          {/* Render tables grouped by year and semester */}
          {groupedSubjects.map((group, groupIndex) => (
            <React.Fragment key={`${group.year}-${group.semester}`}>
              {/* Year and Semester Header */}
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-800">
                  <TableHead
                    colSpan={5}
                    className="py-3 text-left font-semibold text-md"
                  >
                    {group.year} Year & Semester {group.semester}
                  </TableHead>
                </TableRow>

                {/* Column Headers */}
                <TableRow className="bg-slate-50 dark:bg-slate-800/80">
                  <TableHead className="w-[50px] pl-4">
                    <Checkbox
                      checked={
                        group.subjects.length > 0 &&
                        group.subjects.every((s) => selectedRows.includes(s.id))
                      }
                      onCheckedChange={() => toggleSelectGroup(group.subjects)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Course Unit</TableHead>
                  <TableHead className="text-center">Credit</TableHead>
                  <TableHead className="text-right pr-6">Grade</TableHead>
                </TableRow>
              </TableHeader>

              {/* Subject Rows */}
              <TableBody>
                {group.subjects.map((subject) => (
                  <TableRow
                    key={subject.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedRows.includes(subject.id)
                        ? "bg-blue-50/50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedRows.includes(subject.id)}
                        onCheckedChange={() => toggleRowSelection(subject.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell className="font-medium ">
                      {subject.code}
                    </TableCell>
                    <TableCell className="max-w-[300px] py-4 line-clamp-1">
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {subject.credits}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Select
                        defaultValue={subject.grade ?? undefined}
                        onValueChange={(value) =>
                          handleGradeChange(subject.id, value)
                        }
                        disabled={updatingGrade === subject.id}
                      >
                        <SelectTrigger className="ml-auto w-[65px] h-8 px-2 py-0">
                          {updatingGrade === subject.id ? (
                            <LoaderCircle className="h-3 w-3 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent className="min-w-0 w-[75px]">
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              <span className="font-medium">{grade}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              {/* Add a spacer between groups except for the last one */}
              {groupIndex < groupedSubjects.length - 1 && (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-3 p-0 bg-white dark:bg-black/20"
                    ></TableCell>
                  </TableRow>
                </TableBody>
              )}
            </React.Fragment>
          ))}

          {/* Summary Footer */}
          <TableFooter className="bg-slate-100 dark:bg-slate-800/80">
            <TableRow>
              <TableCell colSpan={3} className="font-medium">
                Total Credits
              </TableCell>
              <TableCell className="text-center font-medium">
                {totalCredits}
              </TableCell>
              <TableCell className="text-right pr-6" />
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="font-medium">
                GPA
              </TableCell>
              <TableCell className="text-right font-bold pr-6">
                {gpa.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
}
