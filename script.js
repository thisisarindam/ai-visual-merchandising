document.addEventListener('DOMContentLoaded', () => {
    const storeInput = document.getElementById('store-image');
    const storePreview = document.getElementById('store-preview');
    const runAuditBtn = document.getElementById('run-audit-btn');
    const resultBox = document.getElementById('result-box');
    const themeToggleBtn = document.getElementById('theme-toggle');

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

    // Feature: Theme Toggle Logic
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggleBtn.textContent = '☀️ Light Mode';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    // Feature 3: Rich Text Formatter for AI Report
    function formatAIReport(text) {
        // Parse bold markdown
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Make the Score stand out visually
        html = html.replace(/(Score[:\-]?\s*)(\d+)/gi, '$1<span class="highlight-score">$2</span>');

        // Split text by double line breaks to treat them as distinct blocks
        let blocks = html.split(/\n\n+/);
        
        return blocks.map((block, index) => {
            let delay = index * 0.15; // Staggered animation effect
            
            if (/(^|\n)[*-] /.test(block)) {
                let listItems = block.trim().split('\n').map(line => `<li>${line.replace(/^[*-]\s+/, '').trim()}</li>`).join('');
                return `<ul class="animate-block" style="animation-delay: ${delay}s">${listItems}</ul>`;
            }
            
            // Wrap regular text blocks
            return `<div class="animate-block block-paragraph" style="animation-delay: ${delay}s">${block.replace(/\n/g, '<br>')}</div>`;
        }).join('');
    }

    // Feature 2: API Call
    runAuditBtn.addEventListener('click', async () => {
        // Validation
        if (storeInput.files.length === 0) {
            alert('Please select the Store Execution Photo.');
            return;
        }

        // Set Loading State
        runAuditBtn.disabled = true;
        runAuditBtn.classList.add('btn-loading');
        resultBox.innerHTML = '<div class="animate-block">Connecting to AI model. This may take a few seconds...</div>';

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
            
            // Format and display the rich animated content
            resultBox.innerHTML = data.ai_report ? formatAIReport(data.ai_report) : '<div class="animate-block">No content generated.</div>';
            
        } catch (error) {
            resultBox.innerHTML = `<div class="animate-block" style="color: #e53e3e;"><strong>Error running audit:</strong> ${error.message}<br><br>Please verify that your Render backend is deployed correctly and active.</div>`;
        } finally {
            // Re-enable interface
            runAuditBtn.disabled = false;
            runAuditBtn.classList.remove('btn-loading');
        }
    });
});