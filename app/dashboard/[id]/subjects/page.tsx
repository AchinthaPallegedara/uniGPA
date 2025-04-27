"use client";

import SubjectAddForm from "@/components/SubjectAddForm";
import { SubjectTable } from "@/components/SubjectTable";
import { Separator } from "@/components/ui/separator";
import { SubjectsProvider } from "@/components/SubjectsContext";

const SubjectsPage = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <SubjectsProvider>
          <SubjectAddForm />
          <Separator className="my-8" />
          <SubjectTable />
        </SubjectsProvider>
      </div>
    </div>
  );
};

export default SubjectsPage;
