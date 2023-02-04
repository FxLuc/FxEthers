import { axiosInstance } from "./axiosInstance";

async function signin(formBody) {
  const response = await axiosInstance.post('/accounts/signin', formBody);
  return response;
}

async function getMyAccount() {
  const response = await axiosInstance.get('/accounts');
  return response?.data;
}

async function updateMyAccount(accountId, formBody) {
  const response = await axiosInstance.patch(`/accounts/${accountId}`, formBody);
  return response?.data;
}

export {
  signin,
  getMyAccount,
  updateMyAccount,
};
