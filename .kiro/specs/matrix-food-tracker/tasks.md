# Implementation Plan: Matrix Food Tracker

## Overview

This implementation plan breaks down the Matrix Food Tracker feature into discrete coding tasks. The feature adds a Matrix-themed route at `/matrix` that reuses existing food service layers while providing an immersive green-on-black interface for food tracking. All tasks build incrementally, with early validation through code and optional testing sub-tasks.

## Tasks

- [x] 1. Create Matrix route component with basic structure and theme
  - Create `src/routes/matrix.tsx` file
  - Set up route component with TanStack Router conventions
  - Apply Matrix theme styling (black background, green text, monospace font)
  - Add responsive container layout using Tailwind CSS
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.5_

- [x] 2. Implement Food Entry Form component
  - [x] 2.1 Create form structure with all required fields
    - Add input fields for name, category, quantity, unit
    - Add optional fields for calories, protein, carbs, fat, notes
    - Apply Matrix theme styling to form elements (green borders, black backgrounds)
    - Implement responsive layout (mobile: stacked, desktop: grid)
    - _Requirements: 2.1, 2.7, 6.2, 6.3_
  
  - [x] 2.2 Add client-side validation using insertFoodSchema
    - Import insertFoodSchema from existing schema
    - Validate form data before submission using Zod safeParse
    - Display validation errors inline with Matrix theme styling
    - Prevent submission when validation fails
    - _Requirements: 2.5, 2.6, 2.8, 5.1_
  
  - [x] 2.3 Implement form submission handler
    - Call createFoodServerFn with validated form data
    - Handle success: clear form and trigger list refresh
    - Handle errors: display error message in Matrix theme
    - _Requirements: 2.2, 2.3, 2.4, 2.8, 5.2_

- [x] 3. Checkpoint - Verify form functionality
  - Ensure form renders correctly with Matrix theme
  - Test form submission creates entries in JSON database
  - Ensure all tests pass, ask the user if questions arise

- [x] 4. Implement Food List Display component
  - [x] 4.1 Set up data fetching with server function
    - Call getFoodsServerFn to retrieve all food entries
    - Use TanStack Router loader pattern for SSR support
    - Handle loading and error states with Matrix theme
    - _Requirements: 3.1, 4.2, 5.3_
  
  - [x] 4.2 Create food entry display cards
    - Display name, category, quantity, unit for each entry
    - Show nutritional info (calories, protein, carbs, fat) when available
    - Display notes and created date with proper formatting
    - Apply Matrix theme styling (green borders, monospace font, hover effects)
    - _Requirements: 3.3, 3.4_
  
  - [x] 4.3 Implement sorting and empty state
    - Sort entries by creation date (newest first)
    - Display "NO FOOD ENTRIES DETECTED" message when list is empty
    - Apply Matrix theme to empty state message
    - _Requirements: 3.2, 3.5_
  
  - [x] 4.4 Add automatic list refresh on form submission
    - Trigger list re-fetch after successful form submission
    - Ensure new entries appear at top of list
    - _Requirements: 2.4, 3.6_

- [x] 5. Verify data persistence and service integration
  - [x] 5.1 Confirm JSON database operations
    - Verify entries are written to src/data/db.json
    - Verify entries persist across page reloads
    - Confirm schema structure matches existing food schema
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.2 Validate service layer integration
    - Confirm no duplication of service layer logic
    - Verify correct usage of Food and NewFood types
    - Ensure createFoodServerFn and getFoodsServerFn are used correctly
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Final responsive layout verification
  - Test layout on mobile viewport (stacked form fields)
  - Test layout on desktop viewport (grid form layout)
  - Verify food list adapts to screen width
  - Confirm Matrix theme consistency across all screen sizes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Final checkpoint - Complete feature validation
  - Ensure all tests pass, ask the user if questions arise
  - Verify Matrix route is accessible at /matrix
  - Confirm all requirements are met

## Notes

- All tasks reference specific requirements for traceability
- The feature reuses existing service layer without modifications
- Matrix theme uses #000000 (black) background and #00FF00 (green) text
- Checkpoints ensure incremental validation throughout implementation
- No optional testing tasks included as this is a UI-focused feature
