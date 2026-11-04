// Keep token permissions and the browser file picker in sync. SVG is intentionally
// excluded: these slots display photographs, not executable document formats.
export const siteImageContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const siteImageMaxBytes = 20 * 1024 * 1024;
