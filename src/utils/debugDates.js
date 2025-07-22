/**
 * Debug script to log date information
 */

// Add this to the top of TaskManager.js to debug date issues
export function debugDate(dateStr, label = 'Date') {
  console.log(`[DEBUG] ${label}:`, dateStr);
  
  try {
    // Parse as ISO date
    const date = new Date(dateStr);
    console.log(`[DEBUG] Parsed as Date:`, date.toString());
    console.log(`[DEBUG] ISO string:`, date.toISOString());
    console.log(`[DEBUG] Local string:`, date.toLocaleString());
    
    // Get components
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    console.log(`[DEBUG] Components:`, { year, month, day });
    
    // Get date part
    const datePart = dateStr.split('T')[0];
    console.log(`[DEBUG] Date part:`, datePart);
    
    // Split into components
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    console.log(`[DEBUG] String components:`, { yearStr, monthStr, dayStr });
  } catch (err) {
    console.error(`[DEBUG] Error parsing date:`, err);
  }
  
  console.log('-------------------');
}