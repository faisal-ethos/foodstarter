import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { insertFoodSchema } from "@/data/schema/foods";
import {
	createFoodServerFn,
	getFoodsServerFn,
	updateFoodServerFn,
	deleteFoodServerFn,
} from "@/data/services/food.server";
import { MatrixRain } from "@/components/MatrixRain";

export const Route = createFileRoute("/matrix")({
	component: MatrixRoute,
	loader: async () => {
		const foods = await getFoodsServerFn();
		return { foods };
	},
	pendingComponent: () => (
		<div className="min-h-screen bg-black text-[#00FF00] font-mono flex items-center justify-center">
			<div className="text-center">
				<p className="text-2xl animate-pulse">[LOADING] Accessing Matrix...</p>
				<p className="text-sm opacity-70 mt-2">Initializing food database...</p>
			</div>
		</div>
	),
	errorComponent: ({ error }) => (
		<div className="min-h-screen bg-black text-red-500 font-mono flex items-center justify-center">
			<div className="text-center border border-red-500 p-8 rounded-lg max-w-2xl">
				<p className="text-2xl font-bold mb-4">[SYSTEM ERROR]</p>
				<p className="text-sm mb-4">Failed to load food database</p>
				<p className="text-xs opacity-70 font-mono bg-black/50 p-4 rounded">
					{error.message}
				</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-6 px-6 py-2 border border-red-500 hover:bg-red-500/10 transition-colors rounded"
				>
					{'>'} RETRY CONNECTION
				</button>
			</div>
		</div>
	),
});

function MatrixRoute() {
	const { foods } = Route.useLoaderData();
	const router = useRouter();
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});
	const [submissionError, setSubmissionError] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setValidationErrors({});
		setSubmissionError("");
		setSuccessMessage("");

		const formData = new FormData(e.currentTarget);

		// Parse form data into the correct types
		const data = {
			name: formData.get("name") as string,
			category: formData.get("category") as string,
			quantity: Number(formData.get("quantity")),
			unit: formData.get("unit") as string,
			calories: formData.get("calories")
				? Number(formData.get("calories"))
				: undefined,
			protein: formData.get("protein")
				? Number(formData.get("protein"))
				: undefined,
			carbs: formData.get("carbs") ? Number(formData.get("carbs")) : undefined,
			fat: formData.get("fat") ? Number(formData.get("fat")) : undefined,
			notes: formData.get("notes") as string | undefined,
		};

		// Validate using Zod schema
		const result = insertFoodSchema.safeParse(data);

		if (!result.success) {
			// Extract validation errors
			const errors: Record<string, string> = {};
			result.error.errors.forEach((err) => {
				const path = err.path.join(".");
				errors[path] = err.message;
			});
			setValidationErrors(errors);
			return;
		}

		// If validation passes, submit to server
		setIsSubmitting(true);
		try {
			if (editingId !== null) {
				// Update existing food
				// @ts-expect-error - TanStack Start server function types need configuration
				await updateFoodServerFn({ data: { id: editingId, data: result.data } });
				setSuccessMessage("[SUCCESS] Food entry updated in database");
				setEditingId(null);
			} else {
				// Create new food
				// @ts-expect-error - TanStack Start server function types need configuration
				await createFoodServerFn({ data: result.data });
				setSuccessMessage("[SUCCESS] Food entry added to database");
			}

			// Success: clear form and show success message
			formRef.current?.reset();

			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(""), 3000);

			// Trigger food list refresh by invalidating the route
			await router.invalidate();
		} catch (error) {
			// Handle error: display error message in Matrix theme
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setSubmissionError(`[SYSTEM ERROR] ${errorMessage}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (food: typeof foods[0]) => {
		setEditingId(food.id);
		setValidationErrors({});
		setSubmissionError("");
		setSuccessMessage("");

		// Populate form with food data
		if (formRef.current) {
			const form = formRef.current;
			(form.elements.namedItem("name") as HTMLInputElement).value = food.name;
			(form.elements.namedItem("category") as HTMLInputElement).value = food.category;
			(form.elements.namedItem("quantity") as HTMLInputElement).value = String(food.quantity);
			(form.elements.namedItem("unit") as HTMLInputElement).value = food.unit;
			(form.elements.namedItem("calories") as HTMLInputElement).value = food.calories !== undefined ? String(food.calories) : "";
			(form.elements.namedItem("protein") as HTMLInputElement).value = food.protein !== undefined ? String(food.protein) : "";
			(form.elements.namedItem("carbs") as HTMLInputElement).value = food.carbs !== undefined ? String(food.carbs) : "";
			(form.elements.namedItem("fat") as HTMLInputElement).value = food.fat !== undefined ? String(food.fat) : "";
			(form.elements.namedItem("notes") as HTMLTextAreaElement).value = food.notes || "";
		}

		// Scroll to form
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id: number) => {
		if (!confirm("[CONFIRM] Delete this food entry from the database?")) {
			return;
		}

		setIsSubmitting(true);
		setSubmissionError("");
		setSuccessMessage("");

		try {
			// @ts-expect-error - TanStack Start server function types need configuration
			await deleteFoodServerFn({ data: id });
			setSuccessMessage("[SUCCESS] Food entry deleted from database");

			// Clear success message after 3 seconds
			setTimeout(() => setSuccessMessage(""), 3000);

			// Trigger food list refresh by invalidating the route
			await router.invalidate();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			setSubmissionError(`[SYSTEM ERROR] ${errorMessage}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setValidationErrors({});
		setSubmissionError("");
		formRef.current?.reset();
	};

	return (
		<div className="min-h-screen bg-black text-[#00FF00] font-mono relative">
			{/* Matrix Rain Background */}
			<MatrixRain />

			{/* Content with higher z-index */}
			<div className="relative" style={{ zIndex: 1 }}>
				<div className="container mx-auto px-4 py-8 max-w-7xl">
					{/* Header Section */}
					<header className="mb-8 text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-wider">
							MATRIX FOOD TRACKER
						</h1>
						<p className="text-sm md:text-base opacity-80">
							[SYSTEM ONLINE] - TRACKING PROTOCOL ACTIVE
						</p>
					</header>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Food Entry Form */}
						<section className="border border-[#00FF00] p-6 rounded-lg">
							<h2 className="text-2xl font-bold mb-4">
								{'>'} {editingId !== null ? "EDIT ENTRY" : "ADD ENTRY"}
							</h2>

							{/* Success Message */}
							{successMessage && (
								<div className="mb-4 p-3 border border-[#00FF00] bg-[#00FF00]/10 rounded">
									<p className="text-[#00FF00] font-mono text-sm">
										{successMessage}
									</p>
								</div>
							)}

							{/* Error Message */}
							{submissionError && (
								<div className="mb-4 p-3 border border-red-500 bg-red-500/10 rounded">
									<p className="text-red-500 font-mono text-sm">
										{submissionError}
									</p>
								</div>
							)}

							<form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
								{/* Required Fields Section */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Name Field */}
									<div className="md:col-span-2">
										<label htmlFor="name" className="block text-sm mb-1">
											NAME *
										</label>
										<input
											type="text"
											id="name"
											name="name"
											maxLength={100}
											required
											className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
											placeholder="Enter food name"
										/>
										{validationErrors.name && (
											<p className="text-red-500 text-xs mt-1 font-mono">
												[ERROR] {validationErrors.name}
											</p>
										)}
									</div>

									{/* Category Field */}
									<div>
										<label htmlFor="category" className="block text-sm mb-1">
											CATEGORY *
										</label>
										<input
											type="text"
											id="category"
											name="category"
											required
											className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
											placeholder="e.g., Fruit, Vegetable"
										/>
										{validationErrors.category && (
											<p className="text-red-500 text-xs mt-1 font-mono">
												[ERROR] {validationErrors.category}
											</p>
										)}
									</div>

									{/* Quantity Field */}
									<div>
										<label htmlFor="quantity" className="block text-sm mb-1">
											QUANTITY *
										</label>
										<input
											type="number"
											id="quantity"
											name="quantity"
											min="1"
											step="1"
											defaultValue={1}
											required
											className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
										/>
										{validationErrors.quantity && (
											<p className="text-red-500 text-xs mt-1 font-mono">
												[ERROR] {validationErrors.quantity}
											</p>
										)}
									</div>

									{/* Unit Field */}
									<div className="md:col-span-2">
										<label htmlFor="unit" className="block text-sm mb-1">
											UNIT *
										</label>
										<input
											type="text"
											id="unit"
											name="unit"
											defaultValue="piece"
											required
											className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
											placeholder="e.g., piece, gram, cup"
										/>
										{validationErrors.unit && (
											<p className="text-red-500 text-xs mt-1 font-mono">
												[ERROR] {validationErrors.unit}
											</p>
										)}
									</div>
								</div>

								{/* Optional Nutritional Fields Section */}
								<div className="border-t border-[#00FF00] pt-4 mt-4">
									<h3 className="text-sm font-bold mb-3 opacity-80">
										NUTRITIONAL INFO (OPTIONAL)
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Calories Field */}
										<div>
											<label htmlFor="calories" className="block text-sm mb-1">
												CALORIES
											</label>
											<input
												type="number"
												id="calories"
												name="calories"
												min="0"
												step="0.1"
												className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
												placeholder="kcal"
											/>
										</div>

										{/* Protein Field */}
										<div>
											<label htmlFor="protein" className="block text-sm mb-1">
												PROTEIN
											</label>
											<input
												type="number"
												id="protein"
												name="protein"
												min="0"
												step="0.1"
												className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
												placeholder="grams"
											/>
										</div>

										{/* Carbs Field */}
										<div>
											<label htmlFor="carbs" className="block text-sm mb-1">
												CARBS
											</label>
											<input
												type="number"
												id="carbs"
												name="carbs"
												min="0"
												step="0.1"
												className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
												placeholder="grams"
											/>
										</div>

										{/* Fat Field */}
										<div>
											<label htmlFor="fat" className="block text-sm mb-1">
												FAT
											</label>
											<input
												type="number"
												id="fat"
												name="fat"
												min="0"
												step="0.1"
												className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono"
												placeholder="grams"
											/>
										</div>
									</div>
								</div>

								{/* Notes Field */}
								<div>
									<label htmlFor="notes" className="block text-sm mb-1">
										NOTES (OPTIONAL)
									</label>
									<textarea
										id="notes"
										name="notes"
										rows={3}
										className="w-full bg-black border border-[#00FF00] text-[#00FF00] px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00FF00] font-mono resize-none"
										placeholder="Additional information..."
									/>
								</div>

								{/* Submit Button */}
								<div className="flex gap-2">
									<button
										type="submit"
										disabled={isSubmitting}
										className="flex-1 bg-[#00FF00] text-black font-bold py-3 px-6 rounded hover:bg-[#00DD00] transition-colors duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSubmitting ? "> PROCESSING..." : editingId !== null ? "> UPDATE ENTRY" : "> SUBMIT ENTRY"}
									</button>
									{editingId !== null && (
										<button
											type="button"
											onClick={handleCancelEdit}
											disabled={isSubmitting}
											className="px-6 py-3 border border-[#00FF00] text-[#00FF00] font-bold rounded hover:bg-[#00FF00]/10 transition-colors duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
										>
											CANCEL
										</button>
									)}
								</div>
							</form>
						</section>

						{/* Food List Display */}
						<section className="border border-[#00FF00] p-6 rounded-lg">
							<h2 className="text-2xl font-bold mb-4">{'>'} FOOD DATABASE</h2>

							{/* Data Display */}
							{foods.length > 0 && (
								<div className="space-y-4">
									<p className="text-sm opacity-70 mb-4">
										[{foods.length} ENTRIES FOUND]
									</p>
									{foods.map((food) => (
										<div
											key={food.id}
											className="border border-[#00FF00] p-4 rounded hover:bg-[#00FF00]/5 transition-colors"
										>
											<div className="flex justify-between items-start mb-2">
												<h3 className="text-lg font-bold">{food.name}</h3>
												<span className="text-xs opacity-70">
													ID: {food.id}
												</span>
											</div>
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="opacity-70">CATEGORY:</span> {food.category}
												</div>
												<div>
													<span className="opacity-70">QUANTITY:</span> {food.quantity} {food.unit}
												</div>
												{food.calories !== undefined && (
													<div>
														<span className="opacity-70">CALORIES:</span> {food.calories} kcal
													</div>
												)}
												{food.protein !== undefined && (
													<div>
														<span className="opacity-70">PROTEIN:</span> {food.protein}g
													</div>
												)}
												{food.carbs !== undefined && (
													<div>
														<span className="opacity-70">CARBS:</span> {food.carbs}g
													</div>
												)}
												{food.fat !== undefined && (
													<div>
														<span className="opacity-70">FAT:</span> {food.fat}g
													</div>
												)}
											</div>
											{food.notes && (
												<div className="mt-2 pt-2 border-t border-[#00FF00]/30">
													<p className="text-xs opacity-70">NOTES:</p>
													<p className="text-sm">{food.notes}</p>
												</div>
											)}
											<div className="mt-2 text-xs opacity-50">
												CREATED: {new Date(food.createdAt).toLocaleString()}
											</div>

											{/* Action Buttons */}
											<div className="mt-3 pt-3 border-t border-[#00FF00]/30 flex gap-2">
												<button
													type="button"
													onClick={() => handleEdit(food)}
													disabled={isSubmitting}
													className="flex-1 px-4 py-2 border border-[#00FF00] text-[#00FF00] font-mono text-sm rounded hover:bg-[#00FF00]/10 transition-colors duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{'>'} EDIT
												</button>
												<button
													type="button"
													onClick={() => handleDelete(food.id)}
													disabled={isSubmitting}
													className="flex-1 px-4 py-2 border border-red-500 text-red-500 font-mono text-sm rounded hover:bg-red-500/10 transition-colors duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{'>'} DELETE
												</button>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Empty State */}
							{foods.length === 0 && (
								<div className="text-center py-8">
									<p className="text-xl opacity-70">
										NO FOOD ENTRIES DETECTED
									</p>
									<p className="text-sm opacity-50 mt-2">
										[DATABASE EMPTY] - Add your first entry
									</p>
								</div>
							)}
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
