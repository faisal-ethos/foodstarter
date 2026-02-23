import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Task 5.2: Validate service layer integration
 * 
 * This test suite validates that the Matrix route properly integrates
 * with existing service layers without duplication.
 * 
 * Requirements validated:
 * - 5.1: Uses existing insertFoodSchema from src/data/schema/foods.ts
 * - 5.2: Calls createFoodServerFn from src/data/services/food.server.ts
 * - 5.3: Calls getFoodsServerFn from src/data/services/food.server.ts
 * - 5.4: Uses existing Food type from src/data/schema/foods.ts
 * - 5.5: Does NOT duplicate any existing service layer logic
 */

describe("Service Layer Integration Validation", () => {
	it("should import insertFoodSchema from existing schema (Req 5.1)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify insertFoodSchema is imported from the correct location
		expect(matrixRoute).toContain(
			'import { insertFoodSchema } from "@/data/schema/foods"',
		);

		// Verify it's used for validation
		expect(matrixRoute).toContain("insertFoodSchema.safeParse");
	});

	it("should import and use createFoodServerFn correctly (Req 5.2)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify createFoodServerFn is imported from the correct location
		expect(matrixRoute).toContain(
			'from "@/data/services/food.server"',
		);
		expect(matrixRoute).toContain("createFoodServerFn");

		// Verify it's called with validated data
		expect(matrixRoute).toContain("await createFoodServerFn");
	});

	it("should import and use getFoodsServerFn correctly (Req 5.3)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify getFoodsServerFn is imported
		expect(matrixRoute).toContain("getFoodsServerFn");

		// Verify it's used in the loader
		expect(matrixRoute).toContain("await getFoodsServerFn()");
	});

	it("should use Food type implicitly through server functions (Req 5.4)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify the loader returns foods data (typed as Food[] by getFoodsServerFn)
		expect(matrixRoute).toContain("const foods = await getFoodsServerFn()");
		expect(matrixRoute).toContain("return { foods }");

		// Verify foods are accessed with Food properties
		expect(matrixRoute).toContain("food.id");
		expect(matrixRoute).toContain("food.name");
		expect(matrixRoute).toContain("food.category");
		expect(matrixRoute).toContain("food.quantity");
		expect(matrixRoute).toContain("food.unit");
	});

	it("should NOT duplicate service layer logic (Req 5.5)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify NO direct database operations
		expect(matrixRoute).not.toContain("readDatabase");
		expect(matrixRoute).not.toContain("writeDatabase");
		expect(matrixRoute).not.toContain("fs.readFile");
		expect(matrixRoute).not.toContain("fs.writeFile");
		expect(matrixRoute).not.toContain("JSON.parse");
		expect(matrixRoute).not.toContain("JSON.stringify");

		// Verify NO direct file system imports
		expect(matrixRoute).not.toContain('from "node:fs');
		expect(matrixRoute).not.toContain('from "fs"');

		// Verify NO duplicate CRUD logic
		expect(matrixRoute).not.toContain("db.foods.push");
		expect(matrixRoute).not.toContain("db.foods.filter");
		expect(matrixRoute).not.toContain("db.foods.find");
		expect(matrixRoute).not.toContain("Math.max(...db.foods");
	});

	it("should use NewFood type implicitly through insertFoodSchema (Req 5.4)", async () => {
		const matrixRoute = await readFile(
			path.join(process.cwd(), "src/routes/matrix.tsx"),
			"utf-8",
		);

		// Verify form data is validated with insertFoodSchema (which produces NewFood type)
		expect(matrixRoute).toContain("const result = insertFoodSchema.safeParse(data)");
		expect(matrixRoute).toContain("result.data");
	});

	it("should properly integrate with server function signatures", async () => {
		const foodServer = await readFile(
			path.join(process.cwd(), "src/data/services/food.server.ts"),
			"utf-8",
		);

		// Verify server functions use correct types
		expect(foodServer).toContain("NewFood");
		expect(foodServer).toContain("insertFoodSchema");
		expect(foodServer).toContain("getAllFoods");
		expect(foodServer).toContain("createFood");
	});
});
