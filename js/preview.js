/**
 * Preview Module
 *
 * This module handles the rendering of the live preview, including
 * dynamic execution of JavaScript and CSS.
 */
export class Preview {
    constructor(editor) {
        this.editor = editor;
        this.iframe = document.getElementById('preview-iframe');
    }

    /**
     * Updates the live preview with the editor's content.
     */
    update() {
        const previewDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        previewDoc.open();
        previewDoc.write(this.editor.getValue());
        previewDoc.close();
    }
}