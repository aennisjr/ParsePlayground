import products from "@/data/generated/products.json";
import blog from "@/data/generated/blog.json";
import jobs from "@/data/generated/jobs.json";
import realEstate from "@/data/generated/real-estate.json";
import authors from "@/data/generated/authors.json";
import taxonomy from "@/data/generated/taxonomy.json";

export type Product = (typeof products)[number];
export type BlogPost = (typeof blog)[number];
export type Job = (typeof jobs)[number];
export type Property = (typeof realEstate)[number];

export const DATASETS = {
  products: products as Product[],
  blog: blog as BlogPost[],
  jobs: jobs as Job[],
  "real-estate": realEstate as Property[],
} as const;
export type DatasetName = keyof typeof DATASETS;

export { products, blog, jobs, realEstate, authors, taxonomy };

export const getProduct = (id: number) => (products as Product[]).find((p) => p.id === id);
