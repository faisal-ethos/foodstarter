import fs from "node:fs/promises";
import path from "node:path";
import type { Food, NewFood, UpdateFood } from "../schema/foods";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

interface Database {
	foods: Food[];
}

async function readDatabase(): Promise<Database> {
	try {
		const data = await fs.readFile(DB_PATH, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		return { foods: [] };
	}
}

async function writeDatabase(db: Database): Promise<void> {
	await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function getAllFoods(): Promise<Food[]> {
	const db = await readDatabase();
	return db.foods.sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

export async function getFoodById(id: number): Promise<Food | undefined> {
	const db = await readDatabase();
	return db.foods.find((food) => food.id === id);
}

export async function createFood(data: NewFood): Promise<Food> {
	const db = await readDatabase();

	const newFood: Food = {
		...data,
		id: db.foods.length > 0 ? Math.max(...db.foods.map((f) => f.id)) + 1 : 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	db.foods.push(newFood);
	await writeDatabase(db);

	return newFood;
}

export async function updateFood(
	id: number,
	data: UpdateFood,
): Promise<Food | undefined> {
	const db = await readDatabase();
	const index = db.foods.findIndex((food) => food.id === id);

	if (index === -1) {
		return undefined;
	}

	db.foods[index] = {
		...db.foods[index],
		...data,
		updatedAt: new Date().toISOString(),
	};

	await writeDatabase(db);
	return db.foods[index];
}

export async function deleteFood(id: number): Promise<boolean> {
	const db = await readDatabase();
	const initialLength = db.foods.length;

	db.foods = db.foods.filter((food) => food.id !== id);

	if (db.foods.length === initialLength) {
		return false;
	}

	await writeDatabase(db);
	return true;
}
