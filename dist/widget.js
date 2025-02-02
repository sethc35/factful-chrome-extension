
function debug(message) {
    console.log(message);
    const debugDiv = document.getElementById('debugOutput');
    
}


document.addEventListener('DOMContentLoaded', () => {
    debug('Widget initialized');

  
    document.querySelectorAll('.option-button').forEach(button => {
        button.addEventListener('click', (e) => {
            debug(`Direct button click detected on: ${e.target.textContent}`);
         
            const group = e.target.closest('.button-group');
            debug(`Parent group found: ${group.className}`);

           
            group.querySelectorAll('.option-button').forEach(btn => {
                btn.classList.remove('active');
                debug(`Removed active class from: ${btn.textContent}`);
            });

           
            e.target.classList.add('active');
            debug(`Added active class to: ${e.target.textContent}`);
        });
    });


    document.querySelectorAll('.button-group').forEach(group => {
        group.addEventListener('click', (e) => {
            debug(`Group click detected on: ${group.className}`);
            
            if (e.target.classList.contains('option-button')) {
                debug(`Valid button click in group: ${e.target.textContent}`);
            } else {
                debug(`Click was not on a button: ${e.target.className}`);
            }
        });
    });

    document.querySelectorAll('.toggle-switch input').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            debug(`Toggle changed: ${e.target.checked}`);
        });
    });


    const slider = document.querySelector('.slider');
    slider.addEventListener('input', (e) => {
        debug(`Slider value changed to: ${e.target.value}`);
    });


    const languageSelect = document.querySelector('.language-select');
    languageSelect.addEventListener('change', (e) => {
        debug(`Language changed to: ${e.target.value}`);
    });


    document.querySelector('.widget-container').addEventListener('click', (e) => {
        debug(`Click detected on element: ${e.target.tagName} with classes: ${e.target.className}`);
    });

    document.querySelector('.slider').addEventListener('input', function () {
        const value = this.value; 
        const percentage = `${value}%`;
        this.style.setProperty('--slider-value', percentage);
    });
    
});