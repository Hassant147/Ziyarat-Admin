import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, transformWithEsbuild } from "vite";

const VENDOR_CHUNK_RULES = [
  {
    name: "ui-vendor",
    packages: new Set([
      "react-icons",
      "react-toastify",
      "react-hot-toast",
      "react-js-loader",
      "react-spinners",
      "swiper",
    ]),
  },
  {
    name: "forms-vendor",
    packages: new Set([
      "react-datepicker",
      "react-number-format",
      "react-phone-input-2",
      "react-phone-number-input",
      "react-select",
      "react-dropzone",
      "country-json",
      "react-circular-progressbar",
    ]),
  },
  {
    name: "firebase-vendor",
    packages: new Set(["firebase", "@firebase/app", "@firebase/auth"]),
  },
];

const getPackageName = (id = "") => {
  const nodeModulesIndex = id.lastIndexOf("node_modules/");
  if (nodeModulesIndex === -1) {
    return "";
  }

  const packagePath = id.slice(nodeModulesIndex + "node_modules/".length);
  const [firstSegment, secondSegment] = packagePath.split("/");

  if (firstSegment.startsWith("@")) {
    return `${firstSegment}/${secondSegment || ""}`;
  }

  return firstSegment;
};

const jsxInJsPlugin = () => ({
  name: "jsx-in-js",
  async transform(code, id) {
    if (!id.includes("/src/") || !id.endsWith(".js")) {
      return null;
    }

    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic",
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const compatEnv = {
    ...Object.fromEntries(
      Object.entries(env).filter(
        ([key]) =>
          (key.startsWith("REACT_APP_") && key !== "REACT_APP_AUTH_TOKEN") ||
          key.startsWith("VITE_") ||
          key === "PUBLIC_URL"
      )
    ),
    NODE_ENV: mode,
    PUBLIC_URL: env.PUBLIC_URL || "",
  };

  return {
    plugins: [jsxInJsPlugin(), react()],
    envPrefix: ["VITE_", "REACT_APP_"],
    define: {
      "process.env": compatEnv,
    },
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 3000,
    },
    preview: {
      port: 3000,
    },
    build: {
      outDir: "build",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: false,
          manualChunks(id) {
            if (!id.includes("node_modules/")) {
              return undefined;
            }

            const packageName = getPackageName(id);

            for (const group of VENDOR_CHUNK_RULES) {
              if (group.packages.has(packageName)) {
                return group.name;
              }
            }

            return undefined;
          },
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          ".js": "jsx",
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    },
  };
});
