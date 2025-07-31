"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentProfileSchema, type AgentProfile } from "@/types/agent-profile";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveAgentProfile } from "@/app/onboarding/agent-profile/actions";
import { useUser } from "@clerk/nextjs";

interface AgentProfileFormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleSkip: () => void;
  handleProjectSkip: () => void; // New method for skipping project steps
  handleSubmit: (data: AgentProfile) => Promise<void>;
  goToFirstSection: () => void;
  totalSteps: number;
}

const AgentProfileFormContext =
  createContext<AgentProfileFormContextType | null>(null);

const TOTAL_STEPS = 4;
const FORM_STORAGE_KEY = "agent-profile-form";

export function AgentProfileFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [storedData, setStoredData] = useLocalStorage<Partial<AgentProfile>>(
    FORM_STORAGE_KEY,
    {}
  );
  const router = useRouter();
  const previousValueRef = useRef<string>("");
  const { user } = useUser();

  const methods = useForm<AgentProfile>({
    resolver: zodResolver(AgentProfileSchema),
    defaultValues: {
      ...storedData,
    },
    mode: "onChange",
  });

  const {
    formState: { isValid, errors },
    watch,
    handleSubmit: handleFormSubmit,
    getValues,
    setValue,
  } = methods;

  // Watch form changes and persist to local storage
  useEffect(() => {
    const subscription = watch((value) => {
      const currentValueString = JSON.stringify(value);

      // Only update if the value has actually changed
      if (currentValueString !== previousValueRef.current) {
        previousValueRef.current = currentValueString;
        setStoredData(value as AgentProfile);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setStoredData]);

  // Helper function to validate URL
  const isValidUrl = (url: string) => {
    try {
      if (!url) return true; // Empty URL is valid (optional field)
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Watch all form values for real-time validation
  const watchedValues = watch();

  // Helper function to check if user has filled project data
  const hasProjectData = () => {
    const values = watchedValues;
    return Boolean(values.projects && values.projects.length > 0);
  };

  // Determine if user can proceed based on current step validation
  const canProceed = React.useMemo(() => {
    const values = watchedValues;

    switch (currentStep) {
      case 1: // AutomationExpertiseSection
        const skills = values.skills || [];
        const automationTools = values.automationTools || [];

        return Boolean(
          skills.length > 0 &&
            automationTools.length > 0 &&
            !errors.skills &&
            !errors.automationTools
        );

      case 2: // ProjectsSection - Validate if proceeding, allow skip
        const projects = values.projects || [];

        // If no projects, user must skip (can't proceed)
        if (projects.length === 0) {
          return false;
        }

        // If has projects, validate each project has required fields
        for (const project of projects) {
          if (!project.title?.trim()) return false;
          if (!project.description?.trim()) return false;
          if (!project.technologies || project.technologies.length === 0)
            return false;
          // Require at least one image (either File objects or URLs)
          const hasImages =
            (project.images && project.images.length > 0) ||
            (project.imageUrls && project.imageUrls.length > 0);
          if (!hasImages) return false;
        }

        return true;

      case 3: // BusinessDetailsSection - All fields required except website
        const {
          pricingModel,
          availability,
          teamSize,
          workType,
          projectSizePreference,
        } = values;

        return Boolean(
          pricingModel?.trim() &&
            availability?.trim() &&
            teamSize?.trim() &&
            workType?.trim() &&
            projectSizePreference &&
            projectSizePreference.length > 0 &&
            !errors.pricingModel &&
            !errors.availability &&
            !errors.teamSize &&
            !errors.workType &&
            !errors.projectSizePreference
        );

      case 4: // ConclusionSection
        return true;

      default:
        return true;
    }
  }, [currentStep, errors, watchedValues]);

  const isLastStep = currentStep === TOTAL_STEPS;

  const handleNext = () => {
    if (canProceed && currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else if (!canProceed) {
      // Provide specific feedback based on current step
      const values = watchedValues;

      switch (currentStep) {
        case 1: // AutomationExpertiseSection
          const skills = values.skills || [];
          const automationTools = values.automationTools || [];

          if (skills.length === 0) {
            toast.error(
              "Please select at least one automation service you provide"
            );
          } else if (automationTools.length === 0) {
            toast.error(
              "Please select at least one tool you have expertise in"
            );
          }
          break;

        case 2: // ProjectsSection
          const projects = values.projects || [];
          if (projects.length === 0) {
            toast.error("Please add at least one project to your profile.");
          } else {
            for (const project of projects) {
              if (!project.title?.trim()) {
                toast.error("Please add a title for your project.");
                break;
              }
              if (!project.description?.trim()) {
                toast.error("Please add a description for your project.");
                break;
              }
              if (!project.technologies || project.technologies.length === 0) {
                toast.error(
                  "Please add at least one technology for your project."
                );
                break;
              }
              if (
                !(
                  (project.images && project.images.length > 0) ||
                  (project.imageUrls && project.imageUrls.length > 0)
                )
              ) {
                toast.error("Please add at least one image for your project.");
                break;
              }
            }
          }
          break;

        case 3: // BusinessDetailsSection
          const {
            pricingModel,
            availability,
            teamSize,
            workType,
            projectSizePreference,
          } = values;

          if (!pricingModel?.trim()) {
            toast.error("Please select your pricing model");
          } else if (!availability?.trim()) {
            toast.error("Please select your availability");
          } else if (!teamSize?.trim()) {
            toast.error("Please select your team size");
          } else if (!workType?.trim()) {
            toast.error("Please select your work type");
          } else if (
            !projectSizePreference ||
            projectSizePreference.length === 0
          ) {
            toast.error("Please select at least one project size preference");
          }
          break;
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      // Special logic for going back from Conclusion (step 4)
      if (currentStep === 4) {
        if (hasProjectData()) {
          // User has project data, go back to BusinessDetails (step 3)
          setCurrentStep(3);
        } else {
          // User skipped project, go back to ProjectsSection (step 2)
          setCurrentStep(2);
        }
      } else {
        // Normal previous navigation for other steps
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleProjectSkip = () => {
    // Clear all project-related fields
    setValue("projects", [], { shouldValidate: false });

    // Skip to BusinessDetails section (step 3)
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const goToFirstSection = () => {
    router.push("/onboarding");
  };

  const handleSubmit = async (data: AgentProfile) => {
    try {
      setIsSubmitting(true);

      // Convert form data to FormData for server action
      const formData = new FormData();
      console.log("Creating FormData object");

      // Add skills and expertise
      console.log("Processing skills and expertise...");
      if (data.skills && data.skills.length > 0) {
        console.log("Adding skills:", data.skills);
        data.skills.forEach((skill) => formData.append("skills", skill));
      }

      if (data.automationTools && data.automationTools.length > 0) {
        console.log("Adding automation tools:", data.automationTools);
        data.automationTools.forEach((tool) =>
          formData.append("automationTools", tool)
        );
      }

      console.log("Adding expertise level:", data.expertiseLevel);

      formData.append("expertiseLevel", data.expertiseLevel || "");

      // Add business details
      console.log("Processing business details...");
      formData.append("pricingModel", data.pricingModel || "");
      formData.append("availability", data.availability || "");
      formData.append("teamSize", data.teamSize || "");
      formData.append("workType", data.workType || "");

      if (data.projectSizePreference && data.projectSizePreference.length > 0) {
        console.log(
          "Adding project size preferences:",
          data.projectSizePreference
        );
        data.projectSizePreference.forEach((size) =>
          formData.append("projectSizePreference", size)
        );
      }

      // Add projects
      if (data.projects && data.projects.length > 0) {
        console.log("Processing projects:", data.projects);
        formData.append("projects", JSON.stringify(data.projects));

        // Add project images if they exist
        data.projects.forEach((project, i) => {
          if (project.images && project.images.length > 0) {
            console.log(`Processing images for project ${i}:`, project.images);
            project.images.forEach((image, j) => {
              if (image instanceof File) {
                console.log(`Adding image ${j} for project ${i}:`, image.name);
                formData.append(`projectImages[${i}][${j}]`, image);
              }
            });
          }
        });
      }

      // Show loading toast
      toast.loading("Submitting your profile...");
      console.log(
        "FormData ready for submission:",
        Object.fromEntries(formData.entries())
      );

      // Submit form data to server action
      console.log("Calling saveAgentProfile");
      const result = await saveAgentProfile(formData);
      console.log("saveAgentProfile result:", result);

      // Handle response
      if (result.success) {
        console.log("Form submission successful!");
        toast.success(result.message);

        // Clear form data from local storage
        localStorage.removeItem(FORM_STORAGE_KEY);
        console.log("Local storage cleared");

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        console.error("Form submission failed:", result.message);
        toast.error(
          result.message || "Failed to submit profile. Please try again."
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        "There was an error submitting your profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue = {
    currentStep,
    setCurrentStep,
    isLastStep,
    canProceed,
    isSubmitting,
    handleNext,
    handlePrev,
    handleSkip,
    handleProjectSkip,
    handleSubmit,
    goToFirstSection,
    totalSteps: TOTAL_STEPS,
  };

  return (
    <AgentProfileFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </AgentProfileFormContext.Provider>
  );
}

export function useAgentProfileForm() {
  const context = useContext(AgentProfileFormContext);
  if (!context) {
    throw new Error(
      "useAgentProfileForm must be used within an AgentProfileFormProvider"
    );
  }
  return context;
}

// Custom hook for form fields
export function useAgentProfileFormFields() {
  const methods = useFormContext<AgentProfile>();
  if (!methods) {
    throw new Error(
      "useAgentProfileFormFields must be used within a FormProvider"
    );
  }
  return methods;
}
