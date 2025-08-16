$(document).ready(function() {
    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night");
    editor.session.setMode("ace/mode/html");
    editor.session.setUseWrapMode(true);

    const beautify = html_beautify;
    const GEMINI_API_KEY = "AIzaSyDhuFGySigse5Yk8K2dMcQ8Jxv8_Je1bRA";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    // =================================================================================
    // CORE FUNCTIONS
    // =================================================================================

    function updatePreview() {
        const previewFrame = document.getElementById('preview-iframe');
        const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
        preview.open();
        preview.write(editor.getValue());
        preview.close();
        runAnalysis();
    }

    function openPreviewInNewTab() {
        const newTab = window.open();
        newTab.document.write(editor.getValue());
        newTab.document.close();
    }

    function openHighlightedCodeInNewTab() {
        const newTab = window.open();
        const highlightedCode = hljs.highlightAuto(editor.getValue()).value;
        newTab.document.write(`<style>body{background-color:#282a36;color:#f8f8f2;}</style><pre><code>${highlightedCode}</code></pre>`);
        newTab.document.close();
    }

    function formatCode() {
        editor.setValue(beautify(editor.getValue(), { indent_size: 4, space_in_empty_paren: true }), -1);
    }

    function loadSample() {
        const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Page</title>
</head>
<body>
    <h1>Welcome!</h1>
    <p>This is a sample document.</p>
</body>
</html>`;
        editor.setValue(sampleHtml, -1);
    }

    function importFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => editor.setValue(e.target.result, -1);
            reader.readAsText(file);
        }
    }

    function exportFile() {
        saveAs(new Blob([editor.getValue()], { type: "text/html;charset=utf-8" }), "document.html");
    }

    // =================================================================================
    // ADVANCED FEATURES
    // =================================================================================

    async function generateWithAI(prompt) {
        const currentCode = editor.getValue();
        const requestBody = {
            contents: [{ parts: [{ text: `${prompt}\n\nHTML Code:\n\`\`\`html\n${currentCode}\n\`\`\`` }] }]
        };

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            const codeBlock = generatedText.match(/```html\n([\s\S]*?)\n```/);
            editor.setValue(codeBlock ? codeBlock[1] : generatedText, -1);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate code. Check the console for details.");
        }
    }

    function runAnalysis() {
        const doc = new DOMParser().parseFromString(editor.getValue(), 'text/html');
        runSEOAnalysis(doc);
        runPerformanceAnalysis(doc);
    }

    function runSEOAnalysis(doc) {
        let results = '<ul>';
        if (!doc.title) results += '<li><span class="badge bg-danger">Error</span> Missing title tag.</li>';
        if (!doc.querySelector('meta[name="description"]')) results += '<li><span class="badge bg-warning">Warning</span> Missing meta description.</li>';
        if (!doc.querySelector('h1')) results += '<li><span class="badge bg-warning">Warning</span> Missing H1 tag.</li>';
        doc.querySelectorAll('img:not([alt])').forEach(() => {
            results += '<li><span class="badge bg-warning">Warning</span> Image missing alt attribute.</li>';
        });
        results += '</ul>';
        $('#seo-analysis').html(results);
    }

    function runPerformanceAnalysis(doc) {
        let results = '<ul>';
        const scripts = doc.querySelectorAll('script[src]');
        const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
        if (scripts.length > 2) results += `<li><span class="badge bg-info">Info</span> ${scripts.length} external scripts. Consider bundling.</li>`;
        if (stylesheets.length > 2) results += `<li><span class="badge bg-info">Info</span> ${stylesheets.length} external stylesheets. Consider bundling.</li>`;
        results += `<li><span class="badge bg-info">Info</span> Total elements: ${doc.getElementsByTagName('*').length}</li>`;
        results += '</ul>';
        $('#performance').html(results);
    }

    // =================================================================================
    // EVENT LISTENERS
    // =================================================================================

    editor.session.on('change', updatePreview);
    $('#preview-btn').on('click', openPreviewInNewTab);
    $('#highlight-btn').on('click', openHighlightedCodeInNewTab);
    $('#format-btn').on('click', formatCode);
    $('#expand-btn').on('click', () => editor.execCommand("expandAll"));
    $('#collapse-btn').on('click', () => editor.session.foldAll());
    $('#sample-btn').on('click', loadSample);
    $('#clear-btn').on('click', () => editor.setValue("", -1));
    $('#import-file').on('change', importFile);
    $('#export-btn').on('click', exportFile);

    $('#ai-generate-btn').on('click', () => generateWithAI($('#ai-prompt').val()));
    $('#ai-fix-btn').on('click', () => generateWithAI("Fix any errors in the following HTML code."));
    $('#ai-optimize-btn').on('click', () => generateWithAI("Optimize the following HTML code for performance and SEO."));

    $('.preview-toolbar .btn').on('click', function() {
        $('.preview-toolbar .btn').removeClass('active');
        $(this).addClass('active');
        const [width, height] = $(this).data('res').split('x');
        $('#preview-iframe').css({ 'width': width, 'height': height });
    });

    $(document).on('keydown', function(e) {
        if (e.altKey) {
            e.preventDefault();
            switch (e.which) {
                case 49: openPreviewInNewTab(); break;
                case 50: openHighlightedCodeInNewTab(); break;
                case 51: formatCode(); break;
                case 52: editor.execCommand("expandAll"); break;
                case 53: editor.session.foldAll(); break;
                case 54: loadSample(); break;
                case 55: editor.setValue("", -1); break;
            }
        }
    });

    // =================================================================================
    // INITIAL LOAD
    // =================================================================================

    loadSample();
    updatePreview();
});