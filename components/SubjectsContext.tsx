"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getSubjects } from "@/lib/actions/subject.action";
import { toast } from "sonner";

// Types
export type Subject = {
  id: string;
  code: string;
  name: string;
  year: number;
  semester: number;
  credits: number;
  grade: string | null;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type SubjectsContextType = {
  subjects: Subject[];
  loading: boolean;
  refreshSubjects: () => Promise<void>;
  addLocalSubject: (subject: Subject) => void;
};

// Create a default context value
const defaultContextValue: SubjectsContextType = {
  subjects: [],
  loading: true,
  refreshSubjects: async () => {},
  addLocalSubject: () => {},
};

const SubjectsContext = createContext<SubjectsContextType>(defaultContextValue);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subjects from database
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const result = await getSubjects();
      if (result.success && result.data) {
        setSubjects(result.data);
      } else {
        toast(result.error || "Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast("Something went wrong when fetching subjects");
    } finally {
      setLoading(false);
    }
  };

  // Add a new subject to the local state without refetching from the server
  const addLocalSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <SubjectsContext.Provider
      value={{
        subjects,
        loading,
        refreshSubjects: fetchSubjects,
        addLocalSubject,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (!context) {
    throw new Error("useSubjects must be used within a SubjectsProvider");
  }
  return context;
}
