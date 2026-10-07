export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s/]+/g, "-")
    .replace(/[^a-z0-9\-а-яіїєґ]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
