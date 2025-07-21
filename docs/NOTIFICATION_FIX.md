# Daily Notifications Enhancement

## Issues Fixed

1. **Timezone Issue**: The daily notifications were using server timezone (UTC) to determine "today's" tasks, causing inconsistencies for users in different timezones.

2. **Limited Task Scope**: Notifications only included tasks due today, missing overdue tasks that still need attention.

## Changes Made

### 1. Timezone Fix

- Added proper timezone handling using America/Chicago (Central Time) to match the 8:00 AM CT schedule
- Implemented a robust date range calculation that works correctly regardless of server timezone
- Added detailed logging to help diagnose any future timezone issues

### 2. Enhanced Task Coverage

- Modified the query to include all pending tasks (both due today AND overdue)
- Changed from `dueDate >= startTimestamp && dueDate <= endTimestamp` to just `dueDate <= endTimestamp`
- Updated notification text to say "Due Today & Overdue" instead of just "Today"

### 3. Improved Error Handling

- Added collection existence check before querying
- Enhanced logging for better troubleshooting
- Added detailed task information in logs

## Testing

You can test the notification function locally with:

```bash
# Test with URL encoded API key
curl -X POST "https://us-central1-finance-to-dos.cloudfunctions.net/sendDailyTaskReminders?key=YOUR_API_KEY&sendPush=true"
```

## Debugging Tools

Two debugging scripts are included to help diagnose notification issues:

1. `check-todos.js` - Lists all todos in the database with their due dates
2. `debug-tasks.js` - Specifically checks for tasks due today with timezone information