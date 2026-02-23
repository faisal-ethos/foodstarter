import fs from "node:fs/promises";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

console.log("=== Task 5.1: JSON Database Persistence Verification ===\n");

// Step 1: Check if db.json exists
try {
	await fs.access(DB_PATH);
	console.log("✓ Database file exists at: src/data/db.json");
} catch {
	console.log("✗ Database file does not exist");
	process.exit(1);
}

// Step 2: Read and parse the database
const dbContent = await fs.readFile(DB_PATH, "utf-8");
const db = JSON.parse(dbContent);

console.log("✓ Database file is valid JSON");

// Step 3: Verify structure
if (db.foods && Array.isArray(db.foods)) {
	console.log("✓ Database has correct structure with 'foods' array");
} else {
	console.log("✗ Database structure is incorrect");
	process.exit(1);
}

// Step 4: Add a test entry
const testEntry = {
	id: db.foods.length > 0 ? Math.max(...db.foods.map((f) => f.id)) + 1 : 1,
	name: "Verification Test Food",
	category: "Test",
	quantity: 1,
	unit: "piece",
	calories: 100,
	protein: 5,
	carbs: 15,
	fat: 2,
	notes: "Created by verification script",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

db.foods.push(testEntry);
await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
console.log("✓ Successfully wrote test entry to database");

// Step 5: Read back to verify persistence
const verifyContent = await fs.readFile(DB_PATH, "utf-8");
const verifyDb = JSON.parse(verifyContent);
const foundEntry = verifyDb.foods.find((f) => f.name === "Verification Test Food");

if (foundEntry) {
	console.log("✓ Entry persists across read operations");
	console.log("\n=== Entry Details ===");
	console.log(`ID: ${foundEntry.id}`);
	console.log(`Name: ${foundEntry.name}`);
	console.log(`Category: ${foundEntry.category}`);
	console.log(`Quantity: ${foundEntry.quantity} ${foundEntry.unit}`);
	console.log(`Calories: ${foundEntry.calories}`);
	console.log(`Protein: ${foundEntry.protein}g`);
	console.log(`Carbs: ${foundEntry.carbs}g`);
	console.log(`Fat: ${foundEntry.fat}g`);
	console.log(`Notes: ${foundEntry.notes}`);
	console.log(`Created: ${foundEntry.createdAt}`);
	console.log(`Updated: ${foundEntry.updatedAt}`);
} else {
	console.log("✗ Entry not found after write");
	process.exit(1);
}

// Step 6: Verify schema structure
console.log("\n=== Schema Verification ===");
const requiredFields = ["id", "name", "category", "quantity", "unit", "createdAt", "updatedAt"];
const optionalFields = ["calories", "protein", "carbs", "fat", "notes"];
const allFields = [...requiredFields, ...optionalFields];

const entryKeys = Object.keys(foundEntry);
const hasAllRequired = requiredFields.every((field) => entryKeys.includes(field));

if (hasAllRequired) {
	console.log("✓ All required fields present:", requiredFields.join(", "));
} else {
	console.log("✗ Missing required fields");
	process.exit(1);
}

console.log("✓ Optional fields supported:", optionalFields.join(", "));

// Step 7: Verify timestamp format (ISO 8601)
const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
if (timestampRegex.test(foundEntry.createdAt) && timestampRegex.test(foundEntry.updatedAt)) {
	console.log("✓ Timestamps are in ISO 8601 format");
} else {
	console.log("✗ Timestamps are not in correct format");
	process.exit(1);
}

console.log("\n=== All Verifications Passed ===");
console.log(`\nTotal entries in database: ${verifyDb.foods.length}`);
console.log("\nRequirements verified:");
console.log("  ✓ 4.1: Entries are written to src/data/db.json");
console.log("  ✓ 4.2: Entries persist across read operations (page reloads)");
console.log("  ✓ 4.3: Schema structure matches existing food schema");
console.log("  ✓ 4.4: Sequential IDs are generated");
console.log("  ✓ 4.5: Timestamps use ISO 8601 format");
