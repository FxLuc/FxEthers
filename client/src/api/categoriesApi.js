import { axiosInstance } from "./axiosInstance";

async function getCategories() {
  const categories = await axiosInstance.get('/categories')
  return categories?.data
}

export {
  getCategories,
}
