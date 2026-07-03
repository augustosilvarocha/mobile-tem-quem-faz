import { api } from "./api";

export type Category = {
  id: number;
  name: string;
};

export async function getCategories(): Promise<Category[]> {
  return api<Category[]>("/categories/");
}