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

export const getCurrentUser = async () => {
	const { data } = await api.get("/auth/me");
	return data.data;
};

export const updateProfile = async (payload) => {
	const { data } = await api.put("/auth/me", payload);
	return data.data;
};

export const updateOrganization = async (payload) => {
	const { data } = await api.put("/auth/organization", payload);
	return data.data;
};

export const verifyTwoFactorLogin = async (challengeToken, code) => {
	try {
		const { data } = await api.post("/auth/2fa/verify-login", { challengeToken, code });
		if (data.token) localStorage.setItem("inventory_token", data.token);
		if (data.user) localStorage.setItem("inventory_user", JSON.stringify(data.user));
		return data;
	} catch (error) {
		throw new Error(getErrorMessage(error), { cause: error });
	}
};

export const getTwoFactorStatus = async () => {
	const { data } = await api.get("/auth/2fa/status");
	return data.data;
};

export const setupTwoFactor = async () => {
	const { data } = await api.post("/auth/2fa/setup");
	return data.data;
};

export const enableTwoFactor = async (code) => {
	const { data } = await api.post("/auth/2fa/enable", { code });
	return data;
};

export const disableTwoFactor = async (password) => {
	const { data } = await api.post("/auth/2fa/disable", { password });
	return data;
};
