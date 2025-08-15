// This script should be run in the browser console to clear UI config cache
console.log('Clearing UI config cache...');
localStorage.removeItem('ui-config-storage');
console.log('✅ UI config cache cleared. Please refresh the page.');