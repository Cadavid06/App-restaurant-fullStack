import axios from './axios'

export const createInvoicesRequest = (id, invoice) => axios.post(`/invoice/${id}`, invoice);

export const getInvoiceRequest = (id) => axios.get(`/invoice/${id}`)