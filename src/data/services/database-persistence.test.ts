import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { createFood, getAllFoods } from "@/data/services/food.service";
import type { Food } from "@/data/schema/foods";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");
const BACKUP_PATH = path.join(process.cwd(), "src/data/db.backup.json");

describe("Task 5.1 - JSON Database Persistence Verification", () => {
	beforeAll(async () => {
		// Backup original database
		try {
			const original = await fs.readFile(DB_PATH, "utf-8");
			await fs.writeFile(BACKUP_PATH, original, "utf-8");
		} catch {
			// If db.json doesn't exist, create empty backup
			await fs.writeFile(BACKUP_PATH, JSON.stringify({ foods: [] }), "utf-8");
		}

		// Start with clean database
		await fs.writeFile(DB_PATH, JSON.stringify({ foods: [] }, null, 2), "utf-8");
	});

	afterAll(async () => {
		// Restore original database
		const backup = await fs.readFile(BACKUP_PATH, "utf-8");
		await fs.writeFile(DB_PATH, backup, "utf-8");
		await fs.unlink(BACKUP_PATH);
	});

	it("should write entries to src/data/db.json with correct structure", async () => {
		// Create a test entry
		const testFood = {
			name: "Test Apple",
			category: "Fruit",
			quantity: 2,
			unit: "pieces",
			calories: 95,
			protein: 0.5,
			carbs: 25,
			fat: 0.3,
			notes: "Fresh organic apple",
		};

		const created = await createFood(testFood);

		// Read the database file directly
		const dbContent = await fs.readFile(DB_PATH, "utf-8");
		const db = JSON.parse(dbContent);

		// Verify the database structure
		expect(db).toHaveProperty("foods");
		expect(Array.isArray(db.foods)).toBe(true);
		expect(db.foods.length).toBe(1);

		// Verify the entry structure matches the food schema
		const entry = db.foods[0] as Food;
		expect(entry).toHaveProperty("id");
		expect(entry).toHaveProperty("name");
		expect(entry).toHaveProperty("category");
		expect(entry).toHaveProperty("quantity");
		expect(entry).toHaveProperty("unit");
		expect(entry).toHaveProperty("calories");
		expect(entry).toHaveProperty("protein");
		expect(entry).toHaveProperty("carbs");
		expect(entry).toHaveProperty("fat");
		expect(entry).toHaveProperty("notes");
		expect(entry).toHaveProperty("createdAt");
		expect(entry).toHaveProperty("updatedAt");

		// Verify the values
		expect(entry.id).toBe(created.id);
		expect(entry.name).toBe("Test Apple");
		expect(entry.category).toBe("Fruit");
		expect(entry.quantity).toBe(2);
		expect(entry.unit).toBe("pieces");
		expect(entry.calories).toBe(95);
		expect(entry.protein).toBe(0.5);
		expect(entry.carbs).toBe(25);
		expect(entry.fat).toBe(0.3);
		expect(entry.notes).toBe("Fresh organic apple");

		// Verify timestamps are ISO 8601 format
		expect(() => new Date(entry.createdAt)).not.toThrow();
		expect(() => new Date(entry.updatedAt)).not.toThrow();
		expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		expect(entry.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it("should persist entries across multiple read operations (simulating page reloads)", async () => {
		// Create first entry
		const food1 = await createFood({
			name: "Banana",
			category: "Fruit",
			quantity: 3,
			unit: "pieces",
			calories: 105,
		});

		// Simulate page reload by reading from database
		const firstRead = await getAllFoods();
		expect(firstRead.length).toBeGreaterThanOrEqual(1);
		const foundFirst = firstRead.find((f) => f.id === food1.id);
		expect(foundFirst).toBeDefined();
		expect(foundFirst?.name).toBe("Banana");

		// Create second entry
		const food2 = await createFood({
			name: "Orange",
			category: "Fruit",
			quantity: 1,
			unit: "piece",
			calories: 62,
		});

		// Simulate another page reload
		const secondRead = await getAllFoods();
		expect(secondRead.length).toBeGreaterThanOrEqual(2);

		// Both entries should still exist
		const foundFirstAgain = secondRead.find((f) => f.id === food1.id);
		const foundSecond = secondRead.find((f) => f.id === food2.id);

		expect(foundFirstAgain).toBeDefined();
		expect(foundSecond).toBeDefined();
		expect(foundFirstAgain?.name).toBe("Banana");
		expect(foundSecond?.name).toBe("Orange");

		// Verify data persists in the actual file
		const dbContent = await fs.readFile(DB_PATH, "utf-8");
		const db = JSON.parse(dbContent);
		expect(db.foods.length).toBeGreaterThanOrEqual(2);

		const fileFood1 = db.foods.find((f: Food) => f.id === food1.id);
		const fileFood2 = db.foods.find((f: Food) => f.id === food2.id);
		expect(fileFood1).toBeDefined();
		expect(fileFood2).toBeDefined();
	});

	it("should maintain schema structure with all required and optional fields", async () => {
		// Test with minimal required fields only
		const minimalFood = await createFood({
			name: "Water",
			category: "Beverage",
			quantity: 1,
			unit: "glass",
		});

		// Test with all fields
		const completeFood = await createFood({
			name: "Chicken Breast",
			category: "Protein",
			quantity: 150,
			unit: "grams",
			calories: 165,
			protein: 31,
			carbs: 0,
			fat: 3.6,
			notes: "Grilled, skinless",
		});

		// Read from database
		const dbContent = await fs.readFile(DB_PATH, "utf-8");
		const db = JSON.parse(dbContent);

		const minimalEntry = db.foods.find((f: Food) => f.id === minimalFood.id);
		const completeEntry = db.foods.find((f: Food) => f.id === completeFood.id);

		// Verify minimal entry has required fields and auto-generated fields
		expect(minimalEntry.id).toBeDefined();
		expect(minimalEntry.name).toBe("Water");
		expect(minimalEntry.category).toBe("Beverage");
		expect(minimalEntry.quantity).toBe(1);
		expect(minimalEntry.unit).toBe("glass");
		expect(minimalEntry.createdAt).toBeDefined();
		expect(minimalEntry.updatedAt).toBeDefined();
		// Optional fields should be undefined
		expect(minimalEntry.calories).toBeUndefined();
		expect(minimalEntry.protein).toBeUndefined();
		expect(minimalEntry.carbs).toBeUndefined();
		expect(minimalEntry.fat).toBeUndefined();
		expect(minimalEntry.notes).toBeUndefined();

		// Verify complete entry has all fields
		expect(completeEntry.id).toBeDefined();
		expect(completeEntry.name).toBe("Chicken Breast");
		expect(completeEntry.category).toBe("Protein");
		expect(completeEntry.quantity).toBe(150);
		expect(completeEntry.unit).toBe("grams");
		expect(completeEntry.calories).toBe(165);
		expect(completeEntry.protein).toBe(31);
		expect(completeEntry.carbs).toBe(0);
		expect(completeEntry.fat).toBe(3.6);
		expect(completeEntry.notes).toBe("Grilled, skinless");
		expect(completeEntry.createdAt).toBeDefined();
		expect(completeEntry.updatedAt).toBeDefined();
	});

	it("should generate unique sequential IDs and maintain them across operations", async () => {
		const food1 = await createFood({
			name: "Food A",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		const food2 = await createFood({
			name: "Food B",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		const food3 = await createFood({
			name: "Food C",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		// IDs should be sequential
		expect(food2.id).toBeGreaterThan(food1.id);
		expect(food3.id).toBeGreaterThan(food2.id);

		// Verify IDs persist in database
		const dbContent = await fs.readFile(DB_PATH, "utf-8");
		const db = JSON.parse(dbContent);

		const ids = db.foods.map((f: Food) => f.id);
		expect(ids).toContain(food1.id);
		expect(ids).toContain(food2.id);
		expect(ids).toContain(food3.id);

		// All IDs should be unique
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});
