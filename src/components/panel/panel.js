/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', function() {
  
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
     
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.querySelector('.tab-icon').classList.remove('active');
            });

            
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            button.classList.add('active');
            button.querySelector('.tab-icon').classList.add('active');

    
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });


    const quickActionButtons = document.querySelectorAll('.quick-action-button');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('span').textContent.toLowerCase();
            
            chrome.runtime.sendMessage({
                type: 'quick_action',
                action: action
            });
        });
    });

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                
                chrome.runtime.sendMessage({
                    type: 'search',
                    query: this.value
                });
            }
        });
    }
});