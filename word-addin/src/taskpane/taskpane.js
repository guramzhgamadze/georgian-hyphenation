/* global Office Word */

const GEORGIAN_LANG_ID = "1079";

// ─── Log levels ───────────────────────────────────────────
const LOG = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERR ', SEP: 'SEP ' };

// ─── Timing helpers ──────────────────────────────────────
const _timers = {};
function timerStart(label) { _timers[label] = performance.now(); }
function timerEnd(label) {
    const start = _timers[label];
    delete _timers[label];
    return start != null ? (performance.now() - start).toFixed(0) : '?';
}

// ─── Office theme detection ──────────────────────────────
let lastThemeColors = null;

function applyOfficeTheme() {
    if (typeof Office === 'undefined' || !Office.context || !Office.context.officeTheme) {
        return; // Office.js not loaded or theme API unavailable
    }
    
    const theme = Office.context.officeTheme;
    
    // Check if theme actually changed
    const currentColors = JSON.stringify(theme);
    if (lastThemeColors === currentColors) {
        return; // No change, skip update
    }
    lastThemeColors = currentColors;
    
    const root = document.documentElement;
    
    // Office theme provides bodyBackgroundColor, bodyForegroundColor, controlBackgroundColor, controlForegroundColor
    // We map these to our CSS variables
    
    if (theme.bodyBackgroundColor) {
        root.style.setProperty('--bg-primary', theme.bodyBackgroundColor);
    }
    
    if (theme.bodyForegroundColor) {
        root.style.setProperty('--text-primary', theme.bodyForegroundColor);
    }
    
    if (theme.controlBackgroundColor) {
        root.style.setProperty('--bg-secondary', theme.controlBackgroundColor);
    }
    
    if (theme.controlForegroundColor) {
        root.style.setProperty('--text-secondary', theme.controlForegroundColor);
    }
    
    // Detect theme by checking background brightness (3 options: white, gray, black)
    if (theme.bodyBackgroundColor) {
        const rgb = parseColor(theme.bodyBackgroundColor);
        if (rgb) {
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            
            if (brightness < 100) {
                // Black/Dark Gray theme - Golden Yellow theme
                root.style.setProperty('--bg-header', '#f7ba36');
                root.style.setProperty('--accent-primary', '#f7ba36');
                root.style.setProperty('--accent-hover', '#e5a825');
                root.style.setProperty('--bg-tertiary', '#3a3a3a');
                root.style.setProperty('--text-tertiary', '#a0a0a0');
                root.style.setProperty('--border-color', '#5a5a5a');
                root.style.setProperty('--border-strong', '#707070');
                root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.4)');
                root.style.setProperty('--shadow-strong', 'rgba(0,0,0,0.6)');
                root.style.setProperty('--text-on-accent', '#000000');
            } else if (brightness >= 100 && brightness < 180) {
                // Medium Gray theme - Green theme
                root.style.setProperty('--bg-header', '#15803d');
                root.style.setProperty('--accent-primary', '#15803d');
                root.style.setProperty('--accent-hover', '#166534');
                root.style.setProperty('--bg-secondary', '#4b5563');
                root.style.setProperty('--bg-tertiary', '#374151');
                root.style.setProperty('--text-primary', '#f3f4f6');
                root.style.setProperty('--text-secondary', '#d1d5db');
                root.style.setProperty('--text-tertiary', '#9ca3af');
                root.style.setProperty('--border-color', '#6b7280');
                root.style.setProperty('--border-strong', '#4b5563');
                root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.2)');
                root.style.setProperty('--shadow-strong', 'rgba(0,0,0,0.3)');
                root.style.setProperty('--text-on-accent', '#ffffff');
            } else {
                // White/Light theme - Modern Microsoft 365 Blue
                root.style.setProperty('--bg-header', '#115EA3');
                root.style.setProperty('--accent-primary', '#0F6CBD');
                root.style.setProperty('--accent-hover', '#115EA3');
                root.style.setProperty('--bg-tertiary', '#fafafa');
                root.style.setProperty('--text-tertiary', '#8a8886');
                root.style.setProperty('--border-color', '#e1dfdd');
                root.style.setProperty('--border-strong', '#c8c6c4');
                root.style.setProperty('--shadow-color', 'rgba(0,0,0,0.1)');
                root.style.setProperty('--shadow-strong', 'rgba(0,0,0,0.14)');
                root.style.setProperty('--text-on-accent', '#ffffff');
            }
        }
    }
    
    logActivity(`Theme applied: ${theme.bodyBackgroundColor ? 'Custom' : 'Default'}`);
}

function parseColor(color) {
    // Parse colors like "#FFFFFF" or "rgb(255,255,255)"
    if (!color) return null;
    
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 6) {
            return {
                r: parseInt(hex.substr(0, 2), 16),
                g: parseInt(hex.substr(2, 2), 16),
                b: parseInt(hex.substr(4, 2), 16)
            };
        }
    } else if (color.startsWith('rgb')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
    }
    return null;
}

function logActivity(message, level = LOG.INFO) {
    const content = document.getElementById('error-log-content');
    const container = document.getElementById('error-log-container');
    const toggle = document.getElementById('toggle-log');

    if (content) {
        if (level === LOG.SEP) {
            // plain separator — no timestamp / level prefix
            content.textContent += `${message}\n`;
        } else {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            content.textContent += `[${hh}:${mm}:${ss}] [${level}] ${message}\n`;
        }
        content.scrollTop = content.scrollHeight;
    }

    // Show container only if toggle is checked
    if (container && toggle && toggle.checked) {
        container.style.display = 'block';
    }
}

function clearLog() {
    const content = document.getElementById('error-log-content');
    if (content) content.textContent = '';
}

function downloadLog() {
    const content = document.getElementById('error-log-content');
    if (!content || !content.textContent.trim()) {
        logActivity("Log is empty — nothing to download", LOG.WARN);
        return;
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `georgian-hyphenation-log-${timestamp}.txt`;
    
    const blob = new Blob([content.textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    logActivity(`Log downloaded: ${filename}`);
}

// Progress bar functions
function showProgress() {
    const container = document.getElementById('progress-container');
    if (container) container.style.display = 'block';
}

function hideProgress() {
    const container = document.getElementById('progress-container');
    if (container) container.style.display = 'none';
    updateProgress(0, '');
}

function updateProgress(percent, label) {
    const bar = document.getElementById('progress-bar');
    const percentLabel = document.getElementById('progress-percent');
    const textLabel = document.getElementById('progress-label');
    
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    if (percentLabel) percentLabel.textContent = `${Math.round(percent)}%`;
    if (textLabel && label) textLabel.textContent = label;
}

// Hyphenation engine — the shared v2.3.0 build, loaded from
// georgian-hyphenator.js + dictionary.js (bundled same-origin, no CDN).
// Regenerate those two files with: node browser-extension-shared/build.mjs
let hyphenator = null;

function initHyphenator() {
    if (typeof window.GeorgianHyphenator !== 'function') {
        logActivity('Hyphenation engine failed to load', LOG.ERROR);
        return;
    }
    // The engine emits U+00AD; addHyphensToOOXML converts each into a
    // <w:softHyphen/> element for Word.
    hyphenator = new window.GeorgianHyphenator('\u00AD');
    if (window.GEORGIAN_HYPHENATION_DICT) {
        hyphenator.loadLibrary(window.GEORGIAN_HYPHENATION_DICT);
        logActivity(`Dictionary loaded: ${hyphenator.getDictionarySize()} entries`);
    } else {
        logActivity('Dictionary not bundled — algorithm-only mode', LOG.WARN);
    }
}

Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        logActivity("Office.js loaded successfully");
        logActivity(`Host: ${info.host} | Platform: ${info.platform}`);
        logActivity("Two-pass method active: Remove ALL → Sync → Add NEW");
        
        // Apply Office theme
        applyOfficeTheme();
        
        // Listen for theme changes
        if (Office.context && Office.context.officeTheme) {
            // Monitor theme changes by checking periodically
            // Office.js doesn't provide a direct theme change event
            setInterval(() => {
                applyOfficeTheme();
            }, 4000); // Poll for theme changes (Office.js has no theme-change event)
        }
        
        initHyphenator();
        
        document.getElementById('hyphenate-document').onclick = () => runSafe(hyphenateBody);
        document.getElementById('hyphenate-selection').onclick = () => runSafe(hyphenateSelection);
        document.getElementById('remove-hyphenation-document').onclick = () => runSafe(removeHyphenationBody);
        document.getElementById('remove-hyphenation-selection').onclick = () => runSafe(removeHyphenationSelection);
        document.getElementById('clear-log').onclick = clearLog;
        document.getElementById('download-log').onclick = downloadLog;
        
        const clearHighlightBtn = document.getElementById('clear-highlighting');
        if (clearHighlightBtn) {
            clearHighlightBtn.onclick = () => runSafe(clearHighlighting);
        }
        
        // Toggle log visibility
        const toggleLog = document.getElementById('toggle-log');
        const logContainer = document.getElementById('error-log-container');
        if (toggleLog && logContainer) {
            toggleLog.addEventListener('change', function() {
                if (this.checked) {
                    logContainer.style.display = 'block';
                } else {
                    logContainer.style.display = 'none';
                }
            });
        }
        
        document.getElementById('status').textContent = "მზად არის";
    } else {
        logActivity("Not running in Word", LOG.ERROR);
    }
});

function setButtonsEnabled(enabled) {
    const btns = [
        document.getElementById('hyphenate-document'),
        document.getElementById('hyphenate-selection'),
        document.getElementById('remove-hyphenation-document'),
        document.getElementById('remove-hyphenation-selection'),
        document.getElementById('clear-highlighting')
    ];
    btns.forEach(btn => {
        if (btn) btn.disabled = !enabled;
    });
}

async function runSafe(fn) {
    setButtonsEnabled(false);
    try {
        await fn();
    } catch (err) {
        logActivity(`Unhandled: ${err.message}`, LOG.ERROR);
        console.error(err);
    } finally {
        setButtonsEnabled(true);
    }
}

/**
 * ✅ HYPHENATE FULL DOCUMENT using TWO-PASS OOXML method
 */
async function hyphenateBody() {
    showProgress();
    timerStart('fullDoc');
    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity("Full-document hyphenation started (smart pass v2)");
        
        const body = context.document.body;
        const stats = await processRangeSmart(context, body, "document");
        
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity(`Completed in ${timerEnd('fullDoc')} ms — words processed: ${stats.processed}, hyphenated: ${stats.success}, paragraphs: ${stats.paragraphs}`);
    });
    hideProgress();
}

/**
 * ✅ HYPHENATE SELECTION — smart pass
 * Strip-and-reapply computed in memory; the document is written only if the
 * resulting hyphenation differs from the current state.
 */
async function hyphenateSelection() {
    showProgress();
    timerStart('selection');

    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity("Selection hyphenation started (smart pass)");

        const selection = context.document.getSelection();
        selection.load("text");
        await context.sync();

        if (!selection.text || selection.text.trim().length < 4) {
            logActivity("Selection is too short or empty", LOG.WARN);
            hideProgress();
            return;
        }
        if (!/[ა-ჰ]/.test(selection.text)) {
            logActivity("Selection contains no Georgian text", LOG.WARN);
            hideProgress();
            return;
        }

        const range = selection.getRange();
        updateProgress(20, '📥 ტექსტის წაკითხვა...');

        try {
            const ooxml = range.getOoxml();
            await context.sync();
            const original = ooxml.value;

            // Strip only when old hyphens actually exist; wrong positions are
            // corrected because the final comparison is position-exact.
            let working = original;
            if (ooxmlHasHyphens(original)) {
                logActivity("Existing hyphens found — stripping before reapply");
                working = removeAllHyphensFromOOXML(original).ooxml;
            }

            updateProgress(60, '➕ დამარცვლა...');
            const result = addHyphensToOOXML(working);

            const sigBefore = getHyphenationSignature(original);
            const sigAfter = getHyphenationSignature(result.ooxml);

            if (sigBefore !== null && sigBefore === sigAfter) {
                updateProgress(100, '✅ უკვე დამარცვლულია');
                logActivity(`Selection already correctly hyphenated — nothing to change (${timerEnd('selection')} ms)`);
            } else {
                range.insertOoxml(result.ooxml, Word.InsertLocation.replace);
                await context.sync();
                updateProgress(100, '✅ დასრულდა');
                logActivity(`Selection hyphenated in ${timerEnd('selection')} ms — ${result.wordsHyphenated} words`);
            }
        } catch (err) {
            logActivity(`Selection error: ${err.message}`, LOG.ERROR);
            logActivity(`This may be due to tracked changes, content controls, or fields in the selection`, LOG.WARN);
        }
    });

    setTimeout(hideProgress, 1000);
}


/**
 * ✅ REMOVE HYPHENATION FROM FULL DOCUMENT
 * Runs only the removal pass (soft hyphens / <w:softHyphen/>), no re-add.
 */
async function removeHyphenationBody() {
    showProgress();
    timerStart('removeDoc');
    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity("Full-document hyphen removal started");

        const stats = await removeHyphensFromRange(context, context.document.body);

        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity(`Completed in ${timerEnd('removeDoc')} ms — ${stats.cleaned} of ${stats.total} paragraphs cleaned`);
    });
    hideProgress();
}

/**
 * ✅ REMOVE HYPHENATION FROM SELECTION
 * Runs only the removal pass on the current selection range.
 */
async function removeHyphenationSelection() {
    showProgress();
    timerStart('removeSel');

    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity("Selection hyphen removal started");

        const selection = context.document.getSelection();
        selection.load("text");
        await context.sync();

        if (!selection.text || selection.text.trim().length === 0) {
            logActivity("Selection is empty", LOG.WARN);
            hideProgress();
            return;
        }

        const range = selection.getRange();
        updateProgress(30, '🧽 დამარცვლის მოშორება...');

        try {
            const ooxml = range.getOoxml();
            await context.sync();

            const cleanedOOXML = removeAllHyphensFromOOXML(ooxml.value);

            if (cleanedOOXML.changed) {
                range.insertOoxml(cleanedOOXML.ooxml, Word.InsertLocation.replace);
                await context.sync();
                updateProgress(100, '✅ დასრულდა');
                logActivity(`Selection cleaned in ${timerEnd('removeSel')} ms`);
            } else {
                updateProgress(100, '✅ დასრულდა');
                logActivity(`No hyphens found in selection`, LOG.WARN);
            }
        } catch (err) {
            logActivity(`Selection removal failed: ${err.message}`, LOG.ERROR);
        }
    });

    setTimeout(hideProgress, 800);
}

/**
 * 🔧 Remove soft hyphens from every Georgian paragraph in a range.
 * Reuses removeAllHyphensFromOOXML (the two-pass Pass 1) per paragraph,
 * chunked and synced like the hyphenation path.
 */
async function removeHyphensFromRange(context, range) {
    let cleaned = 0;

    const paragraphs = range.paragraphs;
    paragraphs.load("items");
    await context.sync();

    for (let i = 0; i < paragraphs.items.length; i++) {
        paragraphs.items[i].load("text");
    }
    await context.sync();

    // Only Georgian paragraphs can carry hyphens this add-in inserted.
    const valid = [];
    for (const para of paragraphs.items) {
        if (para.text && para.text.trim().length >= 4 && /[ა-ჰ]/.test(para.text)) {
            valid.push(para);
        }
    }

    logActivity(`${valid.length} Georgian paragraphs to scan`);
    if (valid.length === 0) {
        return { cleaned: 0, total: 0 };
    }

    const CHUNK_SIZE = 10;
    for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
        const endIdx = Math.min(i + CHUNK_SIZE, valid.length);

        for (let j = i; j < endIdx; j++) {
            try {
                const paraRange = valid[j].getRange();
                const ooxml = paraRange.getOoxml();
                await context.sync();

                const cleanedOOXML = removeAllHyphensFromOOXML(ooxml.value);
                if (cleanedOOXML.changed) {
                    paraRange.insertOoxml(cleanedOOXML.ooxml, Word.InsertLocation.replace);
                    cleaned++;
                }
            } catch (err) {
                logActivity(`Removal failed on paragraph ${j}: ${err.message}`, LOG.WARN);
            }
        }

        const progress = 10 + ((i + CHUNK_SIZE) / valid.length) * 90;
        updateProgress(progress, `🧽 მოშორება: ${Math.min(i + CHUNK_SIZE, valid.length)}/${valid.length}`);
        await context.sync();
    }

    return { cleaned, total: valid.length };
}

/**
 * 🔧 SMART PASS: strip-and-reapply per paragraph, computed in memory, with
 * the document written back only where hyphenation actually changes.
 *
 * - Paragraphs with NO existing hyphens skip the removal step entirely.
 * - Paragraphs WITH hyphens (correct or wrong) are stripped and re-hyphenated
 *   in memory; the result is written only if it differs from the current
 *   state, so wrong positions get corrected and correct ones stay untouched.
 * - OOXML reads are batched per chunk: one sync per chunk instead of one or
 *   more per paragraph.
 */
async function processRangeSmart(context, range, rangeType) {
    let totalWords = 0;
    let totalHyphenated = 0;
    let totalWritten = 0;

    try {
        const paragraphs = range.paragraphs;
        paragraphs.load("items");
        await context.sync();

        logActivity(`Found ${paragraphs.items.length} paragraphs`);
        updateProgress(5, 'პარაგრაფების მომზადება...');

        for (let i = 0; i < paragraphs.items.length; i++) {
            paragraphs.items[i].load("text");
        }
        await context.sync();

        const validParagraphs = [];
        for (let i = 0; i < paragraphs.items.length; i++) {
            const para = paragraphs.items[i];
            if (!para.text || para.text.trim().length < 4) continue;
            if (!/[ა-ჰ]/.test(para.text)) continue;
            validParagraphs.push({ para: para, text: para.text });
        }

        logActivity(`${validParagraphs.length} paragraphs contain Georgian text`);
        updateProgress(10, `${validParagraphs.length} პარაგრაფი მოიძებნა`);

        if (validParagraphs.length === 0) {
            logActivity("No valid paragraphs to process", LOG.WARN);
            return { processed: 0, success: 0, paragraphs: 0 };
        }

        timerStart('smartPass');
        const CHUNK_SIZE = 10;
        let hadOldHyphens = 0;
        let skippedUnchanged = 0;
        const errors = [];

        for (let i = 0; i < validParagraphs.length; i += CHUNK_SIZE) {
            const endIdx = Math.min(i + CHUNK_SIZE, validParagraphs.length);
            let wroteInChunk = false;

            for (let j = i; j < endIdx; j++) {
                const paraText = validParagraphs[j].text;
                try {
                    // One paragraph per read round-trip: each getOoxml()
                    // returns a full OOXML package (styles included), so
                    // batching several reads into one sync can exceed the
                    // host's payload limit and throw GeneralException.
                    const paraRange = validParagraphs[j].para.getRange();
                    const ooxml = paraRange.getOoxml();
                    await context.sync();

                    const original = ooxml.value;

                    // Strip only when old hyphens actually exist
                    let working = original;
                    if (ooxmlHasHyphens(original)) {
                        hadOldHyphens++;
                        working = removeAllHyphensFromOOXML(original).ooxml;
                    }

                    const result = addHyphensToOOXML(working);
                    totalWords += result.wordsProcessed || 0;
                    totalHyphenated += result.wordsHyphenated || 0;

                    // Position-exact comparison: identical hyphenation, no write
                    const sigBefore = getHyphenationSignature(original);
                    const sigAfter = getHyphenationSignature(result.ooxml);
                    if (sigBefore !== null && sigBefore === sigAfter) {
                        skippedUnchanged++;
                        continue;
                    }

                    paraRange.insertOoxml(result.ooxml, Word.InsertLocation.replace);
                    totalWritten++;
                    wroteInChunk = true;
                } catch (err) {
                    errors.push(`para ${j}: ${err.message} | text: "${paraText.substring(0, 50)}${paraText.length > 50 ? '...' : ''}"`);
                    try {
                        await highlightErrorParagraph(context, paraText);
                    } catch (highlightErr) {
                        logActivity(`Highlight failed: ${highlightErr.message}`, LOG.WARN);
                    }
                }
            }

            if (wroteInChunk) {
                await context.sync();
            }

            const progress = 10 + (endIdx / validParagraphs.length) * 85;
            updateProgress(progress, `📝 დამუშავება: ${endIdx}/${validParagraphs.length}`);
        }

        logActivity(`Smart pass done in ${timerEnd('smartPass')} ms`);
        logActivity(`Scanned ${validParagraphs.length} | had old hyphens (stripped+reapplied): ${hadOldHyphens} | already correct (untouched): ${skippedUnchanged} | written: ${totalWritten}`);
        if (errors.length) {
            logActivity(`Errors (${errors.length}): ${errors.join(' | ')}`, LOG.ERROR);
        }

        return { processed: totalWords, success: totalHyphenated, paragraphs: totalWritten };

    } catch (err) {
        logActivity(`Processing error: ${err.message}`, LOG.ERROR);
        throw err;
    }
}

/**
 * Fast check: does this OOXML contain any optional hyphens?
 * (<w:softHyphen/> elements or literal U+00AD characters)
 */
function ooxmlHasHyphens(ooxmlString) {
    return ooxmlString.indexOf('softHyphen') !== -1 || ooxmlString.indexOf('\u00AD') !== -1;
}

/**
 * Canonical "text + hyphen positions" signature of a paragraph's OOXML.
 * Both storage forms of an optional hyphen (<w:softHyphen/> element and
 * literal U+00AD character) map to the same marker, so two signatures are
 * equal exactly when the visible hyphenation state is identical.
 * Returns null on parse failure (callers must then assume "different").
 */
function getHyphenationSignature(ooxmlString) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ooxmlString, "text/xml");
        const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        const runs = xmlDoc.getElementsByTagNameNS(ns, 'r');
        let sig = '';
        for (let i = 0; i < runs.length; i++) {
            const children = runs[i].childNodes;
            for (let k = 0; k < children.length; k++) {
                const node = children[k];
                if (node.nodeType !== 1) continue;
                if (node.localName === 't') {
                    sig += node.textContent;
                } else if (node.localName === 'softHyphen') {
                    sig += '\u00AD';
                } else if (node.localName === 'br' || node.localName === 'cr' || node.localName === 'tab') {
                    sig += '\n';
                }
            }
        }
        return sig;
    } catch (e) {
        return null;
    }
}


/**
 * 🔍 Highlight error paragraph using search (avoids stale reference issues)
 * Based on Microsoft Word API best practices
 */
async function highlightErrorParagraph(context, paraText) {
    try {
        if (!paraText || paraText.length < 10) {
            logActivity(`Text too short for reliable search-based highlighting`, LOG.WARN);
            return false;
        }
        
        // Use first 50 characters as unique search key
        const searchKey = paraText.substring(0, Math.min(50, paraText.length));
        
        logActivity(`Searching for error paragraph...`, LOG.INFO);
        logActivity(`Search key: "${searchKey.substring(0, 30)}..."`, LOG.INFO);
        
        // Search for the paragraph text
        const searchResults = context.document.body.search(searchKey, {
            matchCase: true,
            matchWholeWord: false
        });
        searchResults.load('items');
        await context.sync();
        
        if (searchResults.items.length === 0) {
            logActivity(`Could not find paragraph for highlighting`, LOG.WARN);
            return false;
        }
        
        if (searchResults.items.length > 1) {
            logActivity(`Found ${searchResults.items.length} matches - highlighting first occurrence`, LOG.WARN);
        }
        
        // Get the paragraph from the search result
        const foundRange = searchResults.items[0];
        const foundPara = foundRange.paragraphs.getFirst();
        foundPara.load('text');
        await context.sync();
        
        // Verify it's the correct paragraph
        if (foundPara.text !== paraText) {
            logActivity(`⚠️  Found paragraph text doesn't match exactly`, LOG.WARN);
            logActivity(`Expected length: ${paraText.length}, Found: ${foundPara.text.length}`, LOG.WARN);
        }
        
        // Highlight the paragraph in yellow.
        // Capitalized name = one of the documented Office Desktop highlight
        // colors (lowercase gets remapped to the nearest one).
        foundPara.font.highlightColor = "Yellow";
        await context.sync();
        
        logActivity(`✅ Successfully highlighted paragraph in yellow`, LOG.INFO);
        
        // Now analyze and highlight problematic characters if any
        await analyzeAndHighlightProblematicCharacters(context, foundPara, paraText);
        
        return true;
        
    } catch (err) {
        logActivity(`❌ Highlighting failed: ${err.message}`, LOG.ERROR);
        logActivity(`Stack: ${err.stack || 'not available'}`, LOG.ERROR);
        return false;
    }
}

/**
 * 🔬 Analyze paragraph and highlight specific problematic characters in red
 */
async function analyzeAndHighlightProblematicCharacters(context, para, text) {
    try {
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        logActivity("DETAILED PARAGRAPH ANALYSIS", LOG.INFO);
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        
        let foundSpecificIssues = false;
        
        // ═══ BASIC INFO ═══
        logActivity(`Text length: ${text.length} characters`, LOG.INFO);
        const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
        logActivity(`Text preview: "${preview}"`, LOG.INFO);
        
        // ═══ CHARACTER ANALYSIS ═══
        let georgianCount = 0;
        let latinCount = 0;
        let digitCount = 0;
        let spaceCount = 0;
        let punctuationCount = 0;
        let otherCount = 0;
        
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            
            if (code >= 0x10A0 && code <= 0x10FF) georgianCount++;
            else if (code >= 0x1C90 && code <= 0x1CBF) georgianCount++;
            else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) latinCount++;
            else if (code >= 0x30 && code <= 0x39) digitCount++;
            else if (code === 0x20 || code === 0xA0 || code === 0x09) spaceCount++;
            else if (/[.,!?;:()\[\]{}'"«»—\-]/.test(text[i])) punctuationCount++;
            else otherCount++;
        }
        
        logActivity("Character Breakdown:", LOG.INFO);
        logActivity(`  Georgian: ${georgianCount}, Latin: ${latinCount}, Digits: ${digitCount}`, LOG.INFO);
        logActivity(`  Spaces: ${spaceCount}, Punctuation: ${punctuationCount}, Other: ${otherCount}`, LOG.INFO);
        
        // ═══ PROBLEMATIC CHARACTERS DETECTION ═══
        const problematicChars = {
            '\u200B': 'ZERO WIDTH SPACE',
            '\u200C': 'ZERO WIDTH NON-JOINER',
            '\u200D': 'ZERO WIDTH JOINER',
            '\u200E': 'LEFT-TO-RIGHT MARK',
            '\u200F': 'RIGHT-TO-LEFT MARK',
            '\uFEFF': 'ZERO WIDTH NO-BREAK SPACE',
            '\uFFFD': 'REPLACEMENT CHARACTER',
            '\u0000': 'NULL', '\u0001': 'SOH', '\u0002': 'STX',
            '\u0003': 'ETX', '\u0004': 'EOT', '\u0005': 'ENQ',
            '\u0006': 'ACK', '\u0007': 'BEL', '\u0008': 'BS',
            '\u0009': 'TAB', '\u000B': 'VT', '\u000C': 'FF',
            '\u000E': 'SO', '\u000F': 'SI'
        };
        
        const problematicPositions = [];
        const problematicWords = new Set();
        
        logActivity("Scanning for problematic characters:", LOG.INFO);
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (problematicChars[char]) {
                problematicPositions.push(i);
                const charCode = text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0');
                const charName = problematicChars[char];
                
                logActivity(`  ⚠️  U+${charCode} (${charName}) at position ${i}`, LOG.WARN);
                
                // Find word boundaries around this character
                let wordStart = i;
                let wordEnd = i;
                
                while (wordStart > 0 && /[^\s.,!?;:()\[\]{}'"«»—\-]/.test(text[wordStart - 1])) {
                    wordStart--;
                }
                
                while (wordEnd < text.length && /[^\s.,!?;:()\[\]{}'"«»—\-]/.test(text[wordEnd])) {
                    wordEnd++;
                }
                
                if (wordStart < wordEnd) {
                    const word = text.substring(wordStart, wordEnd);
                    problematicWords.add(word);
                    logActivity(`      Context: "${text.substring(Math.max(0, i - 10), Math.min(text.length, i + 11))}"`, LOG.WARN);
                }
                
                foundSpecificIssues = true;
            }
        }
        
        if (problematicPositions.length === 0) {
            logActivity("  ✓ No problematic characters found", LOG.INFO);
        } else {
            logActivity(`  ⚠️  Total: ${problematicPositions.length} problematic character(s)`, LOG.WARN);
            
            // Highlight problematic words in red
            if (problematicWords.size > 0) {
                logActivity(`Highlighting ${problematicWords.size} problematic word(s) in red...`, LOG.INFO);
                
                const paraRange = para.getRange();
                let highlightedCount = 0;
                
                for (const word of problematicWords) {
                    try {
                        const wordResults = paraRange.search(word, {
                            matchCase: true,
                            matchWholeWord: false
                        });
                        wordResults.load('items');
                        await context.sync();
                        
                        for (let i = 0; i < wordResults.items.length; i++) {
                            wordResults.items[i].font.highlightColor = "Red";
                            highlightedCount++;
                        }
                        
                        const cleanWord = word.replace(/[\u0000-\u001F\u200B-\u200F\uFEFF\uFFFD]/g, '�');
                        logActivity(`  ✓ Highlighted word: "${cleanWord}"`, LOG.INFO);
                        
                    } catch (wordErr) {
                        logActivity(`  ✗ Could not highlight word: ${wordErr.message}`, LOG.WARN);
                    }
                }
                
                await context.sync();
                logActivity(`✅ Highlighted ${highlightedCount} word instance(s) in red`, LOG.INFO);
            }
        }
        
        // ═══ UNICODE RANGE ANALYSIS ═══
        const suspiciousRanges = {
            'Georgian Extended': /[\u1C90-\u1CBF]/g,
            'Combining Diacritics': /[\u0300-\u036F]/g,
            'Private Use Area': /[\uE000-\uF8FF]/g,
            'Specials': /[\uFFF0-\uFFFF]/g
        };
        
        let foundSuspiciousRanges = false;
        for (const [rangeName, regex] of Object.entries(suspiciousRanges)) {
            const matches = text.match(regex);
            if (matches && matches.length > 0) {
                if (!foundSuspiciousRanges) {
                    logActivity("Suspicious Unicode Ranges:", LOG.INFO);
                    foundSuspiciousRanges = true;
                }
                logActivity(`  - ${rangeName}: ${matches.length} character(s)`, LOG.WARN);
                foundSpecificIssues = true;
            }
        }
        
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        
        if (foundSpecificIssues) {
            logActivity("VERDICT: Specific character issues detected and highlighted", LOG.WARN);
        } else {
            logActivity("VERDICT: No specific character issues - likely structural OOXML error", LOG.WARN);
        }
        
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        
        return foundSpecificIssues;
        
    } catch (err) {
        logActivity(`Analysis error: ${err.message}`, LOG.ERROR);
        return false;
    }
}

/**
 * 🔍 Validate OOXML structure before insertion
 * Based on Microsoft's Word OOXML documentation
 */
function validateOOXML(ooxmlString) {
    try {
        // Basic validation
        if (!ooxmlString || ooxmlString.trim().length === 0) {
            return { valid: false, reason: 'Empty OOXML' };
        }
        
        // Check if it's valid XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ooxmlString, "text/xml");
        
        // Check for parser errors
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        if (parserError.length > 0) {
            return { valid: false, reason: 'XML parsing error: ' + parserError[0].textContent };
        }
        
        // Check for required namespace
        const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        if (!ooxmlString.includes(ns)) {
            return { valid: false, reason: 'Missing required Word namespace' };
        }
        
        // Check for balanced w:t and w:r tags
        const openT = (ooxmlString.match(/<w:t[>\s]/g) || []).length;
        const closeT = (ooxmlString.match(/<\/w:t>/g) || []).length;
        if (openT !== closeT) {
            return { valid: false, reason: `Unbalanced w:t tags: ${openT} open, ${closeT} close` };
        }
        
        const openR = (ooxmlString.match(/<w:r[>\s]/g) || []).length;
        const closeR = (ooxmlString.match(/<\/w:r>/g) || []).length;
        if (openR !== closeR) {
            return { valid: false, reason: `Unbalanced w:r tags: ${openR} open, ${closeR} close` };
        }
        
        return { valid: true };
        
    } catch (err) {
        return { valid: false, reason: 'Validation error: ' + err.message };
    }
}

/**
 * 🔍 Check for problematic OOXML elements that might cause insertion to fail
 */
function checkProblematicOOXMLElements(ooxmlString) {
    const problematicElements = [];
    
    const elementsToCheck = {
        // Track Changes (MUST SKIP)
        'ins': 'w:ins',
        'del': 'w:del',
        'moveFrom': 'w:moveFrom',
        'moveTo': 'w:moveTo',
        'moveFromRangeStart': 'w:moveFromRangeStart',
        'moveFromRangeEnd': 'w:moveFromRangeEnd',
        'moveToRangeStart': 'w:moveToRangeStart',
        'moveToRangeEnd': 'w:moveToRangeEnd',
        
        // Content Controls (MUST SKIP)
        'contentControl': 'w:sdt',
        
        // Fields - TOC/Index/Cross-refs (MUST SKIP)
        'fldChar': 'w:fldChar',
        'fldSimple': 'w:fldSimple',
        'fldData': 'w:fldData',
        
        // Permissions/Protection (MUST SKIP)
        'permStart': 'w:permStart',
        'permEnd': 'w:permEnd',
        
        // Custom XML (RECOMMENDED SKIP for data-bound documents)
        'customXml': 'w:customXml',
        'customXmlInsRangeStart': 'w:customXmlInsRangeStart',
        'customXmlDelRangeStart': 'w:customXmlDelRangeStart',
        'customXmlMoveFromRangeStart': 'w:customXmlMoveFromRangeStart',
        'customXmlMoveToRangeStart': 'w:customXmlMoveToRangeStart',
        
        // Math Equations (RECOMMENDED SKIP - can be complex)
        'oMath': 'm:oMath',
        'oMathPara': 'm:oMathPara',
        
        // Subdocuments (RECOMMENDED SKIP)
        'subDoc': 'w:subDoc',
        
        // Safe elements (for detection only, won't skip)
        'bookmarkStart': 'w:bookmarkStart',
        'bookmarkEnd': 'w:bookmarkEnd',
        'commentRangeStart': 'w:commentRangeStart',
        'commentRangeEnd': 'w:commentRangeEnd',
        'hyperlink': 'w:hyperlink',
        'smartTag': 'w:smartTag',
        'proofErr': 'w:proofErr'
    };
    
    for (const [name, tag] of Object.entries(elementsToCheck)) {
        if (ooxmlString.includes(tag)) {
            // Match only actual XML tags/attributes, not substrings
            // Use word boundary or XML delimiters (< > space =)
            const escapedTag = tag.replace(/:/g, '\\:');
            const regex = new RegExp(`<${escapedTag}[\\s>]`, 'g');
            const matches = ooxmlString.match(regex) || [];
            const count = matches.length;
            
            if (count > 0) {
                problematicElements.push(`${name}(${count})`);
            }
        }
    }
    
    return problematicElements;
}

/**
 * 🔧 PASS 1: Remove ALL soft hyphens from OOXML (both tags and characters)
 * Returns clean OOXML with NO hyphens whatsoever
 */
function removeAllHyphensFromOOXML(ooxmlString) {
    let changed = false;
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ooxmlString, "text/xml");
        const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        
        // Remove all <w:softHyphen/> XML tags
        const existingSoftHyphens = xmlDoc.getElementsByTagNameNS(ns, 'softHyphen');
        while (existingSoftHyphens.length > 0) {
            existingSoftHyphens[0].parentNode.removeChild(existingSoftHyphens[0]);
            changed = true;
        }
        
        // Remove all \u00AD characters from text nodes
        const textNodes = xmlDoc.getElementsByTagNameNS(ns, 't');
        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            const originalText = textNode.textContent;
            const cleanedText = originalText.replace(/\u00AD/g, '');

            if (cleanedText !== originalText) {
                textNode.textContent = cleanedText;
                changed = true;
            }
        }

        // Word routinely splits one word across several runs (spell-check
        // markers, revision ids). Remove spell-check markers and merge
        // consecutive runs with identical formatting so that, after the
        // strip, the hyphenation regex sees whole words again.
        const proofErrs = xmlDoc.getElementsByTagNameNS(ns, 'proofErr');
        while (proofErrs.length > 0) {
            proofErrs[0].parentNode.removeChild(proofErrs[0]);
        }

        const rPrSerializer = new XMLSerializer();
        const runProps = function (run) {
            for (let c = run.firstChild; c; c = c.nextSibling) {
                if (c.nodeType === 1 && c.localName === 'rPr') {
                    return rPrSerializer.serializeToString(c);
                }
            }
            return '';
        };

        const mergeParas = xmlDoc.getElementsByTagNameNS(ns, 'p');
        for (let i = 0; i < mergeParas.length; i++) {
            let child = mergeParas[i].firstChild;
            while (child) {
                if (child.nodeType === 1 && child.localName === 'r') {
                    let next = child.nextSibling;
                    while (next && next.nodeType === 3 && !next.textContent.trim()) {
                        next = next.nextSibling;
                    }
                    if (next && next.nodeType === 1 && next.localName === 'r' &&
                            runProps(child) === runProps(next)) {
                        let moving = next.firstChild;
                        while (moving) {
                            const after = moving.nextSibling;
                            if (!(moving.nodeType === 1 && moving.localName === 'rPr')) {
                                child.appendChild(moving);
                            }
                            moving = after;
                        }
                        while (child.nextSibling && child.nextSibling !== next) {
                            mergeParas[i].removeChild(child.nextSibling);
                        }
                        mergeParas[i].removeChild(next);
                        continue; // child may now merge with the following run
                    }
                }
                child = child.nextSibling;
            }
        }

        // Merge adjacent <w:t> fragments left behind by the removed soft
        // hyphens so re-hyphenation sees whole words again. (The old
        // two-pass flow got this merge for free from Word's write+read
        // round-trip; the in-memory pipeline must do it itself.)
        const runs = xmlDoc.getElementsByTagNameNS(ns, 'r');
        for (let i = 0; i < runs.length; i++) {
            let child = runs[i].firstChild;
            while (child) {
                if (child.nodeType === 1 && child.localName === 't') {
                    let next = child.nextSibling;
                    // Skip whitespace-only text nodes between elements
                    while (next && next.nodeType === 3 && !next.textContent.trim()) {
                        next = next.nextSibling;
                    }
                    if (next && next.nodeType === 1 && next.localName === 't') {
                        child.textContent += next.textContent;
                        if (next.getAttribute('xml:space') === 'preserve') {
                            child.setAttribute('xml:space', 'preserve');
                        }
                        while (child.nextSibling && child.nextSibling !== next) {
                            runs[i].removeChild(child.nextSibling);
                        }
                        runs[i].removeChild(next);
                        continue; // try to merge further fragments into child
                    }
                }
                child = child.nextSibling;
            }
        }

        const serializer = new XMLSerializer();
        return {
            ooxml: serializer.serializeToString(xmlDoc),
            changed: changed
        };
        
    } catch (err) {
        logActivity(`OOXML Pass 1 error: ${err.message}`, LOG.ERROR);
        return { ooxml: ooxmlString, changed: false };
    }
}

/**
 * 🔧 PASS 2: Add NEW soft hyphens to clean OOXML
 * Expects OOXML with NO existing hyphens (from Pass 1)
 */
function addHyphensToOOXML(ooxmlString) {
    if (!hyphenator) return { ooxml: ooxmlString, changed: false, wordsProcessed: 0, wordsHyphenated: 0 };
    let changed = false;
    let wordsProcessed = 0;
    let wordsHyphenated = 0;
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ooxmlString, "text/xml");
        const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        
        const textNodes = xmlDoc.getElementsByTagNameNS(ns, 't');
        const marker = "[[SH]]"; // დროებითი მარკერი
        
        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            const originalText = textNode.textContent;
            
            // Apply hyphenation algorithm to Georgian words
            const hyphenatedText = originalText.replace(/[ა-ჰ]{4,}/g, (word) => {
                wordsProcessed++;
                const result = hyphenator.hyphenate(word).replace(/\u00AD/g, marker);
                if (result.includes(marker)) wordsHyphenated++;
                return result;
            });
            
            // If hyphenation was added, split and insert soft hyphen tags
            if (hyphenatedText.includes(marker)) {
                changed = true;
                const parent = textNode.parentNode;
                const parts = hyphenatedText.split(marker);
                
                parts.forEach((part, index) => {
                    const newT = xmlDoc.createElementNS(ns, 'w:t');
                    if (part.startsWith(' ') || part.endsWith(' ')) {
                        newT.setAttribute('xml:space', 'preserve');
                    }
                    newT.textContent = part;
                    parent.insertBefore(newT, textNode);
                    
                    if (index < parts.length - 1) {
                        const sh = xmlDoc.createElementNS(ns, 'w:softHyphen');
                        parent.insertBefore(sh, textNode);
                    }
                });
                parent.removeChild(textNode);
            }
        }
        
        const serializer = new XMLSerializer();
        return {
            ooxml: serializer.serializeToString(xmlDoc),
            changed: changed,
            wordsProcessed: wordsProcessed,
            wordsHyphenated: wordsHyphenated
        };
        
    } catch (err) {
        logActivity(`OOXML Pass 2 error: ${err.message}`, LOG.ERROR);
        return { ooxml: ooxmlString, changed: false, wordsProcessed: 0, wordsHyphenated: 0 };
    }
}

/**
 * ✅ Clear all highlighting from the document
 */
async function clearHighlighting() {
    await Word.run(async (context) => {
        logActivity("Clearing all highlighting…");
        
        const body = context.document.body;
        body.font.highlightColor = null;
        
        await context.sync();
        logActivity(`All highlighting cleared from document`);
    });
}