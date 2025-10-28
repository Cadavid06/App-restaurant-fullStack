import axios from "./axios";

export const getUsersRequest = () => axios.get(`/user`);

export const getUserRequest = (id) => axios.get(`/user/${id}`);

export const updateUsersRequest = (id, user) =>
  axios.put(`/user/${id}`, user);

export const deleteUsersRequest = (id) => axios.delete(`/user/${id}`);
