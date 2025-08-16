$(document).ready(function() {
    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    // Initialize Ace Editor
    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");
    editor.session.setUseWrapMode(true);

    // Initialize JS Beautifier
    const beautify = html_beautify;

    // Gemini API Configuration
    const GEMINI_API_KEY = "AIzaSyDhuFGySigse5Yk8K2dMcQ8Jxv8_Je1bRA";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    // =================================================================================
    // CORE FUNCTIONS
    // =================================================================================

    /**
     * Updates the live preview iframe with the editor's content.
     */
    function updatePreview() {
        const previewFrame = document.getElementById('preview-iframe');
        const preview = previewFrame.contentDocument || previewFrame.contentWindow.document;
        preview.open();
        preview.write(editor.getValue());
        preview.close();
    }

    /**
     * Opens a new tab with the rendered HTML preview.
     */
    function openPreviewInNewTab() {
        const newTab = window.open();
        newTab.document.write(editor.getValue());
        newTab.document.close();
    }

    /**
     * Opens a new tab with the syntax-highlighted HTML code.
     */
    function openHighlightedCodeInNewTab() {
        const newTab = window.open();
        const highlightedCode = hljs.highlightAuto(editor.getValue()).value;
        newTab.document.write(`<style>body{background-color:#282a36;color:#f8f8f2;}pre{margin:0;}</style><pre><code>${highlightedCode}</code></pre>`);
        newTab.document.close();
    }

    /**
     * Formats the code in the editor using JS Beautifier.
     */
    function formatCode() {
        const currentCode = editor.getValue();
        const formattedCode = beautify(currentCode, {
            indent_size: 4,
            space_in_empty_paren: true
        });
        editor.setValue(formattedCode, -1);
    }

    /**
     * Loads a sample HTML document into the editor.
     */
    function loadSample() {
        const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Welcome to the HTML Viewer</h1>
    <p>This is a sample HTML document.</p>
    <ul>
        <li>Edit the code on the left.</li>
        <li>See the live preview on the right.</li>
    </ul>
</body>
</html>`;
        editor.setValue(sampleHtml, -1);
    }

    /**
     * Handles file import and loads the content into the editor.
     * @param {Event} event - The file input change event.
     */
    function importFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                editor.setValue(e.target.result, -1);
            };
            reader.readAsText(file);
        }
    }

    /**
     * Exports the editor content as a .html file.
     */
    function exportFile() {
        const blob = new Blob([editor.getValue()], { type: "text/html;charset=utf-8" });
        saveAs(blob, "document.html");
    }

    /**
     * Generates or refactors code using the Gemini API.
     */
    async function generateWithAI() {
        const prompt = $('#ai-prompt').val();
        const currentCode = editor.getValue();
        if (!prompt) {
            alert("Please enter a prompt for the AI.");
            return;
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: `Prompt: ${prompt}\n\nCurrent HTML Code:\n\`\`\`html\n${currentCode}\n\`\`\``
                }]
            }]
        };

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            // Clean the response to get only the code block
            const codeBlock = generatedText.match(/```html\n([\s\S]*?)\n```/);
            if (codeBlock && codeBlock[1]) {
                editor.setValue(codeBlock[1], -1);
            } else {
                editor.setValue(generatedText, -1);
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate code. Please check the console for details.");
        }
    }

    // =================================================================================
    // EVENT LISTENERS
    // =================================================================================

    // Editor input listener for live preview
    editor.session.on('change', updatePreview);

    // Toolbar button listeners
    $('#preview-btn').on('click', openPreviewInNewTab);
    $('#highlight-btn').on('click', openHighlightedCodeInNewTab);
    $('#format-btn').on('click', formatCode);
    $('#expand-btn').on('click', () => editor.execCommand("expandAll"));
    $('#collapse-btn').on('click', () => editor.session.foldAll());
    $('#sample-btn').on('click', loadSample);
    $('#clear-btn').on('click', () => editor.setValue("", -1));
    $('#import-file').on('change', importFile);
    $('#export-btn').on('click', exportFile);
    $('#ai-generate-btn').on('click', generateWithAI);

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        if (e.altKey) {
            switch (e.which) {
                case 49: // Alt+1
                    e.preventDefault();
                    openPreviewInNewTab();
                    break;
                case 50: // Alt+2
                    e.preventDefault();
                    openHighlightedCodeInNewTab();
                    break;
                case 51: // Alt+3
                    e.preventDefault();
                    formatCode();
                    break;
                case 52: // Alt+4
                    e.preventDefault();
                    editor.execCommand("expandAll");
                    break;
                case 53: // Alt+5
                    e.preventDefault();
                    editor.session.foldAll();
                    break;
                case 54: // Alt+6
                    e.preventDefault();
                    loadSample();
                    break;
                case 55: // Alt+7
                    e.preventDefault();
                    editor.setValue("", -1);
                    break;
            }
        }
    });

    // =================================================================================
    // INITIAL LOAD
    // =================================================================================

    loadSample();
    updatePreview();
});