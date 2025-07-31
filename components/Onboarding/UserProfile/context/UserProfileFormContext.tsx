"use client";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveUserProfile } from "@/app/user-details/actions";
import { useUser } from "@clerk/nextjs";

// Define the schema to match our Sanity schema
const SocialLinkSchema = z.object({
  platform: z.string(),
  url: z.string(),
});

const UserProfileSchema = z.object({
  personalDetails: z.object({
    email: z.string().email(),
    username: z.string().min(1),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    profilePicture: z.any().optional(),
    bannerImage: z.any().optional(),
    socialLinks: z.array(SocialLinkSchema).optional(),
  }),
  coreIdentity: z.object({
    fullName: z.string().min(1),
    bio: z.string().min(1, "Bio is required"),
    tagline: z.string().min(1, "Tagline is required"),
  }),
  hasCompany: z.boolean(),
  company: z
    .object({
      name: z.string().min(1),
      bio: z.string().min(1, "Company bio is required"),
      website: z.string().url().optional(),
      tagline: z.string().min(1, "Company tagline is required"),
      teamSize: z.string().min(1, "Team size is required"),
      logo: z.any().optional(),
      banner: z.any().optional(),
    })
    .optional(),
});

type UserProfile = z.infer<typeof UserProfileSchema>;

interface UserProfileFormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLastStep: boolean;
  canProceed: boolean;
  isSubmitting: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleSkip: () => void;
  handleSubmit: (data: UserProfile) => Promise<void>;
  goToFirstSection: () => void;
  totalSteps: number;
}

const UserProfileFormContext = createContext<UserProfileFormContextType | null>(
  null
);

const TOTAL_STEPS = 6; // Personal Details, Core Identity, Company Details
const FORM_STORAGE_KEY = "user-profile-form";

export function UserProfileFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [storedData, setStoredData] = useLocalStorage<Partial<UserProfile>>(
    FORM_STORAGE_KEY,
    {}
  );
  const router = useRouter();
  const previousValueRef = useRef<string>("");
  const { user } = useUser();

  const methods = useForm<UserProfile>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      personalDetails: {
        email: user?.emailAddresses?.[0]?.emailAddress || "",
        username: user?.username || "",
        phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
        website: "",
        profilePicture: null,
        bannerImage: null,
        socialLinks: [],
      },
      coreIdentity: {
        fullName: "",
        bio: "",
        tagline: "",
      },
      hasCompany: false,
      company: {
        name: "",
        bio: "",
        website: "",
        tagline: "",
        teamSize: "",
        logo: null,
        banner: null,
      },
    },
    mode: "onChange",
  });

  const {
    formState: { isValid, errors },
    watch,
    handleSubmit: handleFormSubmit,
    getValues,
  } = methods;

  // Watch form changes and persist to local storage
  useEffect(() => {
    const subscription = watch((value) => {
      const currentValueString = JSON.stringify(value);
      if (currentValueString !== previousValueRef.current) {
        previousValueRef.current = currentValueString;
        setStoredData(value as UserProfile);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStoredData]);

  // Helper function to validate URL
  const isValidUrl = (url: string) => {
    try {
      if (!url) return true;
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Watch all form values for real-time validation
  const watchedValues = watch();

  // Determine if user can proceed based on current step validation
  const canProceed = React.useMemo(() => {
    const values = watchedValues;

    switch (currentStep) {
      case 1: // Personal Details (Contact Details)
        const { email, username, website, profilePicture, bannerImage } =
          values.personalDetails;
        if (website && !isValidUrl(website)) return false;

        // Require email, username, profile picture, and banner image
        return Boolean(
          email?.trim() &&
            username?.trim() &&
            profilePicture && // Must have profile picture
            bannerImage && // Must have banner image
            !errors.personalDetails?.email &&
            !errors.personalDetails?.username
        );

      case 2: // Core Identity
        const { fullName, bio, tagline } = values.coreIdentity;

        // Require all core identity fields to be filled
        return Boolean(
          fullName?.trim() &&
            bio?.trim() &&
            tagline?.trim() &&
            !errors.coreIdentity?.fullName &&
            !errors.coreIdentity?.bio &&
            !errors.coreIdentity?.tagline
        );

      case 3: // Company Details
        if (!values.hasCompany) return true;
        if (!values.company) return false;

        const {
          name,
          bio: companyBio,
          tagline: companyTagline,
          teamSize,
          website: companyWebsite,
        } = values.company;
        if (companyWebsite && !isValidUrl(companyWebsite)) return false;

        // When hasCompany is true, require all fields except website
        return Boolean(
          name?.trim() &&
            companyBio?.trim() &&
            companyTagline?.trim() &&
            teamSize?.trim() &&
            !errors.company?.name &&
            !errors.company?.bio &&
            !errors.company?.tagline &&
            !errors.company?.teamSize
        );

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
      const values = getValues();

      switch (currentStep) {
        case 1: // Contact Details
          const { profilePicture, bannerImage, email, username } =
            values.personalDetails;
          if (!email?.trim() || !username?.trim()) {
            toast.error(
              "Please fill in all required fields (Email and Username)"
            );
          } else if (!profilePicture) {
            toast.error("Please upload a profile picture to continue");
          } else if (!bannerImage) {
            toast.error("Please upload a banner image to continue");
          }
          break;

        case 2: // Core Identity
          const { fullName, bio, tagline } = values.coreIdentity;
          if (!fullName?.trim()) {
            toast.error("Please enter your full name");
          } else if (!bio?.trim()) {
            toast.error("Please enter your bio");
          } else if (!tagline?.trim()) {
            toast.error("Please enter your tagline");
          }
          break;

        case 3: // Company Details
          if (values.hasCompany && values.company) {
            const {
              name,
              bio: companyBio,
              tagline: companyTagline,
              teamSize,
            } = values.company;
            if (!name?.trim()) {
              toast.error("Please enter your company name");
            } else if (!companyBio?.trim()) {
              toast.error("Please enter your company bio");
            } else if (!companyTagline?.trim()) {
              toast.error("Please enter your company tagline");
            } else if (!teamSize?.trim()) {
              toast.error("Please select your team size");
            }
          }
          break;
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToFirstSection = () => {
    router.push("/user-details");
  };

  const handleSubmit = async (data: UserProfile) => {
    try {
      setIsSubmitting(true);

      // Pre-submission validation for company details
      if (data.hasCompany) {
        if (!data.company) {
          toast.error("Please complete your company details");
          setIsSubmitting(false);
          return;
        }

        const { name, bio, tagline, teamSize } = data.company;

        if (!name?.trim()) {
          toast.error("Please enter your company name");
          setIsSubmitting(false);
          return;
        }
        if (!bio?.trim()) {
          toast.error("Please enter your company bio");
          setIsSubmitting(false);
          return;
        }
        if (!tagline?.trim()) {
          toast.error("Please enter your company tagline");
          setIsSubmitting(false);
          return;
        }
        if (!teamSize?.trim()) {
          toast.error("Please select your team size");
          setIsSubmitting(false);
          return;
        }
      }

      const formData = new FormData();

      // Personal Details
      formData.append("email", data.personalDetails.email.trim());
      formData.append("username", data.personalDetails.username.trim());
      formData.append("phone", data.personalDetails.phone?.trim() || "");
      formData.append("website", data.personalDetails.website || "");
      formData.append(
        "socialLinks",
        JSON.stringify(data.personalDetails.socialLinks || [])
      );

      // Core Identity
      formData.append("fullName", data.coreIdentity.fullName.trim());
      formData.append("bio", data.coreIdentity.bio?.trim() || "");
      formData.append("tagline", data.coreIdentity.tagline?.trim() || "");

      // Has Company flag
      formData.append("hasCompany", String(data.hasCompany));

      // Company Details (if hasCompany is true)
      if (data.hasCompany && data.company) {
        formData.append("company.name", data.company.name.trim());
        formData.append("company.bio", data.company.bio?.trim() || "");
        formData.append("company.website", data.company.website || "");
        formData.append("company.tagline", data.company.tagline?.trim() || "");
        formData.append("company.teamSize", data.company.teamSize || "");
        if (data.company?.logo instanceof File) {
          formData.append("company.logo", data.company.logo);
        }
        if (data.company?.banner instanceof File) {
          formData.append("company.banner", data.company.banner);
        }
      }

      // Profile Images
      if (data.personalDetails.profilePicture instanceof File) {
        formData.append("profilePicture", data.personalDetails.profilePicture);
      }
      if (data.personalDetails.bannerImage instanceof File) {
        formData.append("bannerImage", data.personalDetails.bannerImage);
      }

      toast.loading("Submitting your profile...");
      const result = await saveUserProfile(formData);

      if (result.success) {
        toast.success(result.message);
        localStorage.removeItem(FORM_STORAGE_KEY);
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      } else {
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
    handleSubmit,
    goToFirstSection,
    totalSteps: TOTAL_STEPS,
  };

  return (
    <UserProfileFormContext.Provider value={contextValue}>
      <FormProvider {...methods}>{children}</FormProvider>
    </UserProfileFormContext.Provider>
  );
}

export function useUserProfileForm() {
  const context = useContext(UserProfileFormContext);
  if (!context) {
    throw new Error(
      "useUserProfileForm must be used within an UserProfileFormProvider"
    );
  }
  return context;
}

export function useUserProfileFormFields() {
  const methods = useFormContext<UserProfile>();
  if (!methods) {
    throw new Error(
      "useUserProfileFormFields must be used within a FormProvider"
    );
  }
  return methods;
}

export type { UserProfile };
