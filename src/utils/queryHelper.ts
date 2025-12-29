/**
 * This file contains helpers for parsing query parameters
 * from HTTP requests into typed, safe, and normalized objects
 * that can be passed directly to services.
 *
 * The idea is to centralize common query parsing logic
 */

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface QueryOptions extends PaginationOptions {
  filters: {
    category?: string | undefined;
    tags?: string[] | undefined;
  };
  sort: "asc" | "desc" | "newest";
}

export const parseQuery = (query: any): QueryOptions => {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const rawLimit = query.limit ? parseInt(query.limit, 10) : 10;
  const limit = Math.min(Math.max(rawLimit, 1), 100); // Set a cap limit (DoS prevention, memory pressure)

  const category = query.category as string | undefined;

  const tags = query.tags
    ? (query.tags as string).split(",").map((t) => t.trim())
    : undefined;

  const sort =
    query.sort === "asc" || query.sort === "desc" ? query.sort : "newest";

  return {
    page,
    limit,
    filters: { category, tags },
    sort,
  };
};
