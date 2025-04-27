"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useState } from "react";
import { toast } from "sonner";

import { addSubject } from "@/lib/actions/subject.action";
import { useSubjects } from "./SubjectsContext";
import { v4 as uuidv4 } from "uuid";

const formSchema = z.object({
  name: z
    .string({
      required_error: "Course unit name is required.",
    })
    .min(2, {
      message: "Course unit name must be at least 2 characters.",
    })
    .max(50, {
      message: "Course unit name must be at most 50 characters.",
    }),
  code: z
    .string({
      required_error: "Course code is required.",
    })
    .min(7, {
      message: "Course code must be at least 7 characters.",
    })
    .regex(/^[A-Z]{3} \d{4}$/, {
      message: "Course code must be in the format 'NUR 1234'.",
    })
    .max(8, {
      message: "Course code must be at most 8 characters.",
    }),
  grade: z.string({
    required_error: "Please select a grade.",
  }),
});

const grades = [
  { label: "A+", value: "A+" },
  { label: "A", value: "A" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B", value: "B" },
  { label: "B-", value: "B-" },
  { label: "C+", value: "C+" },
  { label: "C", value: "C" },
  { label: "C-", value: "C-" },
  { label: "D+", value: "D+" },
  { label: "D", value: "D" },
  { label: "E", value: "E" },
] as const;

const SubjectAddForm = () => {
  const [loading, setLoading] = useState(false);
  const { addLocalSubject } = useSubjects();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "NUR ",
      grade: "A",
    },
  });

  // Parse year, semester and credits from course code
  const parseCodeInfo = (code: string) => {
    // Format should be "XXX 1234" where first digit is year, second is semester, fourth is credits
    const regex = /^[A-Z]{3} (\d)(\d)\d(\d)$/;
    const match = code.match(regex);

    if (match) {
      const year = parseInt(match[1]);
      const semester = parseInt(match[2]);
      const credits = parseInt(match[3]);
      return { year, semester, credits };
    }

    return { year: 1, semester: 1, credits: 3 }; // Default values
  };

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Parse year, semester and credits from code
      const { year, semester, credits } = parseCodeInfo(values.code);

      // Create form data to send
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("code", values.code);
      formData.append("grade", values.grade);
      formData.append("year", year.toString());
      formData.append("semester", semester.toString());
      formData.append("credits", credits.toString());

      // Submit the form
      const result = await addSubject(formData);

      if (result.success) {
        toast("Subject added successfully");

        // Create a temporary subject object to add to the local state
        // This allows immediate UI update without refreshing
        const newSubject = {
          id: uuidv4(), // Generate a temporary ID - will be replaced by real one on next fetch
          code: values.code,
          name: values.name,
          year: year,
          semester: semester,
          credits: credits,
          grade: values.grade,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add the subject to the local state
        addLocalSubject(newSubject);

        // Reset form
        form.reset({
          name: "",
          code: "NUR ",
          grade: "A",
        });
      } else {
        toast(
          typeof result.error === "string"
            ? result.error
            : "Failed to add subject. Please check the form."
        );
      }
    } catch (error) {
      console.error("Failed to add subject:", error);
      toast("Something went wrong when adding the subject");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-1 w-[10%]">
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NUR 1232"
                      {...field}
                      disabled={loading}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs absolute" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 flex-1">
                  <FormLabel>Course Unit</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Anatomy II"
                      {...field}
                      disabled={loading}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs absolute" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem className="space-y-1 w-[10%]">
                  <FormLabel>Grade</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild disabled={loading}>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? grades.find(
                                (grade) => grade.value === field.value
                              )?.label
                            : "Select grade"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search grade..." />
                        <CommandList>
                          <CommandEmpty>No grade found.</CommandEmpty>
                          <CommandGroup>
                            {grades.map((grade) => (
                              <CommandItem
                                value={grade.label}
                                key={grade.value}
                                onSelect={() => {
                                  form.setValue("grade", grade.value);
                                }}
                              >
                                {grade.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    grade.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs absolute" />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-[10%]">
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Add
            </Button>
          </div>

          <div className="flex mt-1">
            <div className="w-[10%]">
              <p className="text-xs text-muted-foreground">Format: XXX 1234</p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubjectAddForm;
