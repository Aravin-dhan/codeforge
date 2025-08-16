import { AIAssistant } from './ai.js';
import { Preview } from './preview.js';
import { Analysis } from './analysis.js';
import { UI } from './ui.js';

$(document).ready(function() {
    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow_night");
    editor.session.setMode("ace/mode/html");
    editor.session.setUseWrapMode(true);

    const aiAssistant = new AIAssistant(editor);
    const preview = new Preview(editor);
    const analysis = new Analysis(editor);
    const ui = new UI(editor, preview, analysis);

    // =================================================================================
    // EVENT LISTENERS
    // =================================================================================

    // Editor input listener for live preview and analysis
    editor.session.on('change', () => {
        preview.update();
        analysis.run();
    });

    // AI buttons
    $('#ai-generate-btn').on('click', () => aiAssistant.process($('#ai-prompt').val()));
    $('#ai-fix-btn').on('click', () => aiAssistant.process("Fix any errors in the following HTML code."));
    $('#ai-optimize-btn').on('click', () => aiAssistant.process("Optimize the following HTML code for performance and SEO."));

    // =================================================================================
    // INITIAL LOAD
    // =================================================================================

    ui.loadSample();
    preview.update();
    analysis.run();
});