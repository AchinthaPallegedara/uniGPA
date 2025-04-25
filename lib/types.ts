export interface Subject {
  id: string;
  code: string;
  name: string;
  year: number;
  semester: number;
  credits: number;
  grade: string;
  order: number; // Added for drag and drop ordering
}
