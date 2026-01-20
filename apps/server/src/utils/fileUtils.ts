import path from "path";

export const sanitizeFileName = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") 

    .replace(/\s+/g, "_") 

    .replace(/_{2,}/g, "_") 

    .replace(/^_+|_+$/g, "") 

    .substring(0, 100) 

    || "unnamed"; 
};

export const getSpaceDir = (uploadDir: string, spaceName: string): string => {
  const sanitized = sanitizeFileName(spaceName);

  return path.join(uploadDir, "spaces", sanitized);
};

export const getCategoryDir = (uploadDir: string, spaceName: string, categoryName: string): string => {
  const sanitizedSpace = sanitizeFileName(spaceName);

  const sanitizedCategory = sanitizeFileName(categoryName);

  return path.join(uploadDir, "spaces", sanitizedSpace, sanitizedCategory);
};

export const getSpaceLogoDir = (uploadDir: string, spaceName: string): string => {
  const sanitizedSpace = sanitizeFileName(spaceName);

  return path.join(uploadDir, "spaces", sanitizedSpace);
};
