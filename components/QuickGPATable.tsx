"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjects } from "@/lib/actions/subject.action";

import { v4 as uuidv4 } from "uuid";
import { LoaderCircle } from "lucide-react";

// Define subject type
interface Subject {
  id: string;
  code: string;
  name: string;
  year: number;
  semester: number;
  credits: number;
  grade: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Grade points mapping
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
    "N/A": 0.0,
  };
  return gradePoints[grade] || 0;
};

// Helper to calculate GPA
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

  return totalCredits > 0 ? +(totalPoints / totalCredits).toFixed(2) : 0;
};

// Helper to check if a grade is below C
const isLowGrade = (grade: string): boolean => {
  const lowGrades = ["C-", "D+", "D", "F"];
  return lowGrades.includes(grade);
};

// Helper to get color based on grade
const getGradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "bg-green-500";
  if (grade.startsWith("B")) return "bg-blue-500";
  if (grade.startsWith("C+")) return "bg-yellow-400";
  if (grade.startsWith("C")) return "bg-yellow-500";
  if (grade.startsWith("D")) return "bg-orange-500";
  return "bg-red-500";
};

// Available grade options for simulation
const simulationGradeOptions = ["C", "C-", "D+", "D", "F"];

// Available grade options for new subjects
const allGradeOptions = [
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

const QuickGPATable: React.FC = () => {
  const [originalSubjects, setOriginalSubjects] = useState<Subject[]>([]);
  const [modifiedSubjects, setModifiedSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalGPA, setOriginalGPA] = useState(0);
  const [newGPA, setNewGPA] = useState(0);

  // State for new dummy subject
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    code: "NUR XXXX",
    name: "Subject",
    credits: 3,
    grade: "C+",
    year: new Date().getFullYear(),
    semester: 1,
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await getSubjects();

        if (response.success && response.data) {
          setOriginalSubjects(response.data);
          setModifiedSubjects([...response.data]);

          // Filter for subjects with grades below C+
          const lowGradeSubjects = response.data.filter((subject) =>
            isLowGrade(subject.grade)
          );

          setFilteredSubjects(lowGradeSubjects);
          setOriginalGPA(calculateGPA(response.data));
          setNewGPA(calculateGPA(response.data));
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Handle changing a grade for simulation
  const handleGradeChange = (id: string, newGrade: string) => {
    const updatedSubjects = modifiedSubjects.map((subject) =>
      subject.id === id ? { ...subject, grade: newGrade } : subject
    );

    setModifiedSubjects(updatedSubjects);
    setNewGPA(calculateGPA(updatedSubjects));
  };

  // Handle adding a dummy subject
  const handleAddDummySubject = () => {
    if (!newSubject.credits || !newSubject.grade) return;

    const dummySubject: Subject = {
      id: uuidv4(),
      code: newSubject.code || `DUMMY${Math.floor(Math.random() * 1000)}`,
      name: newSubject.name || "Dummy Subject",
      year: newSubject.year || new Date().getFullYear(),
      semester: newSubject.semester || 1,
      credits: newSubject.credits,
      grade: newSubject.grade,
    };

    const updatedSubjects = [...modifiedSubjects, dummySubject];
    setModifiedSubjects(updatedSubjects);
    setNewGPA(calculateGPA(updatedSubjects));

    // Reset the form
    setNewSubject({
      code: "NUR XXXX",
      name: "Dummy Subject",
      credits: 2,
      grade: "C+",
      year: 2,
      semester: 1,
    });
  };

  // Handle removing a dummy subject
  const handleRemoveSubject = (id: string) => {
    // Check if it's an original subject or a dummy one
    const isOriginal = originalSubjects.some((subject) => subject.id === id);

    if (isOriginal) {
      // If it's an original subject, just reset its grade
      const updatedSubjects = modifiedSubjects.map((subject) =>
        subject.id === id
          ? originalSubjects.find((orig) => orig.id === id) || subject
          : subject
      );
      setModifiedSubjects(updatedSubjects);
      setNewGPA(calculateGPA(updatedSubjects));
    } else {
      // If it's a dummy subject, remove it
      const updatedSubjects = modifiedSubjects.filter(
        (subject) => subject.id !== id
      );
      setModifiedSubjects(updatedSubjects);
      setNewGPA(calculateGPA(updatedSubjects));
    }
  };

  // Reset all changes
  const handleResetAll = () => {
    setModifiedSubjects([...originalSubjects]);
    setNewGPA(calculateGPA(originalSubjects));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  const gpaImprovement = newGPA - originalGPA;
  const hasDummySubjects = modifiedSubjects.length > originalSubjects.length;
  const hasGradeChanges =
    JSON.stringify(
      modifiedSubjects.map((s) => ({ id: s.id, grade: s.grade }))
    ) !==
    JSON.stringify(originalSubjects.map((s) => ({ id: s.id, grade: s.grade })));

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Quick GPA Simulator</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Simulate GPA improvements by changing grades below C+ and adding
            dummy subjects
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">
            Current GPA:{" "}
            <span className="text-lg">{originalGPA.toFixed(2)}</span>
          </div>
          <div className="text-sm font-medium">
            Simulated GPA:{" "}
            <span
              className={`text-lg ${
                gpaImprovement > 0 ? "text-green-600" : ""
              }`}
            >
              {newGPA.toFixed(2)}
              {gpaImprovement > 0 && (
                <span className="ml-1 text-green-600">
                  (+{gpaImprovement.toFixed(2)})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {filteredSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subjects with Low Grades (Below C)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Year</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Current Grade</TableHead>
                  <TableHead className="text-center">Simulated Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => {
                  const modifiedSubject = modifiedSubjects.find(
                    (s) => s.id === subject.id
                  );

                  const hasChanged = modifiedSubject?.grade !== subject.grade;

                  return (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">
                        {subject.code}
                      </TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell className="text-center">
                        {subject.year}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.semester}
                      </TableCell>
                      <TableCell className="text-center">
                        {subject.credits}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={modifiedSubject?.grade || subject.grade}
                          onValueChange={(value) =>
                            handleGradeChange(subject.id, value)
                          }
                        >
                          <SelectTrigger
                            className={`w-24 mx-auto ${
                              hasChanged ? "border-green-500" : ""
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {simulationGradeOptions.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Dummy Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-1">
              <label className="text-sm font-medium">Code</label>
              <Input
                placeholder="Code"
                value={newSubject.code}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, code: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Subject Name"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Credits</label>
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="Credits"
                value={newSubject.credits}
                onChange={(e) =>
                  setNewSubject({
                    ...newSubject,
                    credits: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Grade</label>
              <Select
                value={newSubject.grade}
                onValueChange={(value) =>
                  setNewSubject({ ...newSubject, grade: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allGradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleAddDummySubject}>
                Add Subject
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {(hasDummySubjects || hasGradeChanges) && (
        <Card>
          <CardHeader>
            <CardTitle>Simulated Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modifiedSubjects
                  .filter((subject) => {
                    // Show only subjects that:
                    // 1. Are dummy subjects (not in originalSubjects)
                    // 2. Have a changed grade compared to original
                    const original = originalSubjects.find(
                      (s) => s.id === subject.id
                    );
                    return !original || original.grade !== subject.grade;
                  })
                  .map((subject) => {
                    const original = originalSubjects.find(
                      (s) => s.id === subject.id
                    );
                    const isDummy = !original;
                    const hasChanged =
                      original && original.grade !== subject.grade;

                    return (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                          {subject.code}
                        </TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell className="text-center">
                          {subject.credits}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {hasChanged && (
                              <Badge
                                className={`${getGradeColor(original!.grade)}`}
                              >
                                {original!.grade}
                              </Badge>
                            )}
                            {hasChanged && <span>→</span>}
                            <Badge
                              className={`${getGradeColor(subject.grade)}`}
                            >
                              {subject.grade}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={isDummy ? "outline" : "secondary"}>
                            {isDummy ? "Dummy" : "Modified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSubject(subject.id)}
                          >
                            {isDummy ? "Remove" : "Reset"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={handleResetAll}>
                Reset All Changes
              </Button>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Original GPA: {originalGPA.toFixed(2)}
                </div>
                <div className="text-lg font-bold">
                  New GPA: {newGPA.toFixed(2)}
                  {gpaImprovement > 0 && (
                    <span className="ml-1 text-green-600">
                      (+{gpaImprovement.toFixed(2)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickGPATable;
