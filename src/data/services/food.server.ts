import { createServerFn } from "@tanstack/react-start";
import type { NewFood, UpdateFood } from "../schema/foods";
import { insertFoodSchema, updateFoodSchema } from "../schema/foods";
import {
	getAllFoods,
	getFoodById,
	createFood,
	updateFood,
	deleteFood,
} from "./food.service";

export const getFoodsServerFn = createServerFn({
	method: "GET",
}).handler(async () => {
	try {
		return await getAllFoods();
	} catch (error) {
		throw new Error("Failed to fetch foods");
	}
});

export const getFoodByIdServerFn = createServerFn({
	method: "GET",
}).handler(async (ctx) => {
	try {
		const id = ctx.data as unknown as number;
		const food = await getFoodById(id);
		if (!food) {
			throw new Error("Food not found");
		}
		return food;
	} catch (error) {
		throw new Error("Failed to fetch food");
	}
});

export const createFoodServerFn = createServerFn({
	method: "POST",
}).handler(async (ctx) => {
	try {
		console.log("Received data:", ctx.data);
		const validated = insertFoodSchema.parse(ctx.data);
		return await createFood(validated);
	} catch (error) {
		console.error("Error creating food:", error);
		if (error instanceof Error) {
			throw new Error(`Failed to create food: ${error.message}`);
		}
		throw error;
	}
});

export const updateFoodServerFn = createServerFn({
	method: "POST",
}).handler(async (ctx) => {
	try {
		const payload = ctx.data as unknown as { id: number; data: UpdateFood };
		const validated = updateFoodSchema.parse(payload.data);
		const updated = await updateFood(payload.id, validated);
		if (!updated) {
			throw new Error("Food not found");
		}
		return updated;
	} catch (error) {
		throw new Error("Failed to update food");
	}
});

export const deleteFoodServerFn = createServerFn({
	method: "POST",
}).handler(async (ctx) => {
	try {
		const id = ctx.data as unknown as number;
		const deleted = await deleteFood(id);
		if (!deleted) {
			throw new Error("Food not found");
		}
		return { success: true };
	} catch (error) {
		throw new Error("Failed to delete food");
	}
});
