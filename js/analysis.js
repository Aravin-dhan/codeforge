/**
 * Analysis Module
 *
 * This module handles the SEO and performance analysis of the user's code.
 */
export class Analysis {
    constructor(editor) {
        this.editor = editor;
        this.seoPanel = $('#seo-analysis');
        this.performancePanel = $('#performance');
    }

    /**
     * Runs all analysis reports.
     */
    run() {
        const doc = new DOMParser().parseFromString(this.editor.getValue(), 'text/html');
        this.runSEOAnalysis(doc);
        this.runPerformanceAnalysis(doc);
    }

    /**
     * Runs the SEO analysis.
     * @param {Document} doc - The parsed HTML document.
     */
    runSEOAnalysis(doc) {
        let results = '<ul>';
        if (!doc.title) results += '<li><span class="badge bg-danger">Error</span> Missing title tag.</li>';
        if (!doc.querySelector('meta[name="description"]')) results += '<li><span class="badge bg-warning">Warning</span> Missing meta description.</li>';
        if (!doc.querySelector('h1')) results += '<li><span class="badge bg-warning">Warning</span> Missing H1 tag.</li>';
        doc.querySelectorAll('img:not([alt])').forEach(() => {
            results += '<li><span class="badge bg-warning">Warning</span> Image missing alt attribute.</li>';
        });
        results += '</ul>';
        this.seoPanel.html(results);
    }

    /**
     * Runs the performance analysis.
     * @param {Document} doc - The parsed HTML document.
     */
    runPerformanceAnalysis(doc) {
        let results = '<ul>';
        const scripts = doc.querySelectorAll('script[src]');
        const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]');
        if (scripts.length > 2) results += `<li><span class="badge bg-info">Info</span> ${scripts.length} external scripts. Consider bundling.</li>`;
        if (stylesheets.length > 2) results += `<li><span class="badge bg-info">Info</span> ${stylesheets.length} external stylesheets. Consider bundling.</li>`;
        results += `<li><span class="badge bg-info">Info</span> Total elements: ${doc.getElementsByTagName('*').length}</li>`;
        results += '</ul>';
        this.performancePanel.html(results);
    }
}