import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      afterDiagnostic: (data) => console.log(data),
    }),
  ],
  resolve: {
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ["@adaline/shared-types"],
    force: true,
  },
});
