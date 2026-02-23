import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Responsive Layout Verification Tests for Matrix Food Tracker
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 * 
 * This test suite verifies that the Matrix route implements proper responsive
 * layout behavior by checking the presence of responsive Tailwind CSS classes
 * in the implementation:
 * - Mobile: Stacked form fields (single column)
 * - Desktop: Grid form layout (multi-column)
 * - Food list adapts to screen width
 * - Matrix theme consistency across all screen sizes
 */

describe("Matrix Route - Responsive Layout Verification", () => {
	// Read the matrix route file content
	const matrixRouteContent = readFileSync(
		join(process.cwd(), "src/routes/matrix.tsx"),
		"utf-8",
	);

	// Helper to check if a class pattern exists in the file
	const hasClass = (className: string): boolean => {
		return matrixRouteContent.includes(className);
	};

	// Helper to check if multiple classes exist together
	const hasClasses = (...classNames: string[]): boolean => {
		return classNames.every((className) => hasClass(className));
	};

	describe("Requirement 6.1: Responsive Tailwind CSS classes", () => {
		it("should use responsive container with proper padding", () => {
			// Verify container uses responsive classes
			expect(hasClass("container")).toBe(true);
			expect(hasClass("mx-auto")).toBe(true);
			expect(hasClass("px-4")).toBe(true);
		});

		it("should use responsive grid layout for main content", () => {
			// Verify main content uses responsive grid
			expect(hasClasses("grid", "grid-cols-1", "lg:grid-cols-2")).toBe(true);
		});

		it("should use responsive text sizes for header", () => {
			// Verify header uses responsive text sizes
			expect(hasClasses("text-4xl", "md:text-5xl")).toBe(true);
		});

		it("should use max-width constraint for content", () => {
			// Verify content has max-width for better readability
			expect(hasClass("max-w-7xl")).toBe(true);
		});
	});

	describe("Requirement 6.2: Mobile viewport - stacked form fields", () => {
		it("should have base single-column layout for mobile", () => {
			// Verify form grids start with single column (mobile-first)
			expect(hasClass("grid-cols-1")).toBe(true);
		});

		it("should have all required form fields present", () => {
			// Verify all required fields are in the markup
			expect(hasClass('name="name"')).toBe(true);
			expect(hasClass('name="category"')).toBe(true);
			expect(hasClass('name="quantity"')).toBe(true);
			expect(hasClass('name="unit"')).toBe(true);
		});

		it("should have optional nutritional fields present", () => {
			// Verify optional fields are in the markup
			expect(hasClass('name="calories"')).toBe(true);
			expect(hasClass('name="protein"')).toBe(true);
			expect(hasClass('name="carbs"')).toBe(true);
			expect(hasClass('name="fat"')).toBe(true);
		});

		it("should have full-width submit button", () => {
			// Verify submit button is full width
			expect(hasClass("w-full")).toBe(true);
		});

		it("should stack form sections vertically with proper spacing", () => {
			// Verify form uses vertical spacing
			expect(hasClass("space-y-4")).toBe(true);
		});
	});

	describe("Requirement 6.3: Desktop viewport - grid form layout", () => {
		it("should use responsive grid layout for form fields", () => {
			// Verify form fields use responsive grid (mobile-first, then desktop)
			expect(hasClasses("grid", "grid-cols-1", "md:grid-cols-2")).toBe(true);
		});

		it("should span name field across full width on desktop", () => {
			// Verify name field spans 2 columns on medium+ screens
			expect(hasClass("md:col-span-2")).toBe(true);
		});

		it("should arrange nutritional fields in 2-column grid on desktop", () => {
			// Verify nutritional section has 2-column grid on desktop
			const nutritionalSectionPattern = /NUTRITIONAL INFO.*?grid.*?md:grid-cols-2/s;
			expect(nutritionalSectionPattern.test(matrixRouteContent)).toBe(true);
		});

		it("should display form and list side-by-side on desktop", () => {
			// Verify main layout uses 2-column grid on large screens
			expect(hasClasses("grid", "grid-cols-1", "lg:grid-cols-2")).toBe(true);
		});

		it("should have proper gap spacing between sections", () => {
			// Verify sections have proper gap
			expect(hasClass("gap-8")).toBe(true);
		});
	});

	describe("Requirement 6.4: Food list adapts to screen width", () => {
		it("should have food list section structure", () => {
			// Verify food list section exists with proper structure
			expect(hasClass("FOOD DATABASE")).toBe(true);
		});

		it("should use vertical spacing for food items", () => {
			// Verify food items use vertical spacing
			expect(hasClass("space-y-4")).toBe(true);
		});

		it("should display nutritional info in 2-column grid within food cards", () => {
			// Verify food cards use 2-column grid for nutritional info
			expect(hasClass("grid-cols-2")).toBe(true);
		});

		it("should have responsive padding in food cards", () => {
			// Verify food cards have proper padding
			expect(hasClass("p-4")).toBe(true);
		});

		it("should maintain readability with proper text sizing", () => {
			// Verify text sizes are appropriate
			expect(hasClass("text-lg")).toBe(true); // Food name
			expect(hasClass("text-sm")).toBe(true); // Details
			expect(hasClass("text-xs")).toBe(true); // Metadata
		});
	});

	describe("Requirement 6.5: Matrix theme consistency across screen sizes", () => {
		it("should maintain black background", () => {
			// Verify black background is applied
			expect(hasClass("bg-black")).toBe(true);
		});

		it("should maintain green text color", () => {
			// Verify green text color is applied
			expect(hasClass("text-[#00FF00]")).toBe(true);
		});

		it("should maintain monospace font", () => {
			// Verify monospace font is applied
			expect(hasClass("font-mono")).toBe(true);
		});

		it("should maintain green borders on form elements", () => {
			// Verify form inputs have green borders
			expect(hasClass("border-[#00FF00]")).toBe(true);
		});

		it("should maintain green borders on sections", () => {
			// Verify sections have green borders
			const sectionPattern = /<section[^>]*className="[^"]*border[^"]*border-\[#00FF00\]/;
			expect(sectionPattern.test(matrixRouteContent)).toBe(true);
		});

		it("should maintain Matrix theme on buttons", () => {
			// Verify button has Matrix theme (green background, black text)
			expect(hasClass("bg-[#00FF00]")).toBe(true);
			expect(hasClass("text-black")).toBe(true);
		});

		it("should maintain hover effects with Matrix theme", () => {
			// Verify hover effects maintain theme
			expect(hasClass("hover:bg-[#00DD00]")).toBe(true);
			expect(hasClass("hover:bg-[#00FF00]/5")).toBe(true);
		});

		it("should maintain focus styles with Matrix theme", () => {
			// Verify focus styles use green ring
			expect(hasClass("focus:ring-[#00FF00]")).toBe(true);
		});
	});

	describe("Additional responsive behavior verification", () => {
		it("should have proper container spacing", () => {
			// Verify container has proper padding
			expect(hasClasses("px-4", "py-8")).toBe(true);
		});

		it("should have responsive gap between sections", () => {
			// Verify sections have proper gap
			expect(hasClass("gap-8")).toBe(true);
		});

		it("should have responsive header text", () => {
			// Verify header uses responsive text sizing
			expect(hasClasses("text-4xl", "md:text-5xl")).toBe(true);
		});

		it("should have responsive subtitle text", () => {
			// Verify subtitle uses responsive text sizing
			expect(hasClasses("text-sm", "md:text-base")).toBe(true);
		});

		it("should use min-height for full-screen layout", () => {
			// Verify layout uses min-height for full screen
			expect(hasClass("min-h-screen")).toBe(true);
		});

		it("should have proper form field spacing", () => {
			// Verify form fields have proper spacing
			expect(hasClass("gap-4")).toBe(true);
		});

		it("should have rounded corners on interactive elements", () => {
			// Verify elements have rounded corners
			expect(hasClass("rounded")).toBe(true);
			expect(hasClass("rounded-lg")).toBe(true);
		});

		it("should have transition effects for smooth interactions", () => {
			// Verify transition effects are applied
			expect(hasClass("transition-colors")).toBe(true);
		});
	});
});
