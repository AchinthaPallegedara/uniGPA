// "use client";

// import { useState } from "react";
// import { AddSubjectForm } from "@/components/add-subject-form";
// import { SubjectList } from "@/components/subject-list";
// import { Subject } from "@/lib/types";

// // Sample initial data
// const initialSubjects: Subject[] = [
//   {
//     id: "1",
//     code: "NUR 1142",
//     name: "Nursing Fundamentals",
//     year: 1,
//     semester: 1,
//     credits: 4.2,
//     grade: "A",
//     order: 0,
//   },
//   {
//     id: "2",
//     code: "BIO 1130",
//     name: "Human Anatomy",
//     year: 1,
//     semester: 1,
//     credits: 3.0,
//     grade: "B+",
//     order: 1,
//   },
//   {
//     id: "3",
//     code: "CHM 1120",
//     name: "Biochemistry",
//     year: 1,
//     semester: 1,
//     credits: 2.0,
//     grade: "C",
//     order: 2,
//   },
//   {
//     id: "4",
//     code: "PSY 1210",
//     name: "Psychology",
//     year: 1,
//     semester: 2,
//     credits: 1.0,
//     grade: "A-",
//     order: 3,
//   },
//   {
//     id: "5",
//     code: "ENG 1220",
//     name: "English Composition",
//     year: 1,
//     semester: 2,
//     credits: 3.0,
//     grade: "B",
//     order: 4,
//   },
//   {
//     id: "6",
//     code: "MTH 2110",
//     name: "Statistics",
//     year: 2,
//     semester: 1,
//     credits: 3.0,
//     grade: "A",
//     order: 5,
//   },
//   {
//     id: "7",
//     code: "NUR 2140",
//     name: "Advanced Nursing",
//     year: 2,
//     semester: 1,
//     credits: 4.0,
//     grade: "B+",
//     order: 6,
//   },
// ];

// export default function SubjectsPage() {
//   const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);

//   const handleAddSubject = (newSubject: Subject) => {
//     setSubjects((prevSubjects) => [...prevSubjects, newSubject]);
//   };

//   const handleReorder = (reorderedSubjects: Subject[]) => {
//     setSubjects(reorderedSubjects);
//   };

//   return (
//     <div className="container py-8 space-y-8">
//       <h1 className="text-3xl font-bold">Subject Management</h1>

//       <AddSubjectForm onAddSubject={handleAddSubject} />

//       <div className="mt-8">
//         <h2 className="text-2xl font-bold mb-4">Your Subjects</h2>
//         <SubjectList subjects={subjects} onReorder={handleReorder} />
//       </div>
//     </div>
//   );
// }
