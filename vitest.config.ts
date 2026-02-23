import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "node",
		globals: true,
		// Run tests sequentially to avoid race conditions with shared db.json file
		fileParallelism: false,
	},
});
