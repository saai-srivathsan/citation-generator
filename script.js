document.addEventListener('DOMContentLoaded', () => {
    const styleSelect = document.getElementById('citation-style');
    const generateButton = document.getElementById('generate');
    const citationElement = document.getElementById('citation');
    const bibliographyElement = document.getElementById('bibliography');

    // Function to load citation styles from server
    async function loadCitationStyles() {
        const stylesURL = 'http://127.0.0.1:7777/styles'; // URL to fetch list of styles
        try {
            const response = await fetch(stylesURL);
            const files = await response.json();

            files.forEach(file => {
                if (file.endsWith('.csl')) {
                    const option = document.createElement('option');
                    option.value = file;
                    option.textContent = file.replace('.csl', '').replace('-', ' ');
                    styleSelect.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error loading styles:', error);
        }
    }

    // Function to generate citation and bibliography
    generateButton.addEventListener('click', async () => {
        const doi = document.getElementById('doi').value;
        const style = styleSelect.value;

        if (!doi) {
            alert('Please enter a DOI number.');
            return;
        }

        try {
            // Request the server to generate the citation
            const response = await fetch(`http://127.0.0.1:7777/generate-citation?doi=${doi}&style=${style}`);
            const result = await response.json();

            // Display results
            citationElement.innerHTML = result.citation;
            bibliographyElement.innerHTML = result.bibliography;

        } catch (error) {
            console.error('Error generating citation:', error);
        }
    });

    // Load styles on page load
    loadCitationStyles();
});
