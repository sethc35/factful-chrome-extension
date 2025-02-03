import { initializeGDocsTracker } from './gdocs-main.js';



const canRun = localStorage.getItem('canFactfulRun') !== 'false';
if (canRun) {
    
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: (input) => input
        });
    }
    initializeGDocsTracker();
} else {
    
}