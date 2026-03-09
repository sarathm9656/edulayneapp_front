const FALLBACK_COURSE_IMAGE = "/img/chessthumbnail.jpg";

export const resolveCourseImageUrl = (image, apiBaseUrl) => {
  if (!image) {
    return FALLBACK_COURSE_IMAGE;
  }

  const value = String(image).trim();
  if (!value) {
    return FALLBACK_COURSE_IMAGE;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("/api/uploads/") || value.startsWith("/uploads/")) {
    return value;
  }

  if (value.startsWith("uploads/")) {
    return `/${value}`;
  }

  const normalizedBase = String(apiBaseUrl || "/api").replace(/\/+$/, "");
  return `${normalizedBase}/uploads/courses/${value}`;
};

export const applyCourseImageFallback = (event) => {
  if (event?.currentTarget) {
    event.currentTarget.src = FALLBACK_COURSE_IMAGE;
  }
};

export { FALLBACK_COURSE_IMAGE };
