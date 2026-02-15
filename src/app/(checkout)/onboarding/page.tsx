"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ArrowLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CLUBS, PLANS, Club, Plan } from "@/data/constants";
import { fetchPublicPlans } from "@/lib/api";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

// Helper: Capitalize first letter of each word
const capitalizeWords = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Phone country codes - Complete list
const PHONE_PREFIXES = [
  { code: "+39", country: "IT" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+34", country: "ES" },
  { code: "+41", country: "CH" },
  { code: "+43", country: "AT" },
  { code: "+32", country: "BE" },
  { code: "+31", country: "NL" },
  { code: "+351", country: "PT" },
  { code: "+30", country: "GR" },
  { code: "+48", country: "PL" },
  { code: "+420", country: "CZ" },
  { code: "+421", country: "SK" },
  { code: "+36", country: "HU" },
  { code: "+40", country: "RO" },
  { code: "+359", country: "BG" },
  { code: "+385", country: "HR" },
  { code: "+386", country: "SI" },
  { code: "+381", country: "RS" },
  { code: "+387", country: "BA" },
  { code: "+355", country: "AL" },
  { code: "+389", country: "MK" },
  { code: "+382", country: "ME" },
  { code: "+383", country: "XK" },
  { code: "+45", country: "DK" },
  { code: "+46", country: "SE" },
  { code: "+47", country: "NO" },
  { code: "+358", country: "FI" },
  { code: "+354", country: "IS" },
  { code: "+353", country: "IE" },
  { code: "+352", country: "LU" },
  { code: "+377", country: "MC" },
  { code: "+378", country: "SM" },
  { code: "+379", country: "VA" },
  { code: "+376", country: "AD" },
  { code: "+350", country: "GI" },
  { code: "+356", country: "MT" },
  { code: "+357", country: "CY" },
  { code: "+370", country: "LT" },
  { code: "+371", country: "LV" },
  { code: "+372", country: "EE" },
  { code: "+375", country: "BY" },
  { code: "+380", country: "UA" },
  { code: "+373", country: "MD" },
  { code: "+7", country: "RU" },
  { code: "+90", country: "TR" },
  { code: "+972", country: "IL" },
  { code: "+971", country: "AE" },
  { code: "+966", country: "SA" },
  { code: "+974", country: "QA" },
  { code: "+965", country: "KW" },
  { code: "+973", country: "BH" },
  { code: "+968", country: "OM" },
  { code: "+962", country: "JO" },
  { code: "+961", country: "LB" },
  { code: "+20", country: "EG" },
  { code: "+212", country: "MA" },
  { code: "+216", country: "TN" },
  { code: "+213", country: "DZ" },
  { code: "+218", country: "LY" },
  { code: "+27", country: "ZA" },
  { code: "+234", country: "NG" },
  { code: "+254", country: "KE" },
  { code: "+91", country: "IN" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+82", country: "KR" },
  { code: "+852", country: "HK" },
  { code: "+65", country: "SG" },
  { code: "+60", country: "MY" },
  { code: "+66", country: "TH" },
  { code: "+84", country: "VN" },
  { code: "+62", country: "ID" },
  { code: "+63", country: "PH" },
  { code: "+61", country: "AU" },
  { code: "+64", country: "NZ" },
  { code: "+55", country: "BR" },
  { code: "+54", country: "AR" },
  { code: "+56", country: "CL" },
  { code: "+57", country: "CO" },
  { code: "+58", country: "VE" },
  { code: "+51", country: "PE" },
  { code: "+52", country: "MX" },
];

// Validation helpers
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone: string) => {
  const re = /^[0-9]{6,15}$/;
  return re.test(phone.replace(/\s/g, ""));
};

const validateFiscalCode = (cf: string) => {
  const re = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  return re.test(cf);
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};

// Animation variants - smoother transitions
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const stepContentVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.15,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as const
    }
  },
};

// Types
interface FormData {
  club: Club | null;
  plan: Plan | null;
  gender: "uomo" | "donna" | null;
  firstName: string;
  lastName: string;
  email: string;
  phonePrefix: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  fiscalCode: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  password: string;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [displayedStep, setDisplayedStep] = useState(1);
  const [stepOpacity, setStepOpacity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    club: null,
    plan: null,
    gender: null,
    firstName: "",
    lastName: "",
    email: "",
    phonePrefix: "+39",
    phone: "",
    birthDate: "",
    birthPlace: "",
    fiscalCode: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
    password: "",
  });
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [sidebarSections, setSidebarSections] = useState({
    riepilogo: true,
    dopoRinnovo: false,
  });
  const [mobileBarExpanded, setMobileBarExpanded] = useState(false);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date>(new Date());
  const [plans, setPlans] = useState<Plan[]>(PLANS); // Start with static data as fallback
  const [plansLoading, setPlansLoading] = useState(true);

  // Load plans from API - re-fetch when club changes to apply structure-specific promos
  useEffect(() => {
    async function loadPlans() {
      setPlansLoading(true);
      try {
        // Pass the selected club ID to get structure-specific promotions
        const apiPlans = await fetchPublicPlans(formData.club?.id);
        if (apiPlans.length > 0) {
          setPlans(apiPlans);
        }
      } catch (error) {
        console.error('Failed to load plans from API, using fallback:', error);
      } finally {
        setPlansLoading(false);
      }
    }
    loadPlans();
  }, [formData.club?.id]); // Re-fetch when club changes

  // Refs for progress bar calculation
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);
  const [progressBarHeight, setProgressBarHeight] = useState(0);
  const [grayBarHeight, setGrayBarHeight] = useState<string | number>('calc(100% - 32px)');
  const [isAnimating, setIsAnimating] = useState(true);
  const isTransitioningRef = useRef(false);
  const prevStepRef = useRef(currentStep);
  const calculateHeightRef = useRef<((force?: boolean) => void) | null>(null);

  // Check if step 3 form is complete
  const isStep3FormComplete = useCallback(() => {
    const birthDateParts = formData.birthDate?.split("-") || [];
    const isBirthDateValid = birthDateParts.length === 3 &&
      birthDateParts[0] !== "0000" && birthDateParts[0] !== "" &&
      birthDateParts[1] !== "00" && birthDateParts[1] !== "" &&
      birthDateParts[2] !== "00" && birthDateParts[2] !== "";

    return (
      formData.gender &&
      formData.firstName.length >= 2 &&
      formData.lastName.length >= 2 &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone) &&
      isBirthDateValid &&
      validateFiscalCode(formData.fiscalCode) &&
      validatePassword(formData.password)
    );
  }, [formData]);

  // Calculate progress bar height based on current step and selections
  const calculateProgressBarHeight = useCallback((forceCalculate = false) => {
    // Skip calculation during step transitions (unless forced)
    if (isTransitioningRef.current && !forceCalculate) {
      return;
    }

    if (!stepsContainerRef.current || !step1Ref.current || !step2Ref.current || !step3Ref.current) return;

    const containerRect = stepsContainerRef.current.getBoundingClientRect();
    const step2Rect = step2Ref.current.getBoundingClientRect();
    const step3Rect = step3Ref.current.getBoundingClientRect();

    // Calculate center Y position of each circle relative to container
    const step2CenterY = step2Rect.top + step2Rect.height / 2 - containerRect.top;
    const step3CenterY = step3Rect.top + step3Rect.height / 2 - containerRect.top;

    // Progress bar starts at step 1 center (top-4 = 16px offset in CSS)
    const barStartY = 16;

    let targetHeight = 0;

    if (currentStep === 1) {
      // Step 1: animate to step 2 when club is selected
      // Reset gray bar to default height for steps 1-2
      setGrayBarHeight('calc(100% - 32px)');
      if (formData.club) {
        targetHeight = step2CenterY - barStartY;
      } else {
        targetHeight = 0;
      }
    } else if (currentStep === 2) {
      // Step 2: animate to step 3 when plan is selected
      // Reset gray bar to default height for steps 1-2
      setGrayBarHeight('calc(100% - 32px)');
      if (formData.plan) {
        targetHeight = step3CenterY - barStartY;
      } else {
        targetHeight = step2CenterY - barStartY;
      }
    } else {
      // Step 3: bar reaches to step 3 circle, or checkmark if form complete
      if (checkmarkRef.current) {
        const checkmarkRect = checkmarkRef.current.getBoundingClientRect();
        const checkmarkCenterY = checkmarkRect.top + checkmarkRect.height / 2 - containerRect.top;
        const maxHeight = checkmarkCenterY - barStartY;
        setGrayBarHeight(maxHeight);

        if (isStep3FormComplete()) {
          targetHeight = maxHeight;
        } else {
          targetHeight = step3CenterY - barStartY;
        }
      } else {
        targetHeight = step3CenterY - barStartY;
      }
    }

    setProgressBarHeight(Math.max(0, targetHeight));
  }, [currentStep, formData.club, formData.plan, isStep3FormComplete]);

  // Keep ref updated with latest function
  calculateHeightRef.current = calculateProgressBarHeight;

  // Handle step transitions - block all calculations during transition, then recalculate ONCE
  // Smooth step transition effect
  useEffect(() => {
    const stepChanged = prevStepRef.current !== currentStep;
    prevStepRef.current = currentStep;

    if (stepChanged) {
      // Block all calculations and disable animation during transition
      isTransitioningRef.current = true;
      setIsAnimating(false);

      // Step 1: Fade out current content
      setStepOpacity(0);

      // Step 2: After fade out, switch displayed step and fade in
      const switchTimer = setTimeout(() => {
        setDisplayedStep(currentStep);
        // Small delay before fade in for smoothness
        setTimeout(() => {
          setStepOpacity(1);
        }, 50);
      }, 250); // Wait for fade out to complete

      // Step 3: After full transition, recalculate progress bar
      const recalcTimer = setTimeout(() => {
        isTransitioningRef.current = false;
        calculateHeightRef.current?.(true);
        setTimeout(() => setIsAnimating(true), 30);
      }, 550);

      return () => {
        clearTimeout(switchTimer);
        clearTimeout(recalcTimer);
      };
    }
  }, [currentStep]);

  // Handle selection changes within steps - animate progress bar
  useEffect(() => {
    if (!isTransitioningRef.current) {
      const timer = setTimeout(() => {
        calculateProgressBarHeight(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formData.club, formData.plan, calculateProgressBarHeight]);


  // Handle step 3 form completion - animate when form becomes complete
  useEffect(() => {
    if (currentStep === 3) {
      const timer = setTimeout(() => {
        calculateProgressBarHeight(true); // Force calculate
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, formData.gender, formData.firstName, formData.lastName, formData.email, formData.phone, formData.birthDate, formData.fiscalCode, formData.password, calculateProgressBarHeight]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => calculateProgressBarHeight(true);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateProgressBarHeight]);

  // Initial calculation on mount
  useEffect(() => {
    setIsAnimating(false);
    const timer = setTimeout(() => {
      calculateProgressBarHeight(true);
      setTimeout(() => setIsAnimating(true), 50);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll on mobile for steps 1-2
  useEffect(() => {
    const updateBodyScroll = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile && currentStep < 3) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    };

    updateBodyScroll();
    window.addEventListener('resize', updateBodyScroll);

    return () => {
      window.removeEventListener('resize', updateBodyScroll);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [currentStep]);

  const steps = [
    { number: 1, title: "IL TUO CLUB", desktopTitle: "Il tuo Club" },
    { number: 2, title: "ABBONAMENTO", desktopTitle: "Abbonamento" },
    { number: 3, title: "I TUOI DATI", desktopTitle: "Dati Personali" },
  ];

  const handleClubSelect = (club: Club) => {
    // If changing club, reset the plan selection (promos may differ)
    if (formData.club?.id !== club.id) {
      setFormData({ ...formData, club, plan: null });
    } else {
      setFormData({ ...formData, club });
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setFormData({ ...formData, plan });
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCheckout = async () => {
    if (!formData.club || !formData.plan) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club: {
            id: formData.club.id,
            name: formData.club.name,
          },
          plan: {
            id: formData.plan.id,
            name: formData.plan.name,
            price: formData.plan.promoActive && formData.plan.promoPrice != null
              ? formData.plan.promoPrice
              : formData.plan.price,
            originalPrice: formData.plan.price,
            activationFee: formData.plan.activationFee,
            promoActive: formData.plan.promoActive || false,
          },
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phonePrefix: formData.phonePrefix,
            phone: formData.phone,
            birthDate: formData.birthDate,
            birthPlace: formData.birthPlace,
            fiscalCode: formData.fiscalCode,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            province: formData.province,
            password: formData.password,
          },
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Errore durante il checkout. Riprova.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Errore durante il checkout. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.club !== null;
      case 2:
        return formData.plan !== null;
      case 3:
        // Validate birthDate is complete (YYYY-MM-DD format with valid values)
        const birthDateParts = formData.birthDate?.split("-") || [];
        const isBirthDateValid = birthDateParts.length === 3 &&
          birthDateParts[0] !== "0000" && birthDateParts[0] !== "" &&
          birthDateParts[1] !== "00" && birthDateParts[1] !== "" &&
          birthDateParts[2] !== "00" && birthDateParts[2] !== "";

        return (
          formData.gender &&
          formData.firstName.length >= 2 &&
          formData.lastName.length >= 2 &&
          validateEmail(formData.email) &&
          validatePhone(formData.phone) &&
          isBirthDateValid &&
          validateFiscalCode(formData.fiscalCode) &&
          validatePassword(formData.password)
        );
      default:
        return false;
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100 +
    (canProceed() ? (100 / (steps.length - 1)) * 0.5 : 0);

  return (
    <div className={`bg-gray-50/50 overflow-x-hidden ${
      currentStep < 3
        ? "lg:min-h-screen h-[100dvh] lg:h-auto overflow-hidden"
        : "min-h-screen"
    }`}>
      {/* Header - Mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Torna alla home</span>
          </Link>
        </div>
      </div>

      {/* Header - Desktop */}
      <div className="hidden lg:block sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
          <div className="max-w-[1400px] mx-auto py-4">
            {/* Header row with back button and logo */}
            <div className="relative flex items-center">
              {/* Back to home button */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Torna alla home</span>
              </Link>

              {/* Logo - Centered */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                <Image
                  src="/images/logo.svg"
                  alt="24FIT"
                  width={100}
                  height={24}
                  className="h-6 w-auto brightness-0"
                  priority
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className={`py-6 sm:py-8 px-0 lg:px-8 xl:px-12 2xl:px-20 ${
        currentStep < 3
          ? "lg:h-auto h-[calc(100dvh-160px)] lg:overflow-visible overflow-hidden"
          : ""
      }`}>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-16 max-w-[1400px] mx-auto">
          {/* Main Content */}
          <div className={`flex-1 order-2 lg:order-1 ${
            currentStep === 3 ? "lg:overflow-visible overflow-y-auto" : ""
          }`}>
            {/* Desktop: Minimal Progress Bar Layout */}
            <div className="hidden lg:block">
              {/* Steps container with progress line - excludes final circle */}
              <div className="relative" ref={stepsContainerRef}>
                {/* Vertical Progress Line - Background (gray) - ends at checkmark */}
                <div
                  className="absolute left-[12px] top-4 w-2 bg-gray-200 rounded-full transition-all duration-300"
                  style={{ height: typeof grayBarHeight === 'number' ? `${grayBarHeight}px` : grayBarHeight }}
                />
                {/* Vertical Progress Line - Active (yellow) - uses calculated height */}
                <motion.div
                  className="absolute left-[12px] top-4 w-2 bg-[var(--brand)] rounded-full"
                  initial={{ height: 0 }}
                  animate={{ height: progressBarHeight }}
                  transition={isAnimating ? {
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1], // Smooth ease-out
                    delay: 0.15 // Slight delay to sync with content
                  } : {
                    duration: 0
                  }}
                />

                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.number}>
                      {/* Step Header Row */}
                      <div className="flex items-center gap-4 relative z-10">
                        {/* Step Number Circle */}
                        <motion.div
                          ref={step.number === 1 ? step1Ref : step.number === 2 ? step2Ref : step3Ref}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ring-4 ring-white ${
                            step.number < currentStep
                              ? "bg-[var(--brand)] text-white cursor-pointer"
                              : step.number === currentStep
                              ? "bg-[var(--brand)] text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                          animate={{
                            scale: step.number === currentStep ? [1, 1.1, 1] : 1,
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          onClick={() => step.number < currentStep && goToStep(step.number)}
                        >
                          {step.number < currentStep ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                              <Check size={16} strokeWidth={3} />
                            </motion.div>
                          ) : (
                            step.number
                          )}
                        </motion.div>

                        {/* Step Title */}
                        <div className="flex-1 flex items-center justify-between">
                          <h2
                            className={`text-2xl font-black tracking-tight transition-colors ${
                              step.number <= currentStep ? "text-gray-900" : "text-gray-300"
                            } ${step.number < currentStep ? "cursor-pointer hover:text-[var(--brand)]" : ""}`}
                            style={{ fontWeight: 900 }}
                            onClick={() => step.number < currentStep && goToStep(step.number)}
                          >
                            {step.desktopTitle}
                          </h2>
                          {step.number < currentStep && (
                            <button
                              onClick={() => goToStep(step.number)}
                              className="flex items-center justify-center gap-3 min-w-[200px] px-7 py-3 rounded-xl text-lg font-bold cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200"
                              style={{ backgroundColor: '#ffcf02', color: '#ffffff' }}
                            >
                              <span>
                                {step.number === 1 && formData.club && formData.club.name.replace('24FIT ', '').replace('24fit ', '')}
                                {step.number === 2 && formData.plan && formData.plan.name}
                              </span>
                              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step Content - Only show for current step with smooth transition */}
                      {step.number === displayedStep && (
                        <div
                          className="mt-4 ml-12 pb-2"
                          style={{
                            opacity: stepOpacity,
                            transform: `translateY(${stepOpacity === 0 ? '-8px' : '0'})`,
                            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {step.number === 1 && (
                            <StepClub
                              clubs={CLUBS}
                              selectedClub={formData.club}
                              onSelect={handleClubSelect}
                            />
                          )}
                          {step.number === 2 && (
                            <StepPlan
                              plans={plans}
                              selectedPlan={formData.plan}
                              expandedPlan={expandedPlan}
                              setExpandedPlan={setExpandedPlan}
                              onSelect={handlePlanSelect}
                            />
                          )}
                          {step.number === 3 && (
                            <StepPersonalData
                              formData={formData}
                              setFormData={setFormData}
                              onSubmit={handleCheckout}
                              isLoading={isLoading}
                              showFinalCheckmark={true}
                              checkmarkRef={checkmarkRef}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Mobile: Single Step Layout */}
            <div className="lg:hidden">
              {/* Current Step Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm bg-[var(--brand)] text-white flex-shrink-0">
                    {currentStep}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 truncate">
                    {steps[currentStep - 1].title}
                  </h2>
                </div>
                {currentStep > 1 && (
                  <button
                    onClick={() => goToStep(currentStep - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors flex-shrink-0"
                  >
                    <ChevronDown size={14} className="rotate-90" />
                    <span className="hidden sm:inline">Indietro</span>
                  </button>
                )}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${currentStep}`}
                  variants={pageTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    opacity: { duration: 0.3 }
                  }}
                  className="px-4 sm:px-6"
                >
                  {currentStep === 1 && (
                    <StepClub
                      clubs={CLUBS}
                      selectedClub={formData.club}
                      onSelect={handleClubSelect}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepPlan
                      plans={plans}
                      selectedPlan={formData.plan}
                      expandedPlan={expandedPlan}
                      setExpandedPlan={setExpandedPlan}
                      onSelect={handlePlanSelect}
                    />
                  )}
                  {currentStep === 3 && (
                    <StepPersonalData
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleCheckout}
                      isLoading={isLoading}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
        </div>

        {/* Sidebar - Panoramica (Desktop only) */}
        <div className="hidden lg:block lg:w-[320px] xl:w-[360px] 2xl:w-[380px] order-1 lg:order-2 self-start flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl p-5 xl:p-6 pb-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-8 text-gray-900 tracking-tight">PANORAMICA</h3>

            {/* Club */}
            <div className="border-b border-gray-200 pb-5 mb-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span className="text-gray-600 text-sm">Club selezionato</span>
                </div>
                <div className="flex-shrink-0 text-right">
                  {formData.club ? (
                    <>
                      <p className="font-semibold text-gray-900">{formData.club.name}</p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="text-sm px-3 py-1 mt-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors cursor-pointer"
                      >
                        Modifica
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Plan */}
            <div className="border-b border-gray-200 pb-5 mb-5">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span className="text-gray-600 text-sm">Abbonamento</span>
                </div>
                <div className="flex-shrink-0 text-right">
                  {formData.plan ? (
                    <>
                      <p className="font-semibold text-gray-900">{formData.plan.name}</p>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-sm px-3 py-1 mt-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors cursor-pointer"
                      >
                        Modifica
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {formData.plan && (
              <>
                {/* Data di inizio */}
                <div className="pb-5 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-gray-900 tracking-tight">DATA DI INIZIO</span>
                    {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const selected = new Date(subscriptionStartDate);
                      selected.setHours(0, 0, 0, 0);
                      const diffDays = Math.round((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                      if (diffDays === 0) {
                        return <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Oggi</span>;
                      } else if (diffDays === 1) {
                        return <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Domani</span>;
                      } else if (diffDays === 2) {
                        return <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">Dopodomani</span>;
                      }
                      return null;
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Scegli quando iniziare il tuo abbonamento:
                  </p>
                  <input
                    type="date"
                    value={subscriptionStartDate.toISOString().split('T')[0]}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSubscriptionStartDate(new Date(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 outline-none transition-all text-sm font-medium"
                  />
                </div>

                {/* Riepilogo del Contratto */}
                <div className="pt-5 pb-5 border-b border-gray-200">
                  <button
                    onClick={() => setSidebarSections({ ...sidebarSections, riepilogo: !sidebarSections.riepilogo })}
                    className="w-full flex justify-between items-center py-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span className="font-black text-gray-900 tracking-tight">RIEPILOGO DEL CONTRATTO</span>
                    {sidebarSections.riepilogo ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>

                  <AnimatePresence>
                    {sidebarSections.riepilogo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.4, 0, 0.2, 1],
                          opacity: { duration: 0.25 }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 py-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Durata:</span>
                            <span className="font-semibold text-right">{formData.plan.duration} mesi</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Abbonamento:</span>
                            <span className="font-semibold text-right">
                              {formData.plan.price - formData.plan.activationFee}€
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Iscrizione:</span>
                            <span className="font-semibold text-right">
                              {formData.plan.activationFee}€
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rinnovo automatico:</span>
                            <span className="font-semibold text-right">
                              No
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Validità:</span>
                            {(() => {
                              const endDate = new Date(subscriptionStartDate);
                              endDate.setMonth(endDate.getMonth() + formData.plan.duration);
                              const formatDate = (d: Date) => d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm">
                                    {formatDate(subscriptionStartDate)}
                                  </span>
                                  <span className="text-gray-400 font-medium">-</span>
                                  <span className="font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm">
                                    {formatDate(endDate)}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* TOTALE */}
                <div className="flex justify-between items-center pt-5">
                  <span className="text-xl font-black text-gray-900 tracking-tight">TOTALE</span>
                  <div className="text-right">
                    {formData.plan.promoActive && formData.plan.promoPrice != null ? (
                      <>
                        <span className="text-lg text-gray-400/40 mr-2">
                          {formData.plan.price}€
                        </span>
                        <span className="text-3xl font-black text-green-600">
                          {formData.plan.promoPrice}€
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-gray-900">
                        {formData.plan.price}€
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* CTA Button */}
            <motion.button
              disabled={!canProceed() || isLoading}
              onClick={() => {
                if (currentStep < 3) {
                  nextStep();
                } else {
                  handleCheckout();
                }
              }}
              whileHover={canProceed() && !isLoading ? { scale: 1.02, y: -2 } : {}}
              whileTap={canProceed() && !isLoading ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-xl font-bold transition-all mt-6 text-lg bg-[var(--brand)] text-white hover:bg-[var(--brand)]/90 shadow-lg shadow-[var(--brand)]/20 ${
                canProceed() && !isLoading
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Elaborazione...
                </span>
              ) : currentStep === 3 ? (
                "Concludi e paga"
              ) : (
                "Continua"
              )}
            </motion.button>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        {/* Mobile Bottom Sheet Popup */}
        <AnimatePresence>
          {mobileBarExpanded && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setMobileBarExpanded(false)}
              />
              {/* Bottom Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    setMobileBarExpanded(false);
                  }
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 max-h-[85vh] overflow-hidden flex flex-col"
              >
                {/* Handle - Drag area */}
                <div className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing">
                  <div className="w-14 h-1.5 bg-gray-400 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">RIEPILOGO</h3>
                  <button
                    onClick={() => setMobileBarExpanded(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
                  {/* Club */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Club selezionato</span>
                      <p className="font-semibold text-gray-900 mt-0.5">
                        {formData.club ? formData.club.name : "-"}
                      </p>
                    </div>
                    {formData.club && (
                      <button
                        onClick={() => { setCurrentStep(1); setMobileBarExpanded(false); }}
                        className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium"
                      >
                        Modifica
                      </button>
                    )}
                  </div>

                  {/* Plan */}
                  <div>
                    <span className="text-sm text-gray-500">Abbonamento selezionato</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="font-semibold text-gray-900">
                        {formData.plan ? formData.plan.name : "-"}
                      </p>
                      {formData.plan && (
                        <button
                          onClick={() => { setCurrentStep(2); setMobileBarExpanded(false); }}
                          className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium"
                        >
                          Modifica
                        </button>
                      )}
                    </div>
                  </div>

                  {formData.plan && (
                    <>
                      {/* Start Date */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">Data di inizio</span>
                          {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selected = new Date(subscriptionStartDate);
                            selected.setHours(0, 0, 0, 0);
                            const diffDays = Math.round((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            if (diffDays === 0) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">Oggi</span>;
                            if (diffDays === 1) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Domani</span>;
                            if (diffDays === 2) return <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">Dopodomani</span>;
                            return null;
                          })()}
                        </div>
                        <input
                          type="date"
                          value={subscriptionStartDate.toISOString().split('T')[0]}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSubscriptionStartDate(new Date(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium"
                        />
                      </div>

                      {/* Contract Details */}
                      <div className="pt-3 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Validità:</span>
                          {(() => {
                            const endDate = new Date(subscriptionStartDate);
                            endDate.setMonth(endDate.getMonth() + formData.plan.duration);
                            const formatDate = (d: Date) => d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                  {formatDate(subscriptionStartDate)}
                                </span>
                                <span className="text-gray-400">-</span>
                                <span className="font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">
                                  {formatDate(endDate)}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Abbonamento:</span>
                          <span className="font-semibold text-sm">
                            {formData.plan.price - formData.plan.activationFee}€
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Iscrizione:</span>
                          <span className="font-semibold text-sm">{formData.plan.activationFee}€</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-lg font-black text-gray-900">TOTALE</span>
                        <div className="text-right">
                          {formData.plan.promoActive && formData.plan.promoPrice != null ? (
                            <>
                              <span className="text-base text-gray-400/40 mr-2">
                                {formData.plan.price}€
                              </span>
                              <span className="text-2xl font-black text-green-600">
                                {formData.plan.promoPrice}€
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-black text-gray-900">
                              {formData.plan.price}€
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Close Button */}
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => setMobileBarExpanded(false)}
                    className="w-full py-3.5 rounded-xl font-bold bg-gray-900 text-white"
                  >
                    Chiudi
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="p-4">
          {/* Mobile Progress Bar */}
          <div className="mb-3">
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[var(--brand)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Compact info row */}
          <div
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => setMobileBarExpanded(!mobileBarExpanded)}
          >
            <div className="flex items-center gap-2">
              {formData.plan ? (
                <>
                  {formData.plan.promoActive && formData.plan.promoPrice != null ? (
                    <>
                      <span className="text-lg text-gray-400/40">
                        {formData.plan.price}€
                      </span>
                      <span className="text-2xl font-black text-green-600">
                        {formData.plan.promoPrice}€
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-gray-900">
                      {formData.plan.price}€
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-500">totale</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Seleziona un'opzione</span>
              )}
            </div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
              Dettagli <ChevronUp size={16} />
            </button>
          </div>

          {/* CTA Button */}
          <motion.button
            disabled={!canProceed() || isLoading}
            onClick={() => {
              if (currentStep < 3) {
                nextStep();
              } else {
                handleCheckout();
              }
            }}
            whileTap={canProceed() && !isLoading ? { scale: 0.98 } : {}}
            className={`w-full py-3.5 rounded-xl font-bold transition-all text-base bg-[var(--brand)] text-white ${
              canProceed() && !isLoading
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Elaborazione...
              </span>
            ) : currentStep === 3 ? (
              "Concludi e paga"
            ) : (
              "Continua"
            )}
          </motion.button>
        </div>
      </div>

      {/* Spacer for mobile sticky bar - only for step 3 which scrolls */}
      {currentStep === 3 && <div className="lg:hidden h-36" />}

      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} message="Stiamo preparando il pagamento..." />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: Club Selection
// ═══════════════════════════════════════════════════════════════

function StepClub({
  clubs,
  selectedClub,
  onSelect,
}: {
  clubs: Club[];
  selectedClub: Club | null;
  onSelect: (club: Club) => void;
}) {
  return (
    <div>
      <p className="text-gray-600 mb-4">
        In quale centro fitness vuoi allenarti?
      </p>

      <div className="space-y-3">
        {clubs.map((club) => {
          const isSelected = selectedClub?.id === club.id;
          return (
            <motion.div
              key={club.id}
              onClick={() => onSelect(club)}
              whileTap={{ scale: 0.99 }}
              className={`rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "shadow-xl scale-[1.02]"
                  : "shadow-md hover:shadow-lg hover:scale-[1.01]"
              }`}
              style={{
                background: isSelected ? "#ffcf02" : "#ffffff"
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-black text-sm mb-2 ${isSelected ? "text-white" : "text-[var(--brand)]"}`}>IL CENTRO CHE HAI SCELTO</p>
                  <div className={`border-t pt-3 ${isSelected ? "border-white/30" : "border-gray-100"}`}>
                    <p className={`font-black ${isSelected ? "text-white" : "text-gray-900"}`}>{club.name.toUpperCase()}</p>
                    <p className={`text-sm font-semibold ${isSelected ? "text-white/80" : "text-gray-500"}`}>{club.address}</p>
                    <p className={`text-sm font-semibold ${isSelected ? "text-white/80" : "text-gray-500"}`}>{club.city}</p>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? "bg-white shadow-lg"
                      : "bg-gray-200"
                  }`}
                >
                  {isSelected && (
                    <Check size={16} className="text-[var(--brand)]" strokeWidth={3} />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: Plan Selection
// ═══════════════════════════════════════════════════════════════

function StepPlan({
  plans,
  selectedPlan,
  expandedPlan,
  setExpandedPlan,
  onSelect,
}: {
  plans: Plan[];
  selectedPlan: Plan | null;
  expandedPlan: string | null;
  setExpandedPlan: (id: string | null) => void;
  onSelect: (plan: Plan) => void;
}) {
  return (
    <div>
      <div className="space-y-5">
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const isSelected = selectedPlan?.id === plan.id;

          // Stili condizionali:
          // - Selezionato: sfondo arancione, elementi bianchi
          // - Non selezionato + popolare: sfondo bianco, bordo arancione, elementi arancioni
          // - Non selezionato + normale: sfondo bianco, nessun bordo, elementi grigi

          return (
            <div
              key={plan.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "shadow-xl scale-[1.02]"
                  : "shadow-md hover:shadow-lg hover:scale-[1.01]"
              }`}
              onClick={() => onSelect(plan)}
              style={{
                background: isSelected ? "#ffcf02" : "#ffffff"
              }}
            >
              {/* Plan Header */}
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3
                        className={`font-black text-lg sm:text-xl tracking-tight ${
                          isSelected
                            ? "text-white"
                            : plan.popular
                            ? "text-[var(--brand)]"
                            : "text-gray-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      {(plan.promoActive && plan.promoText) ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white text-[var(--brand)]"
                            : "bg-[var(--brand)] text-white"
                        }`}>
                          {plan.promoText}
                        </span>
                      ) : plan.popular ? (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white text-[var(--brand)]"
                            : "bg-[var(--brand)] text-white"
                        }`}>
                          Popolare
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isSelected
                          ? "text-white/80"
                          : "text-gray-500"
                      }`}
                    >
                      {plan.pricePerMonth}€/mese + iscrizione
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="text-right">
                      {/* Show promo price if available */}
                      {plan.promoActive && plan.promoPrice != null ? (
                        <>
                          <span className={`text-lg mr-1 ${
                            isSelected ? "text-white/40" : "text-gray-400/30"
                          }`}>
                            {plan.price}€
                          </span>
                          <span
                            className={`text-2xl sm:text-3xl font-black whitespace-nowrap ${
                              isSelected
                                ? "text-white"
                                : plan.popular
                                ? "text-[var(--brand)]"
                                : "text-gray-900"
                            }`}
                          >
                            {plan.promoPrice}€
                          </span>
                        </>
                      ) : (
                        <span
                          className={`text-2xl sm:text-3xl font-black whitespace-nowrap ${
                            isSelected
                              ? "text-white"
                              : plan.popular
                              ? "text-[var(--brand)]"
                              : "text-gray-900"
                          }`}
                        >
                          {plan.price}€
                        </span>
                      )}
                      <p className={`text-xs font-semibold ${
                        isSelected
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}>
                        totale
                      </p>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-white shadow-lg"
                          : plan.popular
                          ? "bg-[var(--brand)]/20"
                          : "bg-gray-200"
                      }`}
                    >
                      {isSelected && (
                        <Check size={16} className="text-[var(--brand)]" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Features */}
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedPlan(isExpanded ? null : plan.id);
                  }}
                  className={`w-full px-6 py-3 flex items-center gap-2 text-sm font-semibold border-t transition-colors ${
                    isSelected
                      ? "text-white/80 hover:text-white border-white/20"
                      : "text-gray-500 hover:text-gray-900 border-gray-100"
                  }`}
                >
                  {isExpanded ? "Nascondi dettagli" : "Mostra dettagli"}
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                        opacity: { duration: 0.2 }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <ul className="flex flex-col gap-2">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-2 text-sm ${
                                isSelected
                                  ? "text-white/90"
                                  : plan.popular
                                  ? "text-[var(--brand)]/80"
                                  : "text-gray-600"
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-white/30"
                                  : plan.popular
                                  ? "bg-[var(--brand)]/20"
                                  : "bg-[var(--brand)]/20"
                              }`}>
                                <Check
                                  size={10}
                                  strokeWidth={3}
                                  className={
                                    isSelected
                                      ? "text-white"
                                      : plan.popular
                                      ? "text-[var(--brand)]"
                                      : "text-[var(--brand)]"
                                  }
                                />
                              </div>
                              <span className="text-xs">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: Personal Data Form - With Real-time Validation
// ═══════════════════════════════════════════════════════════════

// Input component with validation feedback
function ValidatedInput({
  type = "text",
  placeholder,
  value,
  onChange,
  validate,
  errorMessage,
  className = "",
  maxLength,
  nextField,
  autoAdvanceLength,
  ...props
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  className?: string;
  maxLength?: number;
  nextField?: string;
  autoAdvanceLength?: number;
  [key: string]: unknown;
}) {
  const [touched, setTouched] = useState(false);
  const [prevValue, setPrevValue] = useState("");
  const [hasAutoFocused, setHasAutoFocused] = useState(false);
  const isValid = !validate || !value || validate(value);
  const showError = touched && value && !isValid;
  const showSuccess = touched && value && isValid;

  // Auto-advance logic - only for autocomplete (multiple chars at once) or when autoAdvanceLength is reached
  useEffect(() => {
    if (!nextField || hasAutoFocused) return;

    const charsDiff = value.length - prevValue.length;

    // Case 1: Autocomplete detected (multiple chars added at once, e.g., browser autofill)
    const isAutocomplete = charsDiff > 1 && prevValue.length === 0;

    // Case 2: Field has autoAdvanceLength and reached that length
    const reachedAutoAdvance = autoAdvanceLength && value.length >= autoAdvanceLength;

    if (isAutocomplete || reachedAutoAdvance) {
      setHasAutoFocused(true);
      const nextElement = document.querySelector(`[name="${nextField}"]`) as HTMLInputElement;
      if (nextElement) {
        nextElement.focus();
      }
    }

    setPrevValue(value);
  }, [value, nextField, prevValue, hasAutoFocused, autoAdvanceLength]);

  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        maxLength={maxLength}
        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none
          ${showError
            ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : showSuccess
            ? "border-green-400 bg-green-50/30 focus:border-green-500 focus:ring-4 focus:ring-green-100"
            : "border-gray-200 bg-white hover:border-gray-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10"
          } ${className}`}
        {...props}
      />
      {/* Validation icon */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <AlertCircle size={20} className="text-red-500" />
          </motion.div>
        )}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <CheckCircle2 size={20} className="text-green-500" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Error message */}
      <AnimatePresence>
        {showError && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-xs mt-1.5 ml-1"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepPersonalData({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  showFinalCheckmark = false,
  checkmarkRef,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  showFinalCheckmark?: boolean;
  checkmarkRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [phonePrefixOpen, setPhonePrefixOpen] = useState(false);

  const handleChange = (field: keyof FormData, value: string | "uomo" | "donna") => {
    setFormData({ ...formData, [field]: value } as FormData);
  };

  return (
    <form autoComplete="on" onSubmit={(e) => e.preventDefault()}>
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      {/* Gender Selection */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
        {(["uomo", "donna"] as const).map((gender) => (
          <motion.label
            key={gender}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-3 cursor-pointer py-3 rounded-xl border-2 transition-all ${
              formData.gender === gender
                ? "border-[var(--brand)] bg-[var(--brand)]/5"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              formData.gender === gender ? "border-[var(--brand)]" : "border-gray-300"
            }`}>
              {formData.gender === gender && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2.5 h-2.5 rounded-full bg-[var(--brand)]"
                />
              )}
            </div>
            <input
              type="radio"
              name="gender"
              checked={formData.gender === gender}
              onChange={() => handleChange("gender", gender)}
              className="sr-only"
            />
            <span className="text-gray-700 font-medium capitalize">{gender}</span>
          </motion.label>
        ))}
      </motion.div>

      {/* Name Fields */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ValidatedInput
          placeholder="Nome"
          name="firstName"
          value={formData.firstName}
          onChange={(v) => handleChange("firstName", capitalizeWords(v))}
          validate={(v) => v.length >= 2}
          errorMessage="Inserisci un nome valido"
          autoComplete="given-name"
          nextField="lastName"
        />
        <ValidatedInput
          placeholder="Cognome"
          name="lastName"
          value={formData.lastName}
          onChange={(v) => handleChange("lastName", capitalizeWords(v))}
          validate={(v) => v.length >= 2}
          errorMessage="Inserisci un cognome valido"
          autoComplete="family-name"
          nextField="email"
        />
      </motion.div>

      {/* Email */}
      <motion.div variants={fadeInUp}>
        <ValidatedInput
          type="email"
          placeholder="E-mail"
          name="email"
          value={formData.email}
          onChange={(v) => handleChange("email", v)}
          validate={validateEmail}
          errorMessage="Inserisci un'email valida"
          autoComplete="email"
          nextField="phone"
        />
      </motion.div>

      {/* Phone */}
      <motion.div variants={fadeInUp} className="flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPhonePrefixOpen(!phonePrefixOpen)}
            className="w-20 sm:w-24 px-2 py-3.5 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 outline-none cursor-pointer text-center font-medium transition-all flex items-center justify-center gap-1"
          >
            <span>{formData.phonePrefix}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${phonePrefixOpen ? 'rotate-180' : ''}`} />
          </button>
          {phonePrefixOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPhonePrefixOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-32 max-h-60 overflow-y-auto bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50">
                {PHONE_PREFIXES.map((prefix) => (
                  <button
                    key={prefix.code}
                    type="button"
                    onClick={() => {
                      handleChange("phonePrefix", prefix.code);
                      setPhonePrefixOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors flex items-center justify-between ${
                      formData.phonePrefix === prefix.code ? 'bg-[var(--brand)]/10 font-semibold' : ''
                    }`}
                  >
                    <span>{prefix.code}</span>
                    <span className="text-gray-500 text-sm">{prefix.country}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex-1">
          <ValidatedInput
            type="tel"
            placeholder="Numero di telefono"
            name="phone"
            value={formData.phone}
            onChange={(v) => handleChange("phone", v)}
            validate={validatePhone}
            errorMessage="Inserisci un numero valido"
            autoComplete="tel-national"
            nextField="bday"
          />
        </div>
      </motion.div>

      {/* Birth Date & Place */}
      <motion.div variants={fadeInUp} className="flex gap-3">
        {/* Date */}
        <div className="w-[155px] flex-shrink-0">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Data di nascita
          </label>
          <input
            type="date"
            name="bday"
            autoComplete="bday"
            value={formData.birthDate || ""}
            onChange={(e) => {
              handleChange("birthDate", e.target.value);
              // Auto-advance al campo successivo (luogo di nascita)
              if (e.target.value) {
                const nextField = document.querySelector('[name="birthPlace"]') as HTMLInputElement;
                if (nextField) {
                  nextField.focus();
                }
              }
            }}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split("T")[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
            className="w-full px-3 py-[14px] border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10 outline-none transition-all"
          />
        </div>
        {/* Birth Place */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Luogo di nascita
          </label>
          <ValidatedInput
            placeholder="Città"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={(v) => handleChange("birthPlace", capitalizeWords(v))}
            nextField="fiscalCode"
          />
        </div>
      </motion.div>

      {/* Fiscal Code */}
      <motion.div variants={fadeInUp}>
        <ValidatedInput
          placeholder="Codice Fiscale"
          name="fiscalCode"
          value={formData.fiscalCode}
          onChange={(v) => handleChange("fiscalCode", v.toUpperCase())}
          validate={validateFiscalCode}
          errorMessage="Inserisci un codice fiscale valido (16 caratteri)"
          maxLength={16}
          className="uppercase"
          nextField="address"
        />
      </motion.div>

      {/* Address */}
      <motion.div variants={fadeInUp}>
        <ValidatedInput
          placeholder="Indirizzo"
          name="address"
          value={formData.address}
          onChange={(v) => handleChange("address", capitalizeWords(v))}
          autoComplete="street-address"
          nextField="city"
        />
      </motion.div>

      {/* City, CAP, Province */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2">
          <ValidatedInput
            placeholder="Città"
            name="city"
            value={formData.city}
            onChange={(v) => handleChange("city", capitalizeWords(v))}
            autoComplete="address-level2"
            nextField="postalCode"
          />
        </div>
        <ValidatedInput
          placeholder="CAP"
          name="postalCode"
          value={formData.postalCode}
          onChange={(v) => handleChange("postalCode", v)}
          maxLength={5}
          autoComplete="postal-code"
          nextField="province"
        />
        <ValidatedInput
          placeholder="Prov."
          name="province"
          value={formData.province}
          onChange={(v) => handleChange("province", v.toUpperCase())}
          maxLength={2}
          className="uppercase"
          autoComplete="address-level1"
          nextField="new-password"
        />
      </motion.div>

      {/* Password with Final Checkmark */}
      <motion.div variants={fadeInUp} className="relative">
        {/* Final Checkmark - aligned with center of password input field (ignoring label) */}
        {showFinalCheckmark && (
          <motion.div
            ref={checkmarkRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
            className="absolute -left-12 top-[48px] flex items-center"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ring-4 ring-white bg-[var(--brand)] text-white relative z-10">
              <Check size={16} strokeWidth={3} />
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold text-gray-700">
            Password account
          </label>
          <span className="text-xs text-gray-400">Min. 8 caratteri</span>
        </div>
        <ValidatedInput
          type="password"
          name="new-password"
          autoComplete="new-password"
          placeholder="Crea una password"
          value={formData.password || ""}
          onChange={(v) => handleChange("password", v)}
          validate={validatePassword}
          errorMessage="La password deve avere almeno 8 caratteri"
        />
        {/* Password strength indicator */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2"
          >
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    formData.password.length >= level * 3
                      ? formData.password.length >= 12
                        ? "bg-green-500"
                        : formData.password.length >= 8
                        ? "bg-yellow-500"
                        : "bg-red-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs mt-1 ${
              formData.password.length >= 12
                ? "text-green-600"
                : formData.password.length >= 8
                ? "text-yellow-600"
                : "text-gray-500"
            }`}>
              {formData.password.length >= 12
                ? "Password forte"
                : formData.password.length >= 8
                ? "Password accettabile"
                : `${8 - formData.password.length} caratteri rimanenti`}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
    </form>
  );
}
