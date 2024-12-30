import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            afterDiagnostic: function (data) { return console.log(data); },
        }),
    ],
    resolve: {
        preserveSymlinks: true,
    },
    optimizeDeps: {
        include: ["@adaline/shared-types"],
    },
});
