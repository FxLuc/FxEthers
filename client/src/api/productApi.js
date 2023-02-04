import { axiosInstance } from "./axiosInstance";

function getItem(nftAddress, tokenId) {
  const id = nftAddress + tokenId
  return axiosInstance.get(`/items/detail/${id}`)
}

function getItems(params) {
  return axiosInstance.get('/item/newest', params)
}

function getItemsSuggested(productId, limitResults = 3) {
  const products = axiosInstance.get(
    "/products/suggested",
    {
      params: {
        id: productId,
        limit: limitResults,
      },
    },
  )
  return products?.data
}

function updateItem(productId, formData) {
  const products = axiosInstance.patch(
    `/products/${productId}`,
    formData,
  )
  return products?.data
}

function createItem(formData) {
  const products = axiosInstance.post('/items', formData)
  return products?.data
}

function deleteItem(productId) {
  const products = axiosInstance.delete(`/items/${productId}`)
  return products?.data
}

export {
  getItem,
  getItems,
  getItemsSuggested,
  updateItem,
  createItem,
  deleteItem,
}
