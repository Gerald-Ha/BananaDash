export type Role = "admin" | "user";
export type LayoutMode = "auto" | "vertical" | "horizontal";
export type ItemSize = "small" | "medium" | "large";
export type FitBoxMode = "auto" | "fit";
export type OpeningMethod = "same-tab" | "new-tab" | "iframe";
export interface User {
  id: string;
  username: string;
  role: Role;
  onboardingCompleted: boolean;
}

export interface Space {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  iconPath?: string;
  iconUrl?: string;
  order: number;
}

export interface Category {
  _id: string;
  userId: string;
  spaceId: string;
  name: string;
  icon: string;
  iconPath?: string;
  iconUrl?: string;
  sortBy: string;
  numRows: number;
  order: number;
}

export interface Bookmark {
  _id: string;
  userId: string;
  spaceId: string;
  categoryId: string;
  title: string;
  description: string;
  iconPath?: string;
  iconUrl?: string;
  iconIsUploaded?: boolean;
  serviceUrl: string;
  openingMethod: OpeningMethod;
  order: number;
  createdAt: string;
}

export interface Settings {
  _id: string;
  userId: string;
  allowRegistration: boolean;
  theme: {
    mode: "light" | "dark" | "custom";
    primary: string;
    accent: string;
    font: string;
  };

  layout: {
    layoutMode: LayoutMode;
    itemSize: ItemSize;
    fitBoxMode?: FitBoxMode;
  };

  customCss: string;
}

export interface UpdateInfo {
  status: "up_to_date" | "update_available" | "blocked" | "unknown" | "error";
  currentVersion: string;
  latestVersion?: string;
  minimumSupported?: string;
  critical?: boolean;
  releasedAt?: string;
  updateLink?: string;
  notesUrl?: string;
  dockerImage?: string;
  dockerTag?: string;
  dockerDigest?: string;
  migrations?: string[];
  message?: string;
  requestId?: string;
  serverTime?: string;
}

export interface VersionStatus {
  installed: string;
  latest: string;
  status: "outdated" | "up-to-date" | "unknown";
  updateInfo?: UpdateInfo | null;
}
