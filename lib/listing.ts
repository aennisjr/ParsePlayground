import { listQuery, type ListConfig } from "./api";
import { buildQuery, cleanParams } from "./format";

/**
 * Runs a list query for an HTML listing page and works out the numbers the
 * page needs: current page, total pages, and the "Showing X–Y" range.
 */
export function runListing<T extends Record<string, unknown>>(
  basePath: string,
  rawParams: Record<string, string | string[] | undefined>,
  rows: T[],
  cfg: ListConfig<T> & { defaultLimit: number },
  filterKeys: readonly string[],
) {
  const params = cleanParams(rawParams);
  // Listing pages only use page-based pagination; drop API-only parameters.
  for (const k of ["cursor", "offset", "limit", "per_page", "format"]) delete params[k];
  const url = new URL(`http://local${basePath}${buildQuery(params)}`);
  const { data, meta } = listQuery(url, rows, cfg);
  const page = Number(meta.page ?? 1);
  const totalPages = Number(meta.totalPages ?? 1);
  const total = Number(meta.total);
  const first = total ? (page - 1) * cfg.defaultLimit + 1 : 0;
  const last = Math.min(total, page * cfg.defaultLimit);
  const activeKeys = filterKeys.filter((k) => k !== "sort" && params[k]);
  return { params, data, page, totalPages, total, first, last, activeKeys };
}

/** Canonical + robots metadata shared by listing pages: filtered views are noindex. */
export function listingSeo(basePath: string, rawParams: Record<string, string | string[] | undefined>, filterKeys: readonly string[]) {
  const params = cleanParams(rawParams);
  const filtered = filterKeys.some((k) => params[k]);
  const page = Number(params.page ?? 1);
  return {
    params,
    filtered,
    alternates: { canonical: filtered ? basePath : page > 1 ? `${basePath}?page=${page}` : basePath },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}
