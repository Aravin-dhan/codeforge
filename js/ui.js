/**
 * UI Module
 *
 * This module handles all UI interactions, including the toolbar,
 * device emulation, and keyboard shortcuts.
 */
export class UI {
    constructor(editor, preview, analysis) {
        this.editor = editor;
        this.preview = preview;
        this.analysis = analysis;
        this.initEventListeners();
    }

    initEventListeners() {
        // Toolbar buttons
        $('#preview-btn').on('click', () => this.openPreviewInNewTab());
        $('#highlight-btn').on('click', () => this.openHighlightedCodeInNewTab());
        $('#format-btn').on('click', () => this.formatCode());
        $('#expand-btn').on('click', () => this.editor.execCommand("expandAll"));
        $('#collapse-btn').on('click', () => this.editor.session.foldAll());
        $('#sample-btn').on('click', () => this.loadSample());
        $('#clear-btn').on('click', () => this.editor.setValue("", -1));
        $('#import-file').on('change', (e) => this.importFile(e));
        $('#export-btn').on('click', () => this.exportFile());

        // Device emulation
        $('.preview-toolbar .btn').on('click', (e) => {
            $('.preview-toolbar .btn').removeClass('active');
            const target = $(e.currentTarget);
            target.addClass('active');
            const [width, height] = target.data('res').split('x');
            $('#preview-iframe').css({ 'width': width, 'height': height });
        });

        // Keyboard shortcuts
        $(document).on('keydown', (e) => {
            if (e.altKey) {
                e.preventDefault();
                switch (e.which) {
                    case 49: this.openPreviewInNewTab(); break;
                    case 50: this.openHighlightedCodeInNewTab(); break;
                    case 51: this.formatCode(); break;
                    case 52: this.editor.execCommand("expandAll"); break;
                    case 53: this.editor.session.foldAll(); break;
                    case 54: this.loadSample(); break;
                    case 55: this.editor.setValue("", -1); break;
                }
            }
        });
    }

    openPreviewInNewTab() {
        const newTab = window.open();
        newTab.document.write(this.editor.getValue());
        newTab.document.close();
    }

    openHighlightedCodeInNewTab() {
        const newTab = window.open();
        const highlightedCode = hljs.highlightAuto(this.editor.getValue()).value;
        newTab.document.write(`<style>body{background-color:#282a36;color:#f8f8f2;}</style><pre><code>${highlightedCode}</code></pre>`);
        newTab.document.close();
    }

    formatCode() {
        this.editor.setValue(html_beautify(this.editor.getValue(), { indent_size: 4, space_in_empty_paren: true }), -1);
    }

    loadSample() {
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
        this.editor.setValue(sampleHtml, -1);
    }

    importFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => this.editor.setValue(e.target.result, -1);
            reader.readAsText(file);
        }
    }

    exportFile() {
        saveAs(new Blob([this.editor.getValue()], { type: "text/html;charset=utf-8" }), "document.html");
    }
}