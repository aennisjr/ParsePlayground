import { listQuery } from "./api";
import { DATASETS, type Product, type ProductSummary } from "./data";

const ROWS = DATASETS.products as (Product & Record<string, unknown>)[];


const summarize = ({ reviews: _reviews, ...rest }: Product): ProductSummary => rest;

/** One batch of products in catalogue order, using the same query code as the API. */
export function productBatch(query: string) {
  const { data, meta } = listQuery(new URL(`http://local/api/products?${query}`), ROWS, { searchFields: [], filterFields: [], sortFields: [] });
  return {
    items: (data as Product[]).map(summarize),
    total: Number(meta.total),
    offset: Number(meta.offset),
    nextCursor: (meta.nextCursor as string | null | undefined) ?? null,
  };
}
