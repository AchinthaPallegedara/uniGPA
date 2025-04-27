"use server";

import { db } from "@/db/drizzle";
import { subject } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Define subject schema for validation
const subjectSchema = z.object({
  code: z.string().min(7).max(8),
  name: z.string().min(2).max(50),
  year: z.coerce.number().int().positive(),
  semester: z.coerce.number().int().min(1).max(2),
  credits: z.coerce.number().int().positive(),
  grade: z.string(), // Changed from optional to required
});

// Helper function to get the current session
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export const addSubject = async (formData: FormData) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false };
    }

    const userId = session.user.id;

    // Validate the form data
    const validatedFields = subjectSchema.safeParse({
      code: formData.get("code"),
      name: formData.get("name"),
      year: formData.get("year"),
      semester: formData.get("semester"),
      credits: formData.get("credits"),
      grade: formData.get("grade") || "N/A", // Default to "N/A" if no grade provided
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { code, name, year, semester, credits, grade } = validatedFields.data;

    // Check if subject already exists for this user
    const existingSubjects = await db
      .select({ id: subject.id })
      .from(subject)
      .where(and(eq(subject.code, code), eq(subject.userId, userId)))
      .limit(1);

    if (existingSubjects.length > 0) {
      return { error: "Subject with this code already exists", success: false };
    }

    // Insert the new subject
    await db.insert(subject).values({
      id: uuidv4(),
      code,
      name,
      year,
      semester,
      credits,
      grade,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding subject:", error);
    return { error: "Failed to add subject", success: false };
  }
};

export const getSubjects = async () => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false, data: [] };
    }

    const userId = session.user.id;

    // Get all subjects for the user
    const subjects = await db
      .select()
      .from(subject)
      .where(eq(subject.userId, userId))
      .orderBy(subject.year, subject.semester, subject.createdAt);

    return { success: true, data: subjects };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return { error: "Failed to fetch subjects", success: false, data: [] };
  }
};

// Get the previous semesters' subjects (all except the last semester)
export const getPreviousSemestersSubjects = async () => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false, data: [] };
    }

    const userId = session.user.id;

    // First, get all subjects to determine the latest semester
    const allSubjects = await db
      .select()
      .from(subject)
      .where(eq(subject.userId, userId))
      .orderBy(subject.year, subject.semester);

    if (allSubjects.length === 0) {
      return { success: true, data: [] };
    }

    // Find the latest year and semester
    const latestSubject = allSubjects.reduce((latest, current) => {
      if (current.year > latest.year) return current;
      if (current.year === latest.year && current.semester > latest.semester)
        return current;
      return latest;
    }, allSubjects[0]);

    // Filter out subjects from the latest semester
    const previousSubjects = allSubjects.filter(
      (s) =>
        !(
          s.year === latestSubject.year && s.semester === latestSubject.semester
        )
    );

    return { success: true, data: previousSubjects };
  } catch (error) {
    console.error("Error fetching previous semester subjects:", error);
    return {
      error: "Failed to fetch previous semester subjects",
      success: false,
      data: [],
    };
  }
};

// Get just the last semester's subjects
export const getLastSemesterSubjects = async () => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false, data: [] };
    }

    const userId = session.user.id;

    // First, get all subjects to determine the latest semester
    const allSubjects = await db
      .select()
      .from(subject)
      .where(eq(subject.userId, userId))
      .orderBy(subject.year, subject.semester);

    if (allSubjects.length === 0) {
      return { success: true, data: [] };
    }

    // Find the latest year and semester
    const latestSubject = allSubjects.reduce((latest, current) => {
      if (current.year > latest.year) return current;
      if (current.year === latest.year && current.semester > latest.semester)
        return current;
      return latest;
    }, allSubjects[0]);

    // Filter to include only subjects from the latest semester
    const lastSemesterSubjects = allSubjects.filter(
      (s) =>
        s.year === latestSubject.year && s.semester === latestSubject.semester
    );

    return { success: true, data: lastSemesterSubjects };
  } catch (error) {
    console.error("Error fetching last semester subjects:", error);
    return {
      error: "Failed to fetch last semester subjects",
      success: false,
      data: [],
    };
  }
};

export const getSubjectById = async (id: string) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false, data: null };
    }

    const userId = session.user.id;

    // Get the subject by ID
    const results = await db
      .select()
      .from(subject)
      .where(and(eq(subject.id, id), eq(subject.userId, userId)))
      .limit(1);

    const subjectData = results[0];

    if (!subjectData) {
      return { error: "Subject not found", success: false, data: null };
    }

    return { success: true, data: subjectData };
  } catch (error) {
    console.error("Error fetching subject:", error);
    return { error: "Failed to fetch subject", success: false, data: null };
  }
};

export const deleteSubject = async (id: string) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false };
    }

    const userId = session.user.id;

    // Delete the subject
    await db
      .delete(subject)
      .where(and(eq(subject.id, id), eq(subject.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Error deleting subject:", error);
    return { error: "Failed to delete subject", success: false };
  }
};

export const deleteMultipleSubjects = async (ids: string[]) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false };
    }

    const userId = session.user.id;

    // Delete multiple subjects
    for (const id of ids) {
      await db
        .delete(subject)
        .where(and(eq(subject.id, id), eq(subject.userId, userId)));
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting subjects:", error);
    return { error: "Failed to delete subjects", success: false };
  }
};

export const updateSubject = async (id: string, formData: FormData) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false };
    }

    const userId = session.user.id;

    // Validate the form data
    const validatedFields = subjectSchema.safeParse({
      code: formData.get("code"),
      name: formData.get("name"),
      year: formData.get("year"),
      semester: formData.get("semester"),
      credits: formData.get("credits"),
      grade: formData.get("grade") || "N/A", // Default to "N/A" if no grade provided
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { code, name, year, semester, credits, grade } = validatedFields.data;

    // Update the subject
    await db
      .update(subject)
      .set({
        code,
        name,
        year,
        semester,
        credits,
        grade,
        updatedAt: new Date(),
      })
      .where(and(eq(subject.id, id), eq(subject.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Error updating subject:", error);
    return { error: "Failed to update subject", success: false };
  }
};

export const updateSubjectGrade = async (id: string, grade: string) => {
  try {
    // Get the current user session
    const session = await getSession();

    if (!session || !session.user) {
      return { error: "Unauthorized", success: false };
    }

    const userId = session.user.id;

    // Update just the grade field
    await db
      .update(subject)
      .set({
        grade, // Grade is now required
        updatedAt: new Date(),
      })
      .where(and(eq(subject.id, id), eq(subject.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Error updating subject grade:", error);
    return { error: "Failed to update subject grade", success: false };
  }
};
