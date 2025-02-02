import { initializeGDocsTracker } from './gdocs-main.js';

console.log("[Main] Initializing Enhanced Text Tracker...");

const canRun = localStorage.getItem('canFactfulRun') !== 'false';
if (canRun) {
    console.log('[Main] Factful is enabled, initializing tracker...');
    initializeGDocsTracker();
} else {
    console.log('[Main] Factful is disabled for Google Docs');
}