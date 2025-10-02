import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import react from "@vitejs/plugin-react";
import path from "path";
import rollupReplace from "@rollup/plugin-replace";
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        // "@": path.resolve(__dirname, "./src"),
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },

  plugins: [
    rollupReplace({
      preventAssignment: true,
      values: {
        __DEV__: JSON.stringify(true),
        "process.env.NODE_ENV": JSON.stringify("development"),
        // "process.env.REACT_APP_BASE_URL": JSON.stringify("https://ksvvmxbk-3100.inc1.devtunnels.ms/api"),
        "process.env.REACT_APP_BASE_URL": JSON.stringify("http://13.51.230.148:3000/api"),
      },
    }),
    react(),
    reactRefresh(),
  ],

   server: {
    port: 3000, 
  },
});
