import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../api/client";
import { Bookmark, Category, Settings, Space, VersionStatus } from "../types";
import { useUiStore } from "../store/ui";
import { useSession } from "../hooks/useSession";
import { OnboardingTour, useOnboardingTour } from "../components/OnboardingTour";

const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}

    </div>
  );
};

const DashboardPage = () => {
  const session = useSession();

  const editMode = useUiStore((s) => s.editMode);

  const setEditMode = useUiStore((s) => s.setEditMode);

  const search = useUiStore((s) => s.search);

  const setSearch = useUiStore((s) => s.setSearch);

  const commandPalette = useUiStore((s) => s.commandPalette);

  const setCommandPalette = useUiStore((s) => s.setCommandPalette);

  const layoutMode = useUiStore((s) => s.layoutMode);

  const itemSize = useUiStore((s) => s.itemSize);

  const fitBoxMode = useUiStore((s) => s.fitBoxMode);

  const setLayoutMode = useUiStore((s) => s.setLayoutMode);

  const setItemSize = useUiStore((s) => s.setItemSize);

  const setFitBoxMode = useUiStore((s) => s.setFitBoxMode);

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const [spaceName, setSpaceName] = useState("");

  const [spaceIcon, setSpaceIcon] = useState("🌐");

  const [spaceIconFile, setSpaceIconFile] = useState<File | null>(null);

  const [spaceIconUrl, setSpaceIconUrl] = useState<string | null>(null);

  const [spaceIconPath, setSpaceIconPath] = useState<string | null>(null);

  const [spaceHasUploadedIcon, setSpaceHasUploadedIcon] = useState(false);

  const [spaceHadUploadedIconInitially, setSpaceHadUploadedIconInitially] = useState(false);

  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);

  const [categoryModal, setCategoryModal] = useState(false);

  const [categoryName, setCategoryName] = useState("");

  const [categoryIcon, setCategoryIcon] = useState("📁");

  const [categoryIconUrl, setCategoryIconUrl] = useState<string | null>(null);

  const [categoryIconPath, setCategoryIconPath] = useState<string | null>(null);

  const [categoryIconFile, setCategoryIconFile] = useState<File | null>(null);

  const [categoryHasUploadedIcon, setCategoryHasUploadedIcon] = useState(false);

  const [categoryRows, setCategoryRows] = useState(1);

  const [categorySort, setCategorySort] = useState("custom");

  const [categorySpaceId, setCategorySpaceId] = useState<string | null>(null);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const [bookmarkModal, setBookmarkModal] = useState(false);

  const [bookmarkTitle, setBookmarkTitle] = useState("");

  const [bookmarkDesc, setBookmarkDesc] = useState("");

  const [bookmarkUrl, setBookmarkUrl] = useState("");

  const [bookmarkIcon, setBookmarkIcon] = useState("");

  const [bookmarkIconFile, setBookmarkIconFile] = useState<File | null>(null);

  const [bookmarkHasUploadedIcon, setBookmarkHasUploadedIcon] = useState(false);

  const [bookmarkHadUploadedIconInitially, setBookmarkHadUploadedIconInitially] = useState(false);

  const [bookmarkMethod, setBookmarkMethod] = useState<"same-tab" | "new-tab" | "iframe">("same-tab");

  const [bookmarkCategoryId, setBookmarkCategoryId] = useState<string | null>(null);

  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const [confirmText, setConfirmText] = useState("");

  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);

  const [bookmarkError, setBookmarkError] = useState<string>("");

  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { run: manualTourRun, setRun: setManualTourRun, startTour } = useOnboardingTour();

  const [tourStepIndex, setTourStepIndex] = useState(0);

  useEffect(() => {
    console.log("[Tutorial] tourStepIndex changed to:", tourStepIndex);
  }, [tourStepIndex]);

  useEffect(() => {
    if (editMode && tourStepIndex === 0 && (manualTourRun || (!session.data?.onboardingCompleted))) {
      console.log("[Tutorial] Edit mode activated, advancing to step 1");

      setTimeout(() => {
        setTourStepIndex(1);
      }, 200);
    }
  }, [editMode, tourStepIndex, manualTourRun, session.data?.onboardingCompleted]);

  useEffect(() => {
    if (showSpaceModal && tourStepIndex === 1 && (manualTourRun || (!session.data?.onboardingCompleted))) {
      console.log("[Tutorial] Space modal opened, advancing to step 2");

      setTimeout(() => {
        setTourStepIndex(2);
      }, 100);
    }
  }, [showSpaceModal, tourStepIndex, manualTourRun, session.data?.onboardingCompleted]);

  useEffect(() => {
    if (categoryModal && tourStepIndex === 3 && (manualTourRun || (!session.data?.onboardingCompleted))) {
      console.log("[Tutorial] Category modal opened, advancing to step 4");

      setTimeout(() => {
        setTourStepIndex(4);
      }, 100);
    }
  }, [categoryModal, tourStepIndex, manualTourRun, session.data?.onboardingCompleted]);

  useEffect(() => {
    if (bookmarkModal && tourStepIndex === 5 && (manualTourRun || (!session.data?.onboardingCompleted))) {
      console.log("[Tutorial] Bookmark modal opened, advancing to step 6");

      setTimeout(() => {
        setTourStepIndex(6);
      }, 100);
    }
  }, [bookmarkModal, tourStepIndex, manualTourRun, session.data?.onboardingCompleted]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const spacesQuery = useQuery({
    queryKey: ["spaces"],
    queryFn: async () => {
      const res = await api.get<{ spaces: Space[] }>("/api/spaces");

      return res.data.spaces;
    }
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<{ categories: Category[] }>("/api/categories");

      return res.data.categories;
    }
  });

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get<{ bookmarks: Bookmark[] }>("/api/bookmarks");

      return res.data.bookmarks;
    }
  });

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: Settings }>("/api/settings");

      return res.data.settings;
    }
  });

  const versionQuery = useQuery({
    queryKey: ["version"],
    queryFn: async () => {
      const res = await api.get<VersionStatus>("/api/version");

      return res.data;
    },
    refetchInterval: 1000 * 60 * 60 * 12, 
    refetchOnWindowFocus: false, 
    refetchOnMount: true, 
    refetchOnReconnect: true, 
    staleTime: 1000 * 60 * 60 * 12, 
    enabled: true, 
    gcTime: Infinity, 
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setLayoutMode(settingsQuery.data.layout.layoutMode);

      setItemSize(settingsQuery.data.layout.itemSize);

      if (settingsQuery.data.layout.fitBoxMode) {
        setFitBoxMode(settingsQuery.data.layout.fitBoxMode);
      }
    }
  }, [settingsQuery.data, setLayoutMode, setItemSize, setFitBoxMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        setCommandPalette(!commandPalette);
      }

      if (e.key === "Escape") {
        if (showSpaceModal) {
          setShowSpaceModal(false);

          setSpaceName("");

          setSpaceIcon("🌐");

          setSpaceIconFile(null);

          setSpaceIconUrl(null);

          setSpaceIconPath(null);

          setSpaceHasUploadedIcon(false);

          setEditingSpaceId(null);
        } else         if (categoryModal) {
          setCategoryModal(false);

          setCategoryName("");

          setCategoryIcon("📁");

          if (categoryIconUrl && categoryIconUrl.startsWith("blob:")) {
            URL.revokeObjectURL(categoryIconUrl);
          }

      setCategoryIconUrl(null);

      setCategoryIconPath(null);

      setCategoryIconFile(null);

      setCategoryHasUploadedIcon(false);

      setEditingCategoryId(null);
        } else if (bookmarkModal) {
          setBookmarkModal(false);

          setBookmarkTitle("");

          setBookmarkDesc("");

          setBookmarkUrl("");

          if (bookmarkIcon && bookmarkIcon.startsWith("blob:")) {
            URL.revokeObjectURL(bookmarkIcon);
          }

          setBookmarkIcon("");

          setBookmarkIconFile(null);

          setBookmarkHasUploadedIcon(false);

          setEditingBookmarkId(null);
        } else if (editMode) {
          setEditMode(false);
        }
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [commandPalette, setCommandPalette, showSpaceModal, categoryModal, bookmarkModal, editMode, setEditMode]);

  const createSpace = useMutation({
    mutationFn: async () => {
      const createRes = await api.post("/api/spaces", {
        name: spaceName,
        icon: spaceIcon 
      });

      const newSpace = createRes.data.space;
      let iconUrl = spaceIconUrl;
      let iconPath = spaceIconPath;
      if (spaceIconFile) {
        const formData = new FormData();

        formData.append("file", spaceIconFile);

        formData.append("spaceId", newSpace._id);

        formData.append("type", "space");

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
        await api.put(`/api/spaces/${newSpace._id}`, {
          iconUrl: iconUrl,
          iconPath: iconPath
        });
      }

      return { space: { ...newSpace, iconUrl, iconPath } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });

      console.log("[Tutorial] Space created successfully, current step:", tourStepIndex);

      if (tourStepIndex === 2 && (manualTourRun || (!session.data?.onboardingCompleted))) {
        console.log("[Tutorial] Space created, checking for New Category button...");

        const checkAndAdvance = () => {
          const target = document.querySelector('[data-tour="new-category"]');

          console.log("[Tutorial] Checking for new-category target, found:", !!target);

          if (target) {
            console.log("[Tutorial] New Category button found, advancing to step 3");

            setTourStepIndex(3);

            setTimeout(() => {
              setShowSpaceModal(false);

              setSpaceName("");

              setSpaceIcon("🌐");

              setSpaceIconFile(null);

              setSpaceIconUrl(null);

              setSpaceIconPath(null);

              setSpaceHasUploadedIcon(false);

              setSpaceHadUploadedIconInitially(false);
            }, 200);
          } else {
            let attempts = 0;
            const retry = setInterval(() => {
              attempts++;
              const target = document.querySelector('[data-tour="new-category"]');

              console.log("[Tutorial] Retry attempt", attempts, "for new-category, found:", !!target);

              if (target) {
                clearInterval(retry);

                console.log("[Tutorial] New Category button found on retry, advancing to step 3");

                setTourStepIndex(3);

                setTimeout(() => {
                  setShowSpaceModal(false);

                  setSpaceName("");

                  setSpaceIcon("🌐");

                  setSpaceIconFile(null);

                  setSpaceIconUrl(null);

                  setSpaceIconPath(null);

                  setSpaceHasUploadedIcon(false);

                  setSpaceHadUploadedIconInitially(false);
                }, 200);
              } else if (attempts >= 10) {
                console.log("[Tutorial] Max retries reached for new-category button");

                clearInterval(retry);

                setShowSpaceModal(false);

                setSpaceName("");

                setSpaceIcon("🌐");

                setSpaceIconFile(null);

                setSpaceIconUrl(null);

                setSpaceIconPath(null);

                setSpaceHasUploadedIcon(false);

                setSpaceHadUploadedIconInitially(false);
              }
            }, 200);
          }
        };

        setTimeout(checkAndAdvance, 200);
      } else {
        setShowSpaceModal(false);

        setSpaceName("");

        setSpaceIcon("🌐");

        setSpaceIconFile(null);

        setSpaceIconUrl(null);

        setSpaceIconPath(null);

        setSpaceHasUploadedIcon(false);

        setSpaceHadUploadedIconInitially(false);
      }
    }
  });

  const updateSpace = useMutation({
    mutationFn: async () => {
      let iconUrl = spaceIconUrl;
      let iconPath = spaceIconPath;
      if (spaceIconFile) {
        const formData = new FormData();

        formData.append("file", spaceIconFile);

        formData.append("spaceId", editingSpaceId || "");

        formData.append("type", "space");

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
      }

      const payload: any = {
        name: spaceName,
        icon: spaceIcon 
      };

      if (!spaceIconUrl && !spaceIconFile && spaceHadUploadedIconInitially) {
        console.log("[Space Update] Icon removal detected (had icon initially, now removed)");

        payload.iconUrl = null;
        payload.iconPath = null;
      } else if (iconUrl || iconPath) {
        payload.iconUrl = iconUrl || undefined;
        payload.iconPath = iconPath || undefined;
      } else if (spaceIconUrl && !spaceIconUrl.startsWith("blob:")) {
        payload.iconUrl = spaceIconUrl;
        payload.iconPath = spaceIconPath || undefined;
      }

      const res = await api.put(`/api/spaces/${editingSpaceId}`, payload);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });

      setShowSpaceModal(false);

      setEditingSpaceId(null);

      setSpaceName("");

      setSpaceIcon("🌐");

      setSpaceIconFile(null);

      setSpaceIconUrl(null);

      setSpaceIconPath(null);

      setSpaceHasUploadedIcon(false);

      setSpaceHadUploadedIconInitially(false);
    }
  });

  const deleteSpace = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/spaces/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });

      queryClient.invalidateQueries({ queryKey: ["categories"] });

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      if (activeSpaceId === id) setActiveSpaceId(null);
    }
  });

  const createCategory = useMutation({
    mutationFn: async () => {
      const createRes = await api.post("/api/categories", {
        name: categoryName,
        icon: categoryIcon, 
        numRows: categoryRows,
        sortBy: categorySort,
        spaceId: categorySpaceId || activeSpaceId
      });

      const newCategory = createRes.data.category;
      let iconUrl = categoryIconUrl;
      let iconPath = categoryIconPath;
      if (categoryIconFile) {
        const formData = new FormData();

        formData.append("file", categoryIconFile);

        formData.append("spaceId", categorySpaceId || activeSpaceId || "");

        formData.append("categoryId", newCategory._id);

        formData.append("type", "category");

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
        await api.put(`/api/categories/${newCategory._id}`, {
          iconUrl: iconUrl,
          iconPath: iconPath
        });
      }

      return { category: { ...newCategory, iconUrl, iconPath } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      console.log("[Tutorial] Category created successfully, current step:", tourStepIndex);

      setCategoryModal(false);

      setCategoryName("");

      setCategoryIcon("📁");

      setCategoryIconUrl(null);

      setCategoryIconPath(null);

      setCategoryIconFile(null);

      setCategoryHasUploadedIcon(false);

      if (tourStepIndex === 4 && (manualTourRun || (!session.data?.onboardingCompleted))) {
        console.log("[Tutorial] Category created, checking for Add Bookmark button...");

        const checkAndAdvance = () => {
          const target = document.querySelector('[data-tour="add-bookmark"]');

          console.log("[Tutorial] Checking for add-bookmark target, found:", !!target);

          if (target) {
            console.log("[Tutorial] Add Bookmark button found, advancing to step 5");

            setTourStepIndex(5);
          } else {
            let attempts = 0;
            const retry = setInterval(() => {
              attempts++;
              const target = document.querySelector('[data-tour="add-bookmark"]');

              console.log("[Tutorial] Retry attempt", attempts, "for add-bookmark, found:", !!target);

              if (target) {
                clearInterval(retry);

                console.log("[Tutorial] Add Bookmark button found on retry, advancing to step 5");

                setTourStepIndex(5);
              } else if (attempts >= 10) {
                console.log("[Tutorial] Max retries reached for add-bookmark button");

                clearInterval(retry);
              }
            }, 200);
          }
        };

        setTimeout(checkAndAdvance, 300);
      }
    }
  });

  const updateCategory = useMutation({
    mutationFn: async () => {
      console.log("[Category Update] Starting update with state:", {
        categoryIconUrl,
        categoryIconPath,
        categoryIconFile: categoryIconFile ? "File present" : "No file",
        categoryHasUploadedIcon,
        editingCategoryId
      });

      let iconUrl = categoryIconUrl;
      let iconPath = categoryIconPath;
      if (categoryIconFile) {
        console.log("[Category Update] Uploading new icon file");

        const formData = new FormData();

        formData.append("file", categoryIconFile);

        formData.append("spaceId", categorySpaceId || activeSpaceId || "");

        formData.append("categoryId", editingCategoryId || "");

        formData.append("type", "category");

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
        console.log("[Category Update] Icon uploaded:", { iconUrl, iconPath });
      }

      const payload: any = {
        name: categoryName,
        icon: categoryIcon, 
        numRows: categoryRows,
        sortBy: categorySort,
        spaceId: categorySpaceId || activeSpaceId
      };

      const iconWasRemoved = categoryIconUrl === null && categoryIconPath === null && !categoryIconFile;
      const hasNewIcon = iconUrl || iconPath;
      const hasExistingIcon = categoryIconUrl && !categoryIconUrl.startsWith("blob:") && categoryIconPath !== null;
      console.log("[Category Update] Icon logic check:", {
        iconWasRemoved,
        hasNewIcon,
        hasExistingIcon,
        categoryIconUrl,
        categoryIconPath,
        categoryIconFile: !!categoryIconFile
      });

      if (iconWasRemoved) {
        console.log("[Category Update] Icon was removed - sending null");

        payload.iconUrl = null;
        payload.iconPath = null;
      } else if (hasNewIcon) {
        console.log("[Category Update] New icon uploaded - setting iconUrl/iconPath");

        payload.iconUrl = iconUrl || undefined;
        payload.iconPath = iconPath || undefined;
      } else if (hasExistingIcon) {
        console.log("[Category Update] Keeping existing icon");

        payload.iconUrl = categoryIconUrl;
        if (categoryIconPath) {
          payload.iconPath = categoryIconPath;
        }
      } else {
        console.log("[Category Update] No icon changes - leaving iconUrl/iconPath undefined");
      }

      console.log("[Category Update] Final payload:", JSON.stringify(payload, null, 2));

      const res = await api.put(`/api/categories/${editingCategoryId}`, payload);

      console.log("[Category Update] Response:", res.data);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      setCategoryModal(false);

      setEditingCategoryId(null);

      setCategoryIconUrl(null);

      setCategoryIconPath(null);

      setCategoryIconFile(null);
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });

  const createBookmark = useMutation({
    mutationFn: async () => {
      if (!bookmarkUrl || bookmarkUrl.trim() === "") {
        throw new Error("Please enter a valid URL");
      }

      try {
        new URL(bookmarkUrl);
      } catch {
        throw new Error("Please enter a valid URL (e.g., https://example.com)");
      }

      let iconUrl: string | undefined = bookmarkIcon || undefined;
      let iconPath: string | undefined;
      if (bookmarkIconFile) {
        if (!bookmarkCategoryId) {
          throw new Error("Please select a category first");
        }

        if (!activeSpaceId) {
          throw new Error("Please select a space first");
        }

        const formData = new FormData();

        formData.append("file", bookmarkIconFile);

        formData.append("spaceId", activeSpaceId);

        formData.append("categoryId", bookmarkCategoryId);

        formData.append("type", "bookmark");

        formData.append("bookmarkTitle", bookmarkTitle);

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
      }

      const payload: any = {
        title: bookmarkTitle,
        description: bookmarkDesc,
        serviceUrl: bookmarkUrl,
        openingMethod: bookmarkMethod,
        spaceId: activeSpaceId,
        categoryId: bookmarkCategoryId
      };

      if (iconUrl) {
        payload.iconUrl = iconUrl;
        payload.iconIsUploaded = true; 
      }

      if (iconPath) {
        payload.iconPath = iconPath;
        payload.iconIsUploaded = true; 
      }

      const res = await api.post("/api/bookmarks", payload);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      setBookmarkModal(false);

      setBookmarkTitle("");

      setBookmarkDesc("");

      setBookmarkUrl("");

      setBookmarkIcon("");

      setBookmarkIconFile(null);

      setBookmarkHasUploadedIcon(false);

      setBookmarkError("");

      console.log("[Tutorial] Bookmark created successfully, current step:", tourStepIndex);

      setBookmarkModal(false);

      setBookmarkTitle("");

      setBookmarkDesc("");

      setBookmarkUrl("");

      setBookmarkIcon("");

      setBookmarkIconFile(null);

      setBookmarkHasUploadedIcon(false);

      setEditingBookmarkId(null);

      if (tourStepIndex === 6 && (manualTourRun || (!session.data?.onboardingCompleted))) {
        console.log("[Tutorial] Advancing from step 6 to step 7 (Success Message)");

        setTimeout(() => {
          setTourStepIndex(7);
        }, 300);
      }
    },
    onError: (error: any) => {
      setBookmarkError(error.message || "Failed to create bookmark");
    }
  });

  const updateBookmark = useMutation({
    mutationFn: async () => {
      if (!bookmarkUrl || bookmarkUrl.trim() === "") {
        throw new Error("Please enter a valid URL");
      }

      try {
        new URL(bookmarkUrl);
      } catch {
        throw new Error("Please enter a valid URL (e.g., https://example.com)");
      }

      let iconUrl: string | undefined = bookmarkIcon || undefined;
      let iconPath: string | undefined;
      if (bookmarkIconFile) {
        const formData = new FormData();

        formData.append("file", bookmarkIconFile);

        formData.append("spaceId", activeSpaceId || "");

        formData.append("categoryId", bookmarkCategoryId || "");

        formData.append("type", "bookmark");

        formData.append("bookmarkTitle", bookmarkTitle);

        const uploadRes = await api.post<{ iconUrl: string; iconPath: string }>("/api/upload/icon", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        iconUrl = uploadRes.data.iconUrl;
        iconPath = uploadRes.data.iconPath;
      }

      const payload: any = {
        title: bookmarkTitle,
        description: bookmarkDesc,
        serviceUrl: bookmarkUrl,
        openingMethod: bookmarkMethod,
        spaceId: activeSpaceId,
        categoryId: bookmarkCategoryId
      };

      if (!bookmarkIcon && !bookmarkIconFile && bookmarkHadUploadedIconInitially) {
        console.log("[Bookmark Update] Icon removal detected (had icon initially, now removed)");

        payload.iconUrl = null;
        payload.iconPath = null;
        payload.iconIsUploaded = false;
      } else if (iconUrl || iconPath) {
        payload.iconUrl = iconUrl || undefined;
        payload.iconPath = iconPath || undefined;
        payload.iconIsUploaded = true;
      } else if (bookmarkIcon && !bookmarkIcon.startsWith("blob:")) {
        payload.iconUrl = bookmarkIcon;
        if (bookmarkHasUploadedIcon) {
          payload.iconIsUploaded = true;
        }
      }

      const res = await api.put(`/api/bookmarks/${editingBookmarkId}`, payload);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      setBookmarkModal(false);

      setEditingBookmarkId(null);

      setBookmarkIconFile(null);

      setBookmarkHasUploadedIcon(false);

      setBookmarkHadUploadedIconInitially(false);

      setBookmarkError("");
    },
    onError: (error: any) => {
      setBookmarkError(error.message || "Failed to update bookmark");
    }
  });

  const deleteBookmark = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/bookmarks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ entity, items }: { entity: string; items: { id: string; order: number }[] }) => {
      await api.post("/api/reorder", { entity, items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });

      queryClient.invalidateQueries({ queryKey: ["categories"] });

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });

  const filteredSpaces = spacesQuery.data || [];
  useEffect(() => {
    if (!activeSpaceId && filteredSpaces.length > 0) {
      setActiveSpaceId(filteredSpaces[0]._id);
    }
  }, [filteredSpaces, activeSpaceId]);

  const categoriesForSpace = useMemo(
    () => (categoriesQuery.data || []).filter((c) => c.spaceId === activeSpaceId).sort((a, b) => a.order - b.order),
    [categoriesQuery.data, activeSpaceId]
  );

  const bookmarksForSpace = useMemo(
    () => (bookmarksQuery.data || []).filter((b) => b.spaceId === activeSpaceId).sort((a, b) => a.order - b.order),
    [bookmarksQuery.data, activeSpaceId]
  );

  const filteredBookmarks = useMemo(() => {
    if (!search) return bookmarksForSpace;
    const q = search.toLowerCase();

    return bookmarksForSpace.filter((b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }, [bookmarksForSpace, search]);

  const effectiveLayout = useMemo(() => {
    if (layoutMode === "vertical") return "vertical";
    if (layoutMode === "horizontal") return "horizontal";
    return windowWidth >= 1024 ? "horizontal" : "vertical";
  }, [layoutMode, windowWidth]);

  const layoutClass = useMemo(() => {
    if (effectiveLayout === "vertical") {
      return "space-y-4";
    }

    if (fitBoxMode === "fit") {
      return "columns-1 md:columns-2 xl:columns-3 gap-4";
    }

    return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";
  }, [effectiveLayout, fitBoxMode]);

  const itemSizeClass =
    itemSize === "small" ? "text-sm" : itemSize === "large" ? "text-lg" : "text-base";
  const sizePadding = itemSize === "small" ? "p-3" : itemSize === "large" ? "p-6" : "p-4";
  const openBookmark = (b: Bookmark) => {
    if (b.openingMethod === "new-tab") {
      window.open(b.serviceUrl, "_blank");
    } else if (b.openingMethod === "iframe") {
      window.open(b.serviceUrl, "modal");
    } else {
      window.location.href = b.serviceUrl;
    }
  };

  const handleSpaceDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !spacesQuery.data) return;
    const current = spacesQuery.data;
    const oldIndex = current.findIndex((s) => s._id === active.id);

    const newIndex = current.findIndex((s) => s._id === over.id);

    const reordered = arrayMove(current, oldIndex, newIndex);

    const items = reordered.map((s, idx) => ({ id: s._id, order: idx }));

    reorderMutation.mutate({ entity: "space", items });
  };

  const handleCategoryDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id || categoriesForSpace.length === 0) return;
    const reordered = arrayMove(categoriesForSpace, categoriesForSpace.findIndex((c) => c._id === active.id), categoriesForSpace.findIndex((c) => c._id === over.id));

    const items = reordered.map((c, idx) => ({ id: c._id, order: idx }));

    reorderMutation.mutate({ entity: "category", items });
  };

  const handleBookmarkDragEnd = (categoryId: string) => (event: any) => {
    const { active, over } = event;
    const list = filteredBookmarks.filter((b) => b.categoryId === categoryId);

    if (!over || active.id === over.id || list.length === 0) return;
    const reordered = arrayMove(list, list.findIndex((b) => b._id === active.id), list.findIndex((b) => b._id === over.id));

    const items = reordered.map((b, idx) => ({ id: b._id, order: idx }));

    reorderMutation.mutate({ entity: "bookmark", items });
  };

  const commandItems = useMemo(() => {
    const actions = [
      { label: "Open account", action: () => navigate("/account") },
      { label: "Open settings", action: () => navigate("/settings") },
      { label: "Backup/Restore", action: () => navigate("/backup-restore") },
      { label: editMode ? "Disable edit mode" : "Enable edit mode", action: () => setEditMode(!editMode) }

    ];
    const bookmarkActions = bookmarksForSpace.map((b) => ({
      label: `Open ${b.title}`,
      action: () => openBookmark(b)
    }));

    return [...actions, ...bookmarkActions];
  }, [bookmarksForSpace, navigate, editMode, setEditMode]);

  const filteredCommands = commandItems.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-bd-bg text-bd-text" data-bd="background">
      <OnboardingTour
        editMode={editMode}

        spacesCount={filteredSpaces.length}

        categoriesCount={categoriesForSpace.length}

        bookmarksCount={filteredBookmarks.length}

        manualRun={manualTourRun}

        onManualRunChange={setManualTourRun}

        currentStepIndex={tourStepIndex}

        onStepChange={(stepIndex) => {
          console.log("[Tutorial] onStepChange called with stepIndex:", stepIndex);

          setTourStepIndex(stepIndex);
        }}

        onStart={() => {
          setMenuOpen(false);

          setTourStepIndex(0);
        }}

      />
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col flex-1 w-full">
        <div className="flex-1 space-y-4">
        <header className="flex items-center justify-between" data-bd="p1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2">
              <img src="/uploads/icons/banana.svg" alt="" className="w-5 h-5" />
              <span className="text-2xl font-bold text-bd-text">BananaDash</span>
            </div>
            <div className="bd-header-subtitle text-sm text-bd-text-muted max-[928px]:hidden">Spaces, categories, bookmarks in one place</div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              className="bg-bd-surface border border-bd-border px-4 py-2 rounded-lg text-sm text-bd-text placeholder:text-bd-text-faint focus:ring-2 focus:ring-bd-focus outline-none transition-colors"
              placeholder="Search or Ctrl+K"
              value={search}

              onChange={(e) => setSearch(e.target.value)}

            />
            <button
              data-tour="edit-toggle"
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${editMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-bd-accent text-[#001018] hover:bg-bd-accent-hover"}`}

              onClick={() => {
                console.log("[Tutorial] Edit button clicked, current step:", tourStepIndex, "editMode:", editMode);

                const newEditMode = !editMode;
                setEditMode(newEditMode);

                if (tourStepIndex === 0 && (manualTourRun || (!session.data?.onboardingCompleted))) {
                  console.log("[Tutorial] Advancing from step 0 to step 1 (Add Space Button)");

                  setTimeout(() => {
                    setTourStepIndex(1);
                  }, 100);
                }
              }}

            >
              Edit
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-bd-surface border border-bd-border text-bd-text hover:bg-bd-surface-2 transition-colors"
              onClick={() => {
                setMenuOpen(true);

                if (editMode) {
                  setEditMode(false);
                }
              }}

            >
              Menu
            </button>
          </div>
        </header>
        <div className="flex flex-wrap items-center gap-3 bg-bd-surface-2 rounded-xl p-4 border border-bd-border shadow-bd" data-bd="p2">
          <div className="flex items-center space-x-2" data-tour="layout-controls">
            <span className="text-sm text-bd-text-muted">Layout</span>
            {["auto", "vertical", "horizontal"].map((layout) => (
              <button
                key={layout}

                className={`px-3 py-2 rounded-lg text-sm transition-colors ${layoutMode === layout ? "bg-bd-accent-weak border border-bd-accent text-bd-text" : "bg-bd-surface border border-bd-border text-bd-text-muted hover:bg-bd-surface-2"}`}

                onClick={() => {
                  setLayoutMode(layout as any);

                  if (settingsQuery.data) {
                    api.put("/api/settings", {
                      ...settingsQuery.data,
                      layout: { ...settingsQuery.data.layout, layoutMode: layout }
                    }).then(() => queryClient.invalidateQueries({ queryKey: ["settings"] }));
                  }
                }}

              >
                {layout}

              </button>
            ))}

          </div>
          <div className="h-6 w-px bg-bd-border"></div>
          <div className="flex items-center space-x-2" data-tour="item-size-controls">
            <span className="text-sm text-bd-text-muted">Item size</span>
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}

                className={`px-3 py-2 rounded-lg text-sm transition-colors ${itemSize === size ? "bg-bd-accent-weak border border-bd-accent text-bd-text" : "bg-bd-surface border border-bd-border text-bd-text-muted hover:bg-bd-surface-2"}`}

                onClick={() => {
                  setItemSize(size as any);

                  if (settingsQuery.data) {
                    api.put("/api/settings", {
                      ...settingsQuery.data,
                      layout: { ...settingsQuery.data.layout, itemSize: size }
                    }).then(() => queryClient.invalidateQueries({ queryKey: ["settings"] }));
                  }
                }}

              >
                {size}

              </button>
            ))}

          </div>
          <div className="h-6 w-px bg-bd-border"></div>
          <div className="flex items-center space-x-2" data-tour="fitbox-controls">
            <span className="text-sm text-bd-text-muted">FitBox</span>
            {["auto", "fit"].map((mode) => (
              <button
                key={mode}

                className={`px-3 py-2 rounded-lg text-sm transition-colors ${fitBoxMode === mode ? "bg-bd-accent-weak border border-bd-accent text-bd-text" : "bg-bd-surface border border-bd-border text-bd-text-muted hover:bg-bd-surface-2"} ${effectiveLayout !== "horizontal" ? "opacity-50 cursor-not-allowed" : ""}`}

                disabled={effectiveLayout !== "horizontal"}

                onClick={() => {
                  if (effectiveLayout === "horizontal") {
                    setFitBoxMode(mode as any);

                    if (settingsQuery.data) {
                      api.put("/api/settings", {
                        ...settingsQuery.data,
                        layout: { ...settingsQuery.data.layout, fitBoxMode: mode }
                      }).then(() => queryClient.invalidateQueries({ queryKey: ["settings"] }));
                    }
                  }
                }}

              >
                {mode}

              </button>
            ))}

          </div>
          {versionQuery.data?.status === "outdated" && versionQuery.data?.updateInfo?.latestVersion && (
            <>
              <div className="h-6 w-px bg-bd-border"></div>
              <button
                className="text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-auto"
                onClick={() => {
                  if (versionQuery.data?.updateInfo?.updateLink) {
                    window.open(versionQuery.data.updateInfo.updateLink, "_blank", "noopener,noreferrer");
                  }
                }}

              >
                New Update: {versionQuery.data.updateInfo.latestVersion}

              </button>
            </>
          )}

        </div>
        <div className="bg-bd-surface rounded-xl p-4 space-y-3 border border-bd-border shadow-bd" data-bd="p3">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-bd-text">Spaces</div>
            {editMode && (
              <button
                data-tour="add-space"
                className="px-3 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors"
                onClick={() => {
                  console.log("[Tutorial] Add Space button clicked, current step:", tourStepIndex);

                  setEditingSpaceId(null);

                  setSpaceName("");

                      setSpaceIcon("");

                  setShowSpaceModal(true);

                  if (tourStepIndex === 1 && (manualTourRun || (!session.data?.onboardingCompleted))) {
                    console.log("[Tutorial] Advancing from step 1 to step 2 (Space Modal)");

                    setTimeout(() => {
                      setTourStepIndex(2);
                    }, 100);
                  }
                }}

              >
                Add Space
              </button>
            )}

          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSpaceDragEnd}>
            <SortableContext items={filteredSpaces.map((s) => s._id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filteredSpaces.map((space) => (
                  <SortableItem key={space._id} id={space._id}>
                    <button
                      className={`inline-flex items-center justify-center gap-2 w-fit px-4 py-2 rounded-lg transition-colors ${activeSpaceId === space._id ? "bg-bd-accent text-[#001018] hover:bg-bd-accent-hover" : "bg-bd-surface border border-bd-border text-bd-text hover:bg-bd-surface-2"}`}

                      onClick={() => setActiveSpaceId(space._id)}

                    >
                      {space.iconUrl ? (
                        <img src={space.iconUrl} alt="" className="w-5 h-5 shrink-0 object-contain" />
                      ) : space.icon ? (
                        <span className="shrink-0">{space.icon}</span>
                      ) : null}

                      <span className="shrink-0">{space.name}</span>
                      {editMode && (
                        <span className="text-xs text-bd-text-muted" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="mr-1"
                            onClick={() => {
                              setEditingSpaceId(space._id);

                              setSpaceName(space.name);

                              setSpaceIcon(space.icon);

                              setSpaceIconUrl(space.iconUrl || null);

                              setSpaceIconPath(space.iconPath || null);

                              const hadIcon = !!(space.iconUrl || space.iconPath);

                              setSpaceHasUploadedIcon(hadIcon);

                              setSpaceHadUploadedIconInitially(hadIcon); 

                              setSpaceIconFile(null);

                              setShowSpaceModal(true);
                            }}

                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmText("Delete this space and its content?");

                              setConfirmAction(() => () => deleteSpace.mutate(space._id));
                            }}

                          >
                            Delete
                          </button>
                        </span>
                      )}

                    </button>
                  </SortableItem>
                ))}

              </div>
            </SortableContext>
          </DndContext>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
          <SortableContext items={categoriesForSpace.map((c) => c._id)} strategy={verticalListSortingStrategy}>
            <div className={layoutClass} data-bd="p4">
              {categoriesForSpace.map((cat) => (
                <SortableItem key={cat._id} id={cat._id}>
                  <div className={`bg-bd-surface rounded-xl ${sizePadding} ${itemSizeClass} space-y-3 border border-bd-border shadow-bd ${fitBoxMode === "fit" && effectiveLayout === "horizontal" ? "break-inside-avoid w-full mb-4" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="shrink-0">
                    {cat.iconUrl || cat.iconPath ? (
                      <img src={cat.iconUrl || cat.iconPath} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <span>{cat.icon}</span>
                    )}

                  </div>
                  <div className="font-semibold text-bd-text max-w-[19ch] overflow-hidden text-ellipsis whitespace-nowrap">{cat.name}</div>
                </div>
                {editMode && (
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-sm px-2 py-1 bg-bd-surface-2 border border-bd-border text-bd-text rounded hover:bg-bd-surface transition-colors"
                      onClick={() => {
                        setEditingCategoryId(cat._id);

                        setCategoryName(cat.name);

                        setCategoryIcon(cat.icon);

                        setCategoryIconUrl(cat.iconUrl || null);

                        setCategoryIconPath(cat.iconPath || null);

                        setCategoryIconFile(null);

                        setCategoryHasUploadedIcon(!!(cat.iconPath || cat.iconUrl));

                        setCategoryRows(cat.numRows);

                        setCategorySort(cat.sortBy);

                        setCategorySpaceId(cat.spaceId);

                        setCategoryModal(true);
                      }}

                    >
                      Edit
                    </button>
                    <button
                      className="text-sm px-2 py-1 bg-bd-surface-2 border border-bd-border text-bd-text rounded hover:bg-bd-surface transition-colors"
                      onClick={() => {
                        setConfirmText("Delete this category and its bookmarks?");

                        setConfirmAction(() => () => deleteCategory.mutate(cat._id));
                      }}

                    >
                      Delete
                    </button>
                  </div>
                )}

              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBookmarkDragEnd(cat._id)}>
                <SortableContext items={filteredBookmarks.filter((b) => b.categoryId === cat._id).map((b) => b._id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBookmarks
                      .filter((b) => b.categoryId === cat._id)

                      .map((bookmark) => (
                        <SortableItem key={bookmark._id} id={bookmark._id}>
                          <div
                            className="bg-bd-surface-2 border border-bd-border rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-bd-surface transition-colors"
                            role="button"
                            tabIndex={0}

                            onClick={() => window.open(bookmark.serviceUrl, "_blank", "noopener,noreferrer")}

                            onKeyDown={(e) => e.key === "Enter" && window.open(bookmark.serviceUrl, "_blank", "noopener,noreferrer")}

                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              {(bookmark.iconUrl || bookmark.iconPath) && (
                                <img
                                  src={bookmark.iconUrl || bookmark.iconPath}

                                  alt=""
                                  className="w-8 h-8 rounded object-contain bg-bd-surface shrink-0"
                                />
                              )}

                              <div className="min-w-0">
                                <div className="font-semibold max-w-[19ch] overflow-hidden text-ellipsis whitespace-nowrap text-bd-text">{bookmark.title}</div>
                                <div className="text-sm text-bd-text-muted truncate">{bookmark.description}</div>
                              </div>
                            </div>
                            {editMode && (
                              <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  className="px-2 py-1 bg-bd-surface border border-bd-border text-bd-text rounded hover:bg-bd-surface-2 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setEditingBookmarkId(bookmark._id);

                                    setBookmarkTitle(bookmark.title);

                                    setBookmarkDesc(bookmark.description);

                                    setBookmarkUrl(bookmark.serviceUrl);

                                    setBookmarkIcon(bookmark.iconUrl || "");

                                    const hasUploadedIcon = bookmark.iconIsUploaded === true;
                                    console.log("[Bookmark Edit] Setting bookmarkHasUploadedIcon:", {
                                      iconPath: bookmark.iconPath,
                                      iconUrl: bookmark.iconUrl,
                                      iconIsUploaded: bookmark.iconIsUploaded,
                                      hasUploadedIcon
                                    });

                                    setBookmarkHasUploadedIcon(hasUploadedIcon);

                                    setBookmarkHadUploadedIconInitially(hasUploadedIcon); 

                                    setBookmarkMethod(bookmark.openingMethod);

                                    setBookmarkCategoryId(bookmark.categoryId);

                                    setBookmarkModal(true);

                                    setBookmarkError("");

                                    setBookmarkIconFile(null);
                                  }}

                                >
                                  Edit
                                </button>
                                <button
                                  className="px-2 py-1 bg-bd-surface border border-bd-border text-bd-text rounded hover:bg-bd-surface-2 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setConfirmText("Delete this bookmark?");

                                    setConfirmAction(() => () => deleteBookmark.mutate(bookmark._id));
                                  }}

                                >
                                  Delete
                                </button>
                              </div>
                            )}

                          </div>
                        </SortableItem>
                      ))}

                  </div>
                </SortableContext>
              </DndContext>
              {editMode && (
                <button
                  data-tour="add-bookmark"
                  className="w-full border border-dashed border-bd-border rounded-lg py-2 text-bd-text-muted hover:bg-bd-surface-2 transition-colors"
                  onClick={() => {
                    console.log("[Tutorial] Add Bookmark button clicked, current step:", tourStepIndex);

                    setEditingBookmarkId(null);

                    setBookmarkCategoryId(cat._id);

                    setBookmarkModal(true);

                    setBookmarkTitle("");

                    setBookmarkDesc("");

                    setBookmarkUrl("");

                    setBookmarkIcon("");

                    setBookmarkIconFile(null);

                    setBookmarkHasUploadedIcon(false);

                    setBookmarkHadUploadedIconInitially(false);

                    setBookmarkMethod("same-tab");

                    setBookmarkError("");

                    if (tourStepIndex === 5 && (manualTourRun || (!session.data?.onboardingCompleted))) {
                      console.log("[Tutorial] Advancing from step 5 to step 6 (Bookmark Modal)");

                      setTimeout(() => {
                        setTourStepIndex(6);
                      }, 100);
                    }
                  }}

                >
                  Add bookmark
                </button>
              )}

            </div>
                </SortableItem>
              ))}

            </div>
          </SortableContext>
        </DndContext>
        {editMode && filteredSpaces.length > 0 && (
          <div data-bd="p5">
            <button
              data-tour="new-category"
              className="mt-4 px-4 py-2 bg-bd-surface border border-bd-border text-bd-text rounded-lg hover:bg-bd-surface-2 transition-colors"
              onClick={() => {
                console.log("[Tutorial] New Category button clicked, current step:", tourStepIndex);

                setEditingCategoryId(null);

                setCategorySpaceId(activeSpaceId);

                setCategoryName("");

                setCategoryIcon("📁");

                setCategoryIconUrl(null);

                setCategoryIconPath(null);

                setCategoryIconFile(null);

                setCategoryHasUploadedIcon(false);

                setCategoryRows(1);

                setCategorySort("custom");

                setCategoryModal(true);

                if (tourStepIndex === 3 && (manualTourRun || (!session.data?.onboardingCompleted))) {
                  console.log("[Tutorial] Advancing from step 3 to step 4 (Category Modal)");

                  setTimeout(() => {
                    setTourStepIndex(4);
                  }, 100);
                }
              }}

            >
              New Category
            </button>
          </div>
        )}

        </div>
        <footer className="text-center text-bd-text-muted text-sm py-6 flex-shrink-0" data-bd="footer">
          BananaDash | ©Gerald Hasani 2026 | Github: <a className="underline text-bd-text hover:text-bd-accent transition-colors" href="https://github.com/Gerald-Ha/BananaDash" target="_blank" rel="noreferrer">GeraldHa</a>
        </footer>
      </div>
      {commandPalette && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center pt-20" onClick={() => setCommandPalette(false)}>
          <div className="bg-bd-surface border border-bd-border shadow-bd w-full max-w-xl rounded-xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-4 py-2 rounded-lg focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Type a command or bookmark"
              value={search}

              onChange={(e) => setSearch(e.target.value)}

            />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={idx}

                  className="w-full text-left bg-bd-surface-2 border border-bd-border text-bd-text hover:bg-bd-surface px-3 py-2 rounded-lg transition-colors"
                  onClick={() => {
                    cmd.action();

                    setCommandPalette(false);
                  }}

                >
                  {cmd.label}

                </button>
              ))}

            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-end" onClick={() => setMenuOpen(false)}>
          <div className="w-80 bg-bd-surface border-l border-bd-border h-full p-6 space-y-4 shadow-bd" onClick={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-bd-text">Menu</div>
            <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => navigate("/account")}>
              Account
            </button>
            <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => navigate("/settings")}>
              Themes
            </button>
            {session.data?.role === "admin" && (
              <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => navigate("/options")}>
                Account Management
              </button>
            )}

            <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => navigate("/backup-restore")}>
              Backup/Restore
            </button>
            <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => navigate("/app-info")}>
              App Info
            </button>
            <button className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors" onClick={() => {
              setMenuOpen(false);

              startTour();
            }}>
              Start Tutorial
            </button>
            <button
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg px-3 py-2 text-left hover:bg-bd-surface transition-colors"
              onClick={async () => {
                try {
                  await api.post("/api/auth/logout");

                  queryClient.clear();

                  navigate("/login", { replace: true });
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}

            >
              Logout
            </button>
            <div className="text-sm text-bd-text-muted space-y-1 mt-10 pt-4">
              {versionQuery.data ? (
                <>
                  <div>
                    BananaDash {versionQuery.data.installed}

                    {versionQuery.data.status === "up-to-date" ? (
                      <span className="ml-2">✅ Up to date</span>
                    ) : versionQuery.data.status === "unknown" ? (
                      <span className="ml-2">❓ Unknown</span>
                    ) : null}

                  </div>
                  {versionQuery.data.status === "outdated" && (
                    <div className="flex items-center gap-1">
                      <img src="/icons/update.svg" alt="Update" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).src = "/uploads/icons/update.svg"; }} />
                      <span>Outdated</span>
                    </div>
                  )}

                  {versionQuery.data.updateInfo?.latestVersion &&
                    versionQuery.data.updateInfo.latestVersion !== versionQuery.data.installed && (
                      <div className="text-xs">
                        Latest: {versionQuery.data.updateInfo.latestVersion}

                        {versionQuery.data.updateInfo.critical && (
                          <span className="ml-1 text-red-400">⚠️ Critical</span>
                        )}

                      </div>
                    )}

                  {versionQuery.data.updateInfo?.updateLink && versionQuery.data.status === "outdated" && (
                    <div className="mt-2">
                      <a
                        href={versionQuery.data.updateInfo.updateLink}

                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1.5 bg-bd-accent text-[#001018] rounded-lg text-xs font-semibold hover:bg-bd-accent-hover transition-colors"
                      >
                        Update Now
                      </a>
                    </div>
                  )}

                </>
              ) : (
                "Checking version..."
              )}

            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <Modal onClose={() => setConfirmAction(null)}>
          <div className="space-y-4">
            <div className="text-lg font-semibold text-bd-text">Confirm</div>
            <div className="text-bd-text-muted">{confirmText}</div>
            <div className="flex items-center justify-end space-x-2">
              <button className="px-4 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg hover:bg-bd-surface transition-colors" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-bd-danger text-white rounded-lg hover:opacity-90 transition-opacity"
                onClick={() => {
                  confirmAction();

                  setConfirmAction(null);
                }}

              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showSpaceModal && (
        <Modal onClose={() => setShowSpaceModal(false)}>
          <div data-tour="space-modal">
          <div className="space-y-4">
            <input 
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" 
              placeholder="Name" 
              value={spaceName} 

              onChange={(e) => setSpaceName(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingSpaceId) {
                    updateSpace.mutate();
                  } else {
                    createSpace.mutate();
                  }
                }
              }}

            />
            <div className="space-y-2">
              <label className="block text-sm text-bd-text-muted">Icon (upload image, default: 🌐)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSpaceIconFile(file);

                        setSpaceIconUrl(URL.createObjectURL(file));

                        setSpaceIconPath(null);

                        setSpaceHasUploadedIcon(true);
                      }
                    }}

                  />
                  <span className="block w-full px-3 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded text-center text-sm hover:bg-bd-surface transition-colors">
                    Upload Logo (PNG, SVG, JPEG)

                  </span>
                </label>
                <button
                  className={`px-3 py-2 rounded text-sm transition-opacity ${
                    spaceHasUploadedIcon || spaceIconFile
                      ? "bg-bd-danger text-white hover:opacity-90 cursor-pointer"
                      : "bg-bd-surface-2 border border-bd-border text-bd-text-muted opacity-50 cursor-not-allowed"
                  }`}

                  disabled={!spaceHasUploadedIcon && !spaceIconFile}

                  onClick={() => {
                    if (spaceIconUrl && spaceIconUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(spaceIconUrl);
                    }

                    setSpaceIconUrl(null);

                    setSpaceIconPath(null);

                    setSpaceIconFile(null);

                    setSpaceHasUploadedIcon(false);
                  }}

                >
                  Remove
                </button>
              </div>
              {(spaceIconUrl || spaceIconPath || spaceIconFile) && (
                <div className="flex items-center gap-2">
                  <img 
                    src={spaceIconUrl || spaceIconPath || (spaceIconFile ? URL.createObjectURL(spaceIconFile) : "")} 

                    alt="Space icon" 
                    className="w-8 h-8 object-contain border border-bd-border rounded"
                  />
                  <span className="text-sm text-bd-text-muted">Preview</span>
                </div>
              )}

            </div>
            <button
              className="w-full bg-bd-accent text-[#001018] rounded-lg py-2 font-semibold hover:bg-bd-accent-hover transition-colors"
              onClick={() => (editingSpaceId ? updateSpace.mutate() : createSpace.mutate())}

            >
              Save
            </button>
          </div>
          </div>
        </Modal>
      )}

      {categoryModal && (
        <Modal onClose={() => setCategoryModal(false)}>
          <div data-tour="category-modal">
          <div className="space-y-3">
            <input 
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" 
              placeholder="Name" 
              value={categoryName} 

              onChange={(e) => setCategoryName(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingCategoryId) {
                    updateCategory.mutate();
                  } else {
                    createCategory.mutate();
                  }
                }
              }}

            />
            <div className="space-y-2">
              <label className="block text-sm text-bd-text-muted">Icon (upload image, default: 📁)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCategoryIconFile(file);

                        setCategoryIconUrl(URL.createObjectURL(file));

                        setCategoryIconPath(null);

                        setCategoryHasUploadedIcon(true);
                      }
                    }}

                  />
                  <span className="block w-full px-3 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded text-center text-sm hover:bg-bd-surface transition-colors">
                    Upload Logo (PNG, SVG, JPEG)

                  </span>
                </label>
                <button
                  className={`px-3 py-2 rounded text-sm transition-opacity ${
                    categoryHasUploadedIcon || categoryIconFile
                      ? "bg-bd-danger text-white hover:opacity-90 cursor-pointer"
                      : "bg-bd-surface-2 border border-bd-border text-bd-text-muted opacity-50 cursor-not-allowed"
                  }`}

                  disabled={!categoryHasUploadedIcon && !categoryIconFile}

                  onClick={() => {
                    console.log("[Category Remove] Remove button clicked");

                    console.log("[Category Remove] Before remove:", {
                      categoryIconUrl,
                      categoryIconPath,
                      categoryIconFile: categoryIconFile ? "File present" : "No file",
                      categoryHasUploadedIcon
                    });

                    if (categoryIconUrl && categoryIconUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(categoryIconUrl);
                    }

                    setCategoryIconUrl(null);

                    setCategoryIconPath(null);

                    setCategoryIconFile(null);

                    setCategoryHasUploadedIcon(false);

                    console.log("[Category Remove] After remove - all set to null/false");
                  }}

                >
                  Remove
                </button>
              </div>
              {(categoryIconUrl || categoryIconPath) && (
                <div className="flex items-center gap-2">
                  <img 
                    src={categoryIconUrl || categoryIconPath} 

                    alt="Category icon" 
                    className="w-8 h-8 object-contain border border-bd-border rounded"
                  />
                  <span className="text-sm text-bd-text-muted">Preview</span>
                </div>
              )}

            </div>
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Rows"
              type="number"
              min={1}

              max={10}

              value={categoryRows}

              onChange={(e) => setCategoryRows(parseInt(e.target.value, 10))}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingCategoryId) {
                    updateCategory.mutate();
                  } else {
                    createCategory.mutate();
                  }
                }
              }}

            />
            <select 
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" 
              value={categorySort} 

              onChange={(e) => setCategorySort(e.target.value)}

            >
              <option value="custom">Custom</option>
              <option value="title">Title</option>
              <option value="createdAt">Created</option>
            </select>
            <select
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              value={categorySpaceId || activeSpaceId || ""}

              onChange={(e) => setCategorySpaceId(e.target.value)}

            >
              {filteredSpaces.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}

                </option>
              ))}

            </select>
            <button
              className="w-full bg-bd-accent text-[#001018] rounded-lg py-2 font-semibold hover:bg-bd-accent-hover transition-colors"
              onClick={() => (editingCategoryId ? updateCategory.mutate() : createCategory.mutate())}

            >
              Save
            </button>
          </div>
          </div>
        </Modal>
      )}

      {bookmarkModal && (
        <Modal onClose={() => setBookmarkModal(false)}>
          <div data-tour="bookmark-modal">
          <div className="space-y-3">
            <input 
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" 
              placeholder="Title" 
              value={bookmarkTitle} 

              onChange={(e) => setBookmarkTitle(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingBookmarkId) {
                    updateBookmark.mutate();
                  } else {
                    createBookmark.mutate();
                  }
                }
              }}

            />
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Description"
              value={bookmarkDesc}

              onChange={(e) => setBookmarkDesc(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingBookmarkId) {
                    updateBookmark.mutate();
                  } else {
                    createBookmark.mutate();
                  }
                }
              }}

            />
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Service URL"
              value={bookmarkUrl}

              onChange={(e) => setBookmarkUrl(e.target.value)}

              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  if (editingBookmarkId) {
                    updateBookmark.mutate();
                  } else {
                    createBookmark.mutate();
                  }
                }
              }}

            />
            <div className="space-y-2">
              <label className="block text-sm text-bd-text-muted">Icon (upload image or leave empty for auto-favicon)</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBookmarkIconFile(file);

                        setBookmarkIcon(URL.createObjectURL(file));

                        setBookmarkHasUploadedIcon(true);
                      }
                    }}

                  />
                  <span className="block w-full px-3 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded text-center text-sm hover:bg-bd-surface transition-colors">
                    Upload Logo (PNG, SVG, JPEG)

                  </span>
                </label>
                {(() => {
                  const isActive = bookmarkHasUploadedIcon || bookmarkIconFile;
                  const isDisabled = !bookmarkHasUploadedIcon && !bookmarkIconFile;
                  console.log("[Bookmark Remove Button] Render:", {
                    bookmarkHasUploadedIcon,
                    bookmarkIconFile: !!bookmarkIconFile,
                    bookmarkIcon,
                    isActive,
                    isDisabled
                  });

                  return (
                    <button
                      className={`px-3 py-2 rounded text-sm transition-opacity ${
                        isActive
                          ? "bg-bd-danger text-white hover:opacity-90 cursor-pointer"
                          : "bg-bd-surface-2 border border-bd-border text-bd-text-muted opacity-50 cursor-not-allowed"
                      }`}

                      disabled={isDisabled}

                      onClick={() => {
                        console.log("[Bookmark Remove] Remove clicked:", {
                          bookmarkHasUploadedIcon,
                          bookmarkIconFile: !!bookmarkIconFile,
                          bookmarkIcon
                        });

                        if (bookmarkIcon && bookmarkIcon.startsWith("blob:")) {
                          URL.revokeObjectURL(bookmarkIcon);
                        }

                        setBookmarkIcon("");

                        setBookmarkIconFile(null);

                        setBookmarkHasUploadedIcon(false);
                      }}

                    >
                      Remove
                    </button>
                  );
                })()}

              </div>
              {(bookmarkIcon || bookmarkIconFile) && (
                <div className="flex items-center gap-2">
                  <img 
                    src={bookmarkIcon || (bookmarkIconFile ? URL.createObjectURL(bookmarkIconFile) : "")} 

                    alt="Bookmark icon" 
                    className="w-8 h-8 object-contain border border-bd-border rounded"
                  />
                  <span className="text-sm text-bd-text-muted">
                    {bookmarkHasUploadedIcon || bookmarkIconFile 
                      ? "Preview (will use uploaded icon instead of favicon)"
                      : "Preview (auto-favicon)"}

                  </span>
                </div>
              )}

            </div>
            <select className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" value={bookmarkMethod} onChange={(e) => setBookmarkMethod(e.target.value as any)}>
              <option value="same-tab">Same tab</option>
              <option value="new-tab">New tab</option>
              <option value="iframe">Iframe modal</option>
            </select>
            <select
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              value={bookmarkCategoryId || ""}

              onChange={(e) => setBookmarkCategoryId(e.target.value)}

            >
              {categoriesForSpace.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}

                </option>
              ))}

            </select>
            {bookmarkError && (
              <div className="text-bd-danger text-sm p-2 bg-bd-surface-2 border border-bd-danger rounded">
                {bookmarkError}

              </div>
            )}

            <button
              className="w-full bg-bd-accent text-[#001018] rounded-lg py-2 font-semibold hover:bg-bd-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setBookmarkError("");

                if (editingBookmarkId) {
                  updateBookmark.mutate();
                } else {
                  createBookmark.mutate();
                }
              }}

              disabled={createBookmark.isPending || updateBookmark.isPending}

            >
              Save
            </button>
          </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center" onClick={onClose}>
    <div className="bg-bd-surface border border-bd-border rounded-xl p-6 w-full max-w-lg shadow-bd" onClick={(e) => e.stopPropagation()}>
      {children}

    </div>
  </div>
);

export default DashboardPage;
