import { ZodError } from "zod";

export const formatZodError = (error: ZodError): string => {
  const flattened = error.flatten();

  const fieldErrors = Object.entries(flattened.fieldErrors)

    .map(([field, messages]) => {
      const msg = Array.isArray(messages) ? messages.join(", ") : String(messages || "");

      return msg ? `${field}: ${msg}` : null;
    })

    .filter(Boolean)

    .join("; ");

  const formErrors = flattened.formErrors.length > 0 
    ? flattened.formErrors.join("; ")

    : "";
  if (fieldErrors) {
    return fieldErrors;
  }

  if (formErrors) {
    return formErrors;
  }

  return "Validation failed";
};
