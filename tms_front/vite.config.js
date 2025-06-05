import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Make sure the port is specified
    host: "0.0.0.0", // Allow access from outside the container
  },
});
