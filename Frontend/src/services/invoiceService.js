import api from "./api";

export const getInvoices = async (params = {}) => {
	const { data } = await api.get("/invoices", { params });
	return data;
};

export const getInvoice = async (id) => {
	const { data } = await api.get(`/invoices/${id}`);
	return data.data;
};

export const generateInvoice = async (id) => {
	const { data } = await api.post(`/invoices/${id}/generate`);
	return data.data;
};

export const exportInvoices = async (params = {}) => {
	const response = await api.get("/invoices/export", { params, responseType: "blob" });
	return response.data;
};
