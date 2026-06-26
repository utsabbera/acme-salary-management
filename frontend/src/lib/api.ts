import { createClient, createConfig } from "@hey-api/client-fetch";

export const apiClient = createClient(
  createConfig({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  }),
);
