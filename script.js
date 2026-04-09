document.addEventListener('DOMContentLoaded', () => {
    const storeInput = document.getElementById('store-image');
    const storePreview = document.getElementById('store-preview');
    const runAuditBtn = document.getElementById('run-audit-btn');
    const resultBox = document.getElementById('result-box');

    // Feature 1: Image Previews
    function attachPreviewListener(inputElement, previewContainer) {
        inputElement.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                previewContainer.innerHTML = '';
            }
        });
    }

    attachPreviewListener(storeInput, storePreview);

    // Feature 2: API Call
    runAuditBtn.addEventListener('click', async () => {
        // Validation
        if (storeInput.files.length === 0) {
            alert('Please select the Store Execution Photo.');
            return;
        }

        // Set Loading State
        runAuditBtn.disabled = true;
        runAuditBtn.textContent = 'Analyzing...';
        resultBox.value = 'Connecting to AI model. This may take a few seconds...';

        const formData = new FormData();
        formData.append('store_image', storeInput.files[0]);

        // Production Render URL Placeholder
        const apiUrl = 'https://ai-visual-merchandising.onrender.com';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            resultBox.value = data.ai_report || 'No content generated.';
        } catch (error) {
            resultBox.value = `Error running audit: ${error.message}\n\nPlease verify that your Render backend is deployed correctly and active.`;
        } finally {
            // Re-enable interface
            runAuditBtn.disabled = false;
            runAuditBtn.textContent = 'Run AI Visual Audit';
        }
    });
});