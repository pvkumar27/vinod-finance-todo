# Date Formatting Fixes

## Issues Fixed

1. **Due Date Default Value**: Fixed the issue where the due date was defaulting to tomorrow's date instead of today's date.

2. **Today Button**: Fixed the Today button to correctly set today's date.

3. **Date Display in Cards**: Fixed the date display in cards to show the correct date without timezone issues.

4. **Date Display in Table View**: Fixed the date display in the table view to show the correct date without timezone issues.

5. **Date Display in Drag Overlay**: Fixed the date display in the drag overlay to show the correct date without timezone issues.

## Implementation Details

### Date Utility Functions

Created a new utility file `src/utils/dateUtils.js` with two functions:

1. `getTodayDateString()`: Returns today's date in YYYY-MM-DD format using local time.
2. `formatDateString(dateStr)`: Formats a date string in YYYY-MM-DD format to MM/DD/YYYY format.

### Date Handling in TaskManager.js

- Updated all places that were using `new Date().toISOString().split('T')[0]` to use `getTodayDateString()` instead.
- Updated all places that were using `new Date(todo.due_date).toLocaleDateString()` to use `formatDateString(todo.due_date)` instead.

### Date Handling in TaskItem.js

- Updated the date formatting in TaskItem.js to use the `formatDateString()` function.

## Root Cause

The issue was caused by timezone differences between:

1. How dates were being stored (in ISO format with UTC timezone)
2. How dates were being displayed (using local timezone)
3. How dates were being input (using local timezone)

By using consistent date formatting functions throughout the application, we ensure that dates are displayed correctly regardless of the timezone.