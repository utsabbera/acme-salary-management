import { client } from "./generated/client.gen";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn("NEXT_PUBLIC_API_URL environment variable is not defined");
}

client.setConfig({
  baseUrl: apiUrl,
});

export const apiClient = client;
