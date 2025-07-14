import axios, { AxiosResponse, AxiosError, AxiosInstance } from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not defined in .env.local");
}

const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 86400, // Set timeout in milliseconds
});

// Add request interceptor to handle different content types
apiClient.interceptors.request.use(
    (config) => {
        // Don't set Content-Type for FormData (file uploads)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            // For regular JSON requests
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    toast.error("Permintaan tidak valid.");
                    break;
                case 401:
                    toast.error("Tidak terautentikasi. Silahkan login lagi");
                    break;
                case 403:
                    toast.error("Akses ditolak");
                    break;
                case 404:
                    toast.error("Sumber daya tidak ditemukan");
                    break;
                case 500:
                    toast.error("Terjadi Kesalahan Server");
                    break;
                default:
                    toast.error("Terjadi kesalahan. Silahkan coba lagi");
            }
        } else if (error.request) {
            toast.error("Tidak ada respons dari server. Periksa koneksi internet Anda.");
        } else {
            toast.error(`Error: ${error.message}`); // Fixed template literal syntax
        }
        return Promise.reject(error);
    }
);

export default apiClient;
