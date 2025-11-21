//src/lib/utils/cls.ts
export const cls = (...xs: Array<string | false | undefined | null>) =>
  xs.filter(Boolean).join(" ");
