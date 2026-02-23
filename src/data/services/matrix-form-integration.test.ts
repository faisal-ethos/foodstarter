import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { createFood, getAllFoods } from "@/data/services/food.service";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");
let originalDbContent: string;

describe("Matrix Food Tracker - Form Integration Test", () => {
	beforeEach(async () => {
		// Backup original database
		originalDbContent = await fs.readFile(DB_PATH, "utf-8");
	});

	afterEach(async () => {
		// Restore original database
		await fs.writeFile(DB_PATH, originalDbContent, "utf-8");
	});

	it("should create a food entry through the server function (simulating form submission)", async () => {
		// Simulate form submission data
		const formData = {
			name: "Matrix Test Food",
			category: "Test Category",
			quantity: 3,
			unit: "pieces",
			calories: 200,
			protein: 15,
			carbs: 25,
			fat: 8,
			notes: "Created via form submission test",
		};

		// Get initial count
		const initialFoods = await getAllFoods();
		const initialCount = initialFoods.length;

		// Call the service function (this is what the server function calls)
		const created = await createFood(formData);

		// Verify the entry was created
		expect(created.id).toBeDefined();
		expect(created.name).toBe(formData.name);
		expect(created.category).toBe(formData.category);
		expect(created.quantity).toBe(formData.quantity);
		expect(created.unit).toBe(formData.unit);
		expect(created.calories).toBe(formData.calories);
		expect(created.protein).toBe(formData.protein);
		expect(created.carbs).toBe(formData.carbs);
		expect(created.fat).toBe(formData.fat);
		expect(created.notes).toBe(formData.notes);
		expect(created.createdAt).toBeDefined();
		expect(created.updatedAt).toBeDefined();

		// Verify it's in the database
		const updatedFoods = await getAllFoods();
		expect(updatedFoods.length).toBe(initialCount + 1);

		// Verify the new entry is at the top (newest first)
		const newestEntry = updatedFoods[0];
		expect(newestEntry.name).toBe("Matrix Test Food");
	});

	it("should handle form submission with only required fields", async () => {
		// Simulate minimal form submission
		const minimalData = {
			name: "Minimal Food",
			category: "Minimal",
			quantity: 1,
			unit: "piece",
		};

		const created = await createFood(minimalData);

		expect(created.id).toBeDefined();
		expect(created.name).toBe(minimalData.name);
		expect(created.category).toBe(minimalData.category);
		expect(created.quantity).toBe(minimalData.quantity);
		expect(created.unit).toBe(minimalData.unit);
		expect(created.calories).toBeUndefined();
		expect(created.protein).toBeUndefined();
		expect(created.carbs).toBeUndefined();
		expect(created.fat).toBeUndefined();
		expect(created.notes).toBeUndefined();
	});

	it("should persist multiple form submissions", async () => {
		// Submit first entry
		const entry1 = await createFood({
			name: "First Entry",
			category: "Test",
			quantity: 1,
			unit: "piece",
		});

		// Submit second entry
		const entry2 = await createFood({
			name: "Second Entry",
			category: "Test",
			quantity: 2,
			unit: "pieces",
		});

		// Verify both entries exist
		const allFoods = await getAllFoods();
		const found1 = allFoods.find((f) => f.id === entry1.id);
		const found2 = allFoods.find((f) => f.id === entry2.id);

		expect(found1).toBeDefined();
		expect(found2).toBeDefined();
		expect(found1?.name).toBe("First Entry");
		expect(found2?.name).toBe("Second Entry");

		// Verify second entry is newer (appears first in sorted list)
		expect(allFoods[0].id).toBe(entry2.id);
		expect(allFoods[1].id).toBe(entry1.id);
	});
});
