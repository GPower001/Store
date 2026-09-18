import api from "./api";

const getErrorMessage = (error) =>
	error.response?.data?.error || error.response?.data?.message || "Something went wrong. Please try again.";

export const login = async (credentials) => {
	try {
		const { data } = await api.post("/auth/login", credentials);
		if (data.token) localStorage.setItem("inventory_token", data.token);
		if (data.user) localStorage.setItem("inventory_user", JSON.stringify(data.user));
		return data;
	} catch (error) {
		throw new Error(getErrorMessage(error), { cause: error });
	}
};

export const registerTenant = async (details) => {
	try {
		const { data } = await api.post("/auth/register-tenant", details);
		if (data.token) localStorage.setItem("inventory_token", data.token);
		if (data.user) localStorage.setItem("inventory_user", JSON.stringify(data.user));
		return data;
	} catch (error) {
		throw new Error(getErrorMessage(error), { cause: error });
	}
};
