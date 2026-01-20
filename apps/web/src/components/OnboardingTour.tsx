import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Joyride, { CallBackProps, STATUS, EVENTS, Step } from "react-joyride";
import { useSession } from "../hooks/useSession";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

interface OnboardingTourProps {
  editMode: boolean;
  spacesCount: number;
  categoriesCount: number;
  bookmarksCount: number;
  onStart?: () => void;
  manualRun?: boolean;
  onManualRunChange?: (run: boolean) => void;
  onStepChange?: (stepIndex: number) => void;
  currentStepIndex?: number;
}

export const OnboardingTour = ({ editMode, spacesCount, categoriesCount, bookmarksCount, onStart, manualRun, onManualRunChange, onStepChange, currentStepIndex }: OnboardingTourProps) => {
  const session = useSession();

  const queryClient = useQueryClient();

  const [run, setRun] = useState(false);

  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  const [stepIndex, setStepIndex] = useState(0);

  const startedRef = useRef(false);

  useEffect(() => {
    if (manualRun !== undefined) {
      setRun(manualRun);

      if (manualRun) {
        setStepIndex(0);
      }
    }
  }, [manualRun]);

  useEffect(() => {
    if (currentStepIndex !== undefined) {
      setStepIndex(currentStepIndex);
    }
  }, [currentStepIndex]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/auth/onboarding-complete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.warn("Failed to mark onboarding as completed:", error);
    }
  });

  useEffect(() => {
    console.log("[Tutorial] Auto-start check:", {
      hasData: !!session.data,
      isLoading: session.isLoading,
      onboardingCompleted: session.data?.onboardingCompleted,
      started: startedRef.current,
      run,
      manualRun
    });

    if (
      session.data &&
      !session.isLoading &&
      !session.data.onboardingCompleted &&
      !startedRef.current &&
      !run &&
      manualRun === undefined
    ) {
      console.log("[Tutorial] Auto-starting tutorial");

      startedRef.current = true;
      setRun(true);

      if (onStart) {
        onStart();
      }
    }
  }, [session.data, session.isLoading, run, onStart, manualRun]);

  useEffect(() => {
    document.querySelectorAll("[data-tour-active]").forEach((el) => {
      el.removeAttribute("data-tour-active");
    });

    if (activeTarget) {
      const target = document.querySelector(`[data-tour="${activeTarget}"]`);

      if (target) {
        target.setAttribute("data-tour-active", "true");
      }
    }
  }, [activeTarget]);

  useEffect(() => {
    return () => {
      document.querySelectorAll("[data-tour-active]").forEach((el) => {
        el.removeAttribute("data-tour-active");
      });
    };
  }, []);

  const buildSteps = (): Step[] => {
    const steps: Step[] = [];
    steps.push({
      target: '[data-tour="edit-toggle"]',
      content: "Click 'Edit' to enable edit mode. This allows you to create spaces, categories, and bookmarks.",
      disableBeacon: true,
      placement: "bottom",
      disableOverlayClose: true
    });

      if (editMode) {
        steps.push({
          target: '[data-tour="add-space"]',
          content: "Click 'Add Space' to create your first space. Spaces help organize your bookmarks (e.g., 'Private' & 'Work').",
          disableBeacon: true,
          placement: "bottom",
          disableOverlayClose: true
        });

      steps.push({
        target: '[data-tour="space-modal"]',
        content: "Enter a name for your space. Optionally, you can upload a logo. Then click 'Save' to create the space.",
        disableBeacon: true,
        placement: "top",
        disableOverlayClose: true
      });

        if (spacesCount > 0) {
          steps.push({
            target: '[data-tour="new-category"]',
            content: "Now create a category to better organize your bookmarks. Click 'New Category'.",
            disableBeacon: true,
            placement: "top",
            disableOverlayClose: true
          });

          steps.push({
            target: '[data-tour="category-modal"]',
            content: "Enter a name for your category. Optionally, you can upload a logo. Then click 'Save' to create the category.",
            disableBeacon: true,
            placement: "top",
            disableOverlayClose: true
          });

          if (categoriesCount > 0) {
            steps.push({
              target: '[data-tour="add-bookmark"]',
              content: "Now add a bookmark to your category. Click 'Add bookmark' in the category you just created.",
              disableBeacon: true,
              placement: "top",
              disableOverlayClose: true
            });

            steps.push({
              target: '[data-tour="bookmark-modal"]',
              content: "Enter a title and URL for your bookmark. Then click 'Save' to add it.",
              disableBeacon: true,
              placement: "top",
              disableOverlayClose: true
            });
        }
      }
    }

    steps.push({
      target: "body",
      content: "Great! You've successfully created your first space, category, and bookmark. Let's explore the layout options next.",
      disableBeacon: true,
      placement: "center",
      disableOverlayClose: true
    });

    steps.push({
      target: '[data-tour="layout-controls"]',
      content: "Choose your layout: 'auto' adapts to screen size, 'vertical' stacks items, 'horizontal' arranges in a grid.",
      disableBeacon: true,
      placement: "bottom",
      disableOverlayClose: true
    });

    steps.push({
      target: '[data-tour="item-size-controls"]',
      content: "Adjust item size: 'small', 'medium', or 'large' to control how big your bookmarks and categories appear.",
      disableBeacon: true,
      placement: "bottom",
      disableOverlayClose: true
    });

    steps.push({
      target: '[data-tour="fitbox-controls"]',
      content: "FitBox mode: 'Auto' uses standard grid spacing, 'Fit' creates a compact masonry layout with less vertical gaps.",
      disableBeacon: true,
      placement: "bottom",
      disableOverlayClose: true
    });

    steps.push({
      target: "body",
      content: "Perfect! You're all set. You can restart this tutorial anytime from the menu.",
      disableBeacon: true,
      placement: "center"
    });

    return steps;
  };

  const steps = useMemo(() => {
    const builtSteps = buildSteps();

    console.log("[Tutorial] Steps rebuilt:", {
      editMode,
      spacesCount,
      categoriesCount,
      bookmarksCount,
      stepCount: builtSteps.length,
      steps: builtSteps.map((s, i) => {
        const content = typeof s.content === 'string' ? s.content : '';
        return {
          index: i,
          target: s.target,
          content: content.substring(0, 40) + "...",
          isSuccessMessage: content.includes("Great! You've successfully created")
        };
      })
    });

    return builtSteps;
  }, [editMode, spacesCount, categoriesCount, bookmarksCount]);

  const successMessageStepIndex = useMemo(() => {
    return steps.findIndex(s => {
      const content = typeof s.content === 'string' ? s.content : '';
      return content.includes("Great! You've successfully created");
    });
  }, [steps]);

  const shouldShowNextButton = useMemo(() => {
    if (successMessageStepIndex === -1) {
      return false;
    }

    return stepIndex >= successMessageStepIndex;
  }, [stepIndex, successMessageStepIndex]);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { status, type, step, index, action } = data;
      const stepContent = typeof step?.content === 'string' ? step.content : '';
      console.log("[Tutorial Callback]", {
        type,
        status,
        action,
        stepIndex: index,
        target: step?.target,
        content: stepContent.substring(0, 50) + "..."
      });

      const successStepIndex = steps.findIndex(s => {
        const content = typeof s.content === 'string' ? s.content : '';
        return content.includes("Great! You've successfully created");
      });

      if (action === "next" && index < successStepIndex && type === EVENTS.STEP_AFTER) {
        console.log("[Tutorial] Blocking Next button for interactive step", index);

        if (onStepChange) {
          onStepChange(index);
        }

        return;
      }

      if ((action === "next" || action === "close") && index >= successStepIndex && (type === EVENTS.STEP_AFTER || type === EVENTS.TOOLTIP)) {
        console.log("[Tutorial] Next/Close button clicked for step", index, "advancing to", index + 1);

        if (onStepChange) {
          onStepChange(index + 1);
        }

        return;
      }

      if (type === EVENTS.TARGET_NOT_FOUND) {
        console.log("[Tutorial] Target not found, retrying...", step?.target, "current step:", index);

        if (step?.target === '[data-tour="space-modal"]') {
          console.log("[Tutorial] Space modal closed, skipping to next step");

          if (onStepChange) {
            setTimeout(() => {
              const nextStepIndex = steps.findIndex((s, i) => i > index && s.target !== '[data-tour="space-modal"]');

              if (nextStepIndex !== -1) {
                onStepChange(nextStepIndex);
              } else {
                onStepChange(index + 1);
              }
            }, 100);
          }

          return;
        }

        if (step?.target === '[data-tour="category-modal"]') {
          console.log("[Tutorial] Category modal closed, skipping to next step");

          if (onStepChange) {
            setTimeout(() => {
              const nextStepIndex = steps.findIndex((s, i) => i > index && s.target !== '[data-tour="category-modal"]');

              if (nextStepIndex !== -1) {
                onStepChange(nextStepIndex);
              } else {
                onStepChange(index + 1);
              }
            }, 100);
          }

          return;
        }

        if (step?.target === '[data-tour="bookmark-modal"]') {
          console.log("[Tutorial] Bookmark modal closed, skipping to next step");

          if (onStepChange) {
            setTimeout(() => {
              const nextStepIndex = steps.findIndex((s, i) => i > index && s.target !== '[data-tour="bookmark-modal"]');

              if (nextStepIndex !== -1) {
                onStepChange(nextStepIndex);
              } else {
                onStepChange(index + 1);
              }
            }, 100);
          }

          return;
        }

        if (step?.target) {
          setTimeout(() => {
            const target = document.querySelector(step.target as string);

            console.log("[Tutorial] Retry target lookup:", step.target, "found:", !!target);

            if (target && onStepChange) {
              onStepChange(index);
            }
          }, 300);
        }

        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        if (step?.target) {
          const targetAttr = document.querySelector(step.target as string)?.getAttribute("data-tour");

          setActiveTarget(targetAttr || null);
        }

        const successStepIndex = steps.findIndex(s => {
          const content = typeof s.content === 'string' ? s.content : '';
          return content.includes("Great! You've successfully created");
        });

        if (action !== "next" || index >= successStepIndex) {
          setStepIndex(index);

          if (onStepChange) {
            onStepChange(index);
          }
        }
      } else if (type === EVENTS.STEP_BEFORE) {
        if (step?.target) {
          const targetAttr = document.querySelector(step.target as string)?.getAttribute("data-tour");

          setActiveTarget(targetAttr || null);
        }

        setStepIndex(index);

        if (onStepChange) {
          onStepChange(index);
        }
      } else if (type === EVENTS.TOUR_END || type === EVENTS.TOUR_START) {
        setActiveTarget(null);
      }

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        setRun(false);

        setActiveTarget(null);

        setStepIndex(0);

        if (onManualRunChange) {
          onManualRunChange(false);
        }

        if (onStepChange) {
          onStepChange(0);
        }

        if (!session.data?.onboardingCompleted) {
          completeMutation.mutate();
        }
      }
    },
    [completeMutation, session.data?.onboardingCompleted, onStepChange, onManualRunChange, steps]
  );

  if (!session.data || session.isLoading) {
    return null;
  }

  const isRunning = manualRun !== undefined ? manualRun : run;
  return (
    <Joyride
      steps={steps}

      run={isRunning}

      stepIndex={stepIndex}

      continuous={false}

      showProgress
      showSkipButton
      callback={handleCallback}

      disableOverlayClose
      hideBackButton={true}

      spotlightClicks={true}

      disableScrolling={false}

      disableOverlay={false}

      disableCloseOnEsc={true}

      styles={{
        options: {
          primaryColor: "#00E5FF",
          zIndex: 10000
        },
        tooltip: {
          borderRadius: "8px"
        },
        buttonNext: {
          backgroundColor: "#00E5FF",
          color: "#001018",
          borderRadius: "6px",
          padding: "8px 16px",
          display: shouldShowNextButton ? "inline-block" : "none",
          visibility: shouldShowNextButton ? "visible" : "hidden",
          opacity: shouldShowNextButton ? 1 : 0,
          pointerEvents: shouldShowNextButton ? "auto" : "none"
        },
        buttonBack: {
          color: "#A9B7C6",
          marginRight: "8px"
        },
        buttonSkip: {
          color: "#A9B7C6"
        },
        buttonClose: {
          display: shouldShowNextButton ? "inline-block" : "none",
          visibility: shouldShowNextButton ? "visible" : "hidden",
          opacity: shouldShowNextButton ? 1 : 0,
          pointerEvents: shouldShowNextButton ? "auto" : "none"
        }
      }}

      locale={{
        back: "Back",
        close: "Next",
        last: "Finish",
        next: "Next",
        skip: "Skip"
      }}

    />
  );
};

export const useOnboardingTour = () => {
  const [run, setRun] = useState(false);

  const startTour = useCallback(() => {
    setRun(true);
  }, []);

  return { run, setRun, startTour };
};
