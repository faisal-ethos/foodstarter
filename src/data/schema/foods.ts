import { z } from "zod";

export const foodSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required").max(100),
	category: z.string().min(1, "Category is required"),
	quantity: z.number().int().positive("Quantity must be positive").default(1),
	unit: z.string().min(1, "Unit is required").default("piece"),
	calories: z.number().optional(),
	protein: z.number().optional(),
	carbs: z.number().optional(),
	fat: z.number().optional(),
	notes: z.string().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const insertFoodSchema = foodSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

export const updateFoodSchema = insertFoodSchema.partial();

export type Food = z.infer<typeof foodSchema>;
export type NewFood = z.infer<typeof insertFoodSchema>;
export type UpdateFood = z.infer<typeof updateFoodSchema>;
