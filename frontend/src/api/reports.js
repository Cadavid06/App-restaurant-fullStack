import axios from "./axios";

export const getReportsRequest = (startDate, endDate) =>
  axios.get(`/reports?startDate=${startDate}&endDate=${endDate}`);