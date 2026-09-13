export function countBy<T extends Record<string, any>>(
  rows: T[] | null | undefined,
  key: keyof T
): Record<string, number> {
  const result: Record<string, number> = {};
  (rows ?? []).forEach((row) => {
    const k = String(row[key]);
    result[k] = (result[k] ?? 0) + 1;
  });
  return result;
}

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}
