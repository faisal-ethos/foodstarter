import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { insertFoodSchema } from "@/data/schema/foods";
import { createFood, getAllFoods } from "@/data/services/food.service";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");
let originalDbContent: string;

describe("Matrix Food Tracker - Form Validation", () => {
	it("should validate required fields using insertFoodSchema", () => {
		// Test with valid data
		const validData = {
			name: "Test Food",
			category: "Test Category",
			quantity: 2,
			unit: "pieces",
			calories: 150,
		};

		const result = insertFoodSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should reject empty name", () => {
		const invalidData = {
			name: "",
			category: "Test Category",
			quantity: 1,
			unit: "piece",
		};

		const result = insertFoodSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.errors[0].path).toContain("name");
		}
	});

	it("should reject empty category", () => {
		const invalidData = {
			name: "Test Food",
			category: "",
			quantity: 1,
			unit: "piece",
		};

		const result = insertFoodSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.errors[0].path).toContain("category");
		}
	});

	it("should reject non-positive quantity", () => {
		const invalidData = {
			name: "Test Food",
			category: "Test Category",
			quantity: 0,
			unit: "piece",
		};

		const result = insertFoodSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should accept optional nutritional fields", () => {
		const validData = {
			name: "Test Food",
			category: "Test Category",
			quantity: 1,
			unit: "piece",
			calories: 100,
			protein: 10,
			carbs: 20,
			fat: 5,
			notes: "Test notes",
		};

		const result = insertFoodSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});

describe("Matrix Food Tracker - Database Operations", () => {
	beforeEach(async () => {
		// Backup original database
		originalDbContent = await fs.readFile(DB_PATH, "utf-8");
	});

	afterEach(async () => {
		// Restore original database
		await fs.writeFile(DB_PATH, originalDbContent, "utf-8");
	});

	it("should create a new food entry in the JSON database", async () => {
		const newFood = {
			name: "Test Matrix Food",
			category: "Test Category",
			quantity: 2,
			unit: "pieces",
			calories: 150,
			protein: 10,
			carbs: 20,
			fat: 5,
			notes: "Created by test",
		};

		// Create the food entry
		const created = await createFood(newFood);

		// Verify the entry was created with correct data
		expect(created.id).toBeDefined();
		expect(created.name).toBe(newFood.name);
		expect(created.category).toBe(newFood.category);
		expect(created.quantity).toBe(newFood.quantity);
		expect(created.unit).toBe(newFood.unit);
		expect(created.calories).toBe(newFood.calories);
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		// Verify it's in the database
		const dbContent = await fs.readFile(DB_PATH, "utf-8");
		const db = JSON.parse(dbContent);
		const foundEntry = db.foods.find((food: any) => food.name === "Test Matrix Food");

		expect(foundEntry).toBeDefined();
		expect(foundEntry.id).toBe(created.id);
	});

	it("should retrieve all foods sorted by creation date (newest first)", async () => {
		// Create test entries with different timestamps
		const food1 = await createFood({
			name: "First Food",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		// Small delay to ensure different timestamps
		await new Promise((resolve) => setTimeout(resolve, 10));

		const food2 = await createFood({
			name: "Second Food",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		const foods = await getAllFoods();

		// Should have at least the two foods we created
		expect(foods.length).toBeGreaterThanOrEqual(2);

		// Verify sorting (newest first) - food2 should come before food1
		const food1Index = foods.findIndex((f) => f.id === food1.id);
		const food2Index = foods.findIndex((f) => f.id === food2.id);
		expect(food2Index).toBeLessThan(food1Index);

		// Verify all entries are sorted correctly
		for (let i = 0; i < foods.length - 1; i++) {
			const currentDate = new Date(foods[i].createdAt).getTime();
			const nextDate = new Date(foods[i + 1].createdAt).getTime();
			expect(currentDate).toBeGreaterThanOrEqual(nextDate);
		}
	});

	it("should persist data across multiple operations", async () => {
		// Create first entry
		const food1 = await createFood({
			name: "Test Food 1",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		// Create second entry
		const food2 = await createFood({
			name: "Test Food 2",
			category: "Test",
			quantity: 2,
			unit: "pieces",
		});

		// Retrieve all foods
		const allFoods = await getAllFoods();

		// Both entries should exist
		const found1 = allFoods.find((f) => f.id === food1.id);
		const found2 = allFoods.find((f) => f.id === food2.id);

		expect(found1).toBeDefined();
		expect(found2).toBeDefined();
		expect(found1?.name).toBe("Test Food 1");
		expect(found2?.name).toBe("Test Food 2");
	});

	it("should generate unique sequential IDs", async () => {
		const food1 = await createFood({
			name: "ID Test 1",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		const food2 = await createFood({
			name: "ID Test 2",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		expect(food2.id).toBeGreaterThan(food1.id);
	});
});
