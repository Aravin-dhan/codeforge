/**
 * CodeForge - A browser-based Universal File Viewer and Playground.
 *
 * This script initializes a CodeMirror editor, handles UI interactions,
 * manages the live preview for various file types, and implements
 * features like persistence and sharing.
 */
document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    let editor = CodeMirror(document.getElementById('editor'), {
        lineNumbers: true,
        theme: 'default',
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        extraKeys: {"Ctrl-Space": "autocomplete"},
        emmet: { mark: true }
    });

    // =================================================================================
    // UI & LAYOUT
    // =================================================================================

    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    themeToggle.addEventListener('change', () => {
        const isDark = themeToggle.checked;
        htmlElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        editor.setOption('theme', isDark ? 'material-dark' : 'default');
    });

    const resizerY = document.querySelector('.resizer-y');
    const editorContainer = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');
    let isResizing = false;

    resizerY.addEventListener('mousedown', () => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        const totalWidth = document.getElementById('main-container').offsetWidth;
        const newLeftWidth = e.clientX;
        const leftPercent = (newLeftWidth / totalWidth) * 100;
        if (leftPercent > 10 && leftPercent < 90) {
            editorContainer.style.flexBasis = `${leftPercent}%`;
            previewContainer.style.flexBasis = `${100 - leftPercent}%`;
        }
    }

    // =================================================================================
    // FILE HANDLING & PREVIEW
    // =================================================================================

    const fileTypeSelector = document.getElementById('file-type');
    let debounceTimer;

    const updatePreview = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const content = editor.getValue();
            const fileType = fileTypeSelector.value;
            const iframe = document.getElementById('preview-iframe');
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            iframeDoc.open();
            switch (fileType) {
                case 'html':
                    iframeDoc.write(content);
                    break;
                case 'css':
                    iframeDoc.write(`<style>${content}</style>`);
                    break;
                case 'javascript':
                    iframeDoc.write(`<script>${content}<\/script>`);
                    break;
                case 'markdown':
                    iframeDoc.write(marked.parse(content));
                    break;
                case 'json':
                    try {
                        const formatted = JSON.stringify(JSON.parse(content), null, 2);
                        iframeDoc.write(`<pre>${formatted}</pre>`);
                    } catch (e) {
                        iframeDoc.write(`<pre>Invalid JSON: ${e.message}</pre>`);
                    }
                    break;
                default:
                    iframeDoc.write(`<pre>${content}</pre>`);
            }
            iframeDoc.close();
            saveStateToLocalStorage();
        }, 300);
    };

    editor.on('change', updatePreview);
    fileTypeSelector.addEventListener('change', () => {
        const fileType = fileTypeSelector.value;
        let mode = fileType;
        if (fileType === 'html') mode = 'xml';
        editor.setOption('mode', mode);
        updatePreview();
    });

    // =================================================================================
    // PROJECT MANAGEMENT
    // =================================================================================

    function saveStateToLocalStorage() {
        const state = {
            content: editor.getValue(),
            fileType: fileTypeSelector.value,
            theme: themeToggle.checked ? 'dark' : 'light'
        };
        localStorage.setItem('codeforge_universal_state', JSON.stringify(state));
    }

    function loadStateFromLocalStorage() {
        const state = JSON.parse(localStorage.getItem('codeforge_universal_state'));
        if (state) {
            editor.setValue(state.content || '');
            fileTypeSelector.value = state.fileType || 'html';
            editor.setOption('mode', state.fileType === 'html' ? 'xml' : state.fileType);
            if (state.theme === 'dark') {
                themeToggle.checked = true;
                htmlElement.setAttribute('data-theme', 'dark');
                editor.setOption('theme', 'material-dark');
            }
            updatePreview();
        }
    }

    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', () => {
        const state = {
            content: editor.getValue(),
            fileType: fileTypeSelector.value
        };
        const jsonString = JSON.stringify(state);
        const encoded = btoa(jsonString);
        const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Shareable URL copied to clipboard!');
        });
    });

    function loadStateFromUrl() {
        if (window.location.hash) {
            try {
                const encoded = window.location.hash.substring(1);
                const decoded = atob(encoded);
                const state = JSON.parse(decoded);
                if (state) {
                    editor.setValue(state.content || '');
                    fileTypeSelector.value = state.fileType || 'html';
                    editor.setOption('mode', state.fileType === 'html' ? 'xml' : state.fileType);
                    updatePreview();
                }
            } catch (error) {
                console.error('Failed to load state from URL:', error);
                loadStateFromLocalStorage();
            }
        } else {
            loadStateFromLocalStorage();
        }
    }

    const exportZipBtn = document.getElementById('export-zip-btn');
    exportZipBtn.addEventListener('click', () => {
        const zip = new JSZip();
        const fileType = fileTypeSelector.value;
        const extension = fileType === 'javascript' ? 'js' : fileType;
        zip.file(`file.${extension}`, editor.getValue());
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'codeforge-project.zip');
        });
    });

    // =================================================================================
    // INITIAL LOAD
    // =================================================================================

    loadStateFromUrl();
});