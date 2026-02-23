# Design Document: Matrix Food Tracker

## Overview

The Matrix Food Tracker feature introduces a themed route (`/matrix`) that provides an immersive retro-futuristic interface for food tracking. This design leverages the existing JSON file-based database system and food service layer while applying a distinctive Matrix aesthetic (green-on-black color scheme with monospace fonts).

The feature consists of three primary components:
1. **Matrix Route Component** - The main route handler at `/matrix` that orchestrates the themed interface
2. **Food Entry Form** - A form component for adding new food entries with validation
3. **Food List Display** - A component that displays all food entries sorted by creation date

This design maintains strict separation of concerns by reusing existing service layer logic and focusing solely on presentation and user interaction within the Matrix theme.

## Architecture

### Component Hierarchy

```
Matrix Route (/matrix)
├── Food Entry Form
│   ├── Form Fields (name, category, quantity, unit, nutritional info, notes)
│   ├── Validation Logic (client-side)
│   └── Submit Handler (calls createFoodServerFn)
└── Food List Display
    ├── Data Fetching (getFoodsServerFn)
    ├── Sorting Logic (newest first)
    └── Food Item Renderers
```

### Data Flow

1. **Read Flow**: Matrix Route → getFoodsServerFn → food.service.getAllFoods() → JSON file → sorted data → Food List Display
2. **Write Flow**: Food Entry Form → validation → createFoodServerFn → food.service.createFood() → JSON file → refresh Food List Display

### Integration Points

- **Existing Services**: Reuses `food.service.ts` and `food.server.ts` without modification
- **Existing Schema**: Uses `insertFoodSchema` from `foods.ts` for validation
- **Existing Types**: Uses `Food`, `NewFood` types for type safety
- **TanStack Router**: Integrates as a standard file-based route

## Components and Interfaces

### 1. Matrix Route Component

**File**: `src/routes/matrix.tsx`

**Purpose**: Main route component that provides the Matrix-themed container and orchestrates child components

**Key Responsibilities**:
- Apply Matrix theme styling (black background, green text, monospace font)
- Render Food Entry Form and Food List Display
- Handle responsive layout using Tailwind CSS grid/flex utilities
- Manage error boundaries for graceful error handling

**Styling Approach**:
- Background: `bg-black` (Tailwind v4)
- Text color: `text-[#00FF00]` (custom green)
- Font: `font-mono` (monospace)
- Layout: Responsive grid with mobile-first approach

**Props**: None (route component)

**State Management**: Uses TanStack Router's built-in state management for route-level data

### 2. Food Entry Form Component

**File**: `src/routes/matrix.tsx` (inline component or extracted to `src/components/MatrixFoodForm.tsx`)

**Purpose**: Collect and validate food entry data before submission

**Form Fields**:
```typescript
interface FormData {
  name: string;           // Required, max 100 chars
  category: string;       // Required
  quantity: number;       // Required, positive integer, default 1
  unit: string;           // Required, default "piece"
  calories?: number;      // Optional
  protein?: number;       // Optional
  carbs?: number;         // Optional
  fat?: number;           // Optional
  notes?: string;         // Optional
}
```

**Validation Strategy**:
- Client-side validation using Zod schema (`insertFoodSchema`)
- Display validation errors inline with Matrix theme styling
- Prevent submission if validation fails
- Server-side validation handled by `createFoodServerFn`

**Submission Flow**:
1. User fills form and clicks submit
2. Client validates using `insertFoodSchema.safeParse()`
3. If valid, call `createFoodServerFn` with form data
4. On success, clear form and trigger Food List refresh
5. On error, display error message in Matrix theme

**Responsive Behavior**:
- Mobile: Single column layout, stacked fields
- Tablet/Desktop: Two-column grid for better space utilization

### 3. Food List Display Component

**File**: `src/routes/matrix.tsx` (inline component or extracted to `src/components/MatrixFoodList.tsx`)

**Purpose**: Display all food entries in Matrix theme with sorting

**Data Fetching**:
- Uses `getFoodsServerFn` to retrieve all foods
- Leverages TanStack Router's loader pattern for SSR support
- Data is pre-sorted by service layer (newest first)

**Display Format**:
Each food entry shows:
- Name (prominent, larger text)
- Category (secondary text)
- Quantity + Unit (e.g., "2 pieces")
- Nutritional info (calories, protein, carbs, fat) - if available
- Notes (if available)
- Created date (formatted timestamp)

**Empty State**:
When no entries exist, display: "NO FOOD ENTRIES DETECTED" in Matrix theme

**Styling**:
- Each entry in a bordered container with green border
- Monospace font throughout
- Hover effects with subtle green glow
- Responsive card layout

## Data Models

### Food Entry Schema

The feature uses the existing `foodSchema` from `src/data/schema/foods.ts`:

```typescript
{
  id: number;              // Auto-generated sequential ID
  name: string;            // Required, 1-100 chars
  category: string;        // Required, min 1 char
  quantity: number;        // Required, positive integer, default 1
  unit: string;            // Required, default "piece"
  calories?: number;       // Optional nutritional info
  protein?: number;        // Optional nutritional info
  carbs?: number;          // Optional nutritional info
  fat?: number;           // Optional nutritional info
  notes?: string;          // Optional user notes
  createdAt: string;       // ISO 8601 timestamp, auto-generated
  updatedAt: string;       // ISO 8601 timestamp, auto-generated
}
```

### Database Structure

The JSON database at `src/data/db.json` follows this structure:

```typescript
{
  foods: Food[]  // Array of food entries
}
```

### Validation Schemas

**Insert Schema** (`insertFoodSchema`):
- Omits `id`, `createdAt`, `updatedAt` (auto-generated)
- Validates all required fields
- Applies default values for `quantity` and `unit`

**Update Schema** (`updateFoodSchema`):
- All fields optional (partial update support)
- Not used in this feature but available for future enhancements

