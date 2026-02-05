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

const Hyphenator = {
    hyphenChar: '\u00AD', 
    vowels: 'აეიოუ',
    leftMin: 2,
    rightMin: 2,
    harmonicClusters: new Set([
        'ბლ', 'ბრ', 'ბღ', 'ბზ', 'გდ', 'გლ', 'გმ', 'გნ', 'გვ', 'გზ', 'გრ',
        'დრ', 'თლ', 'თრ', 'თღ', 'კლ', 'კმ', 'კნ', 'კრ', 'კვ', 'მტ', 'პლ', 
        'პრ', 'ჟღ', 'რგ', 'რლ', 'რმ', 'სწ', 'სხ', 'ტკ', 'ტპ', 'ტრ', 'ფლ', 
        'ფრ', 'ფქ', 'ფშ', 'ქლ', 'ქნ', 'ქვ', 'ქრ', 'ღლ', 'ღრ', 'ყლ', 'ყრ', 
        'შთ', 'შპ', 'ჩქ', 'ჩრ', 'ცლ', 'ცნ', 'ცრ', 'ცვ', 'ძგ', 'ძვ', 'ძღ', 
        'წლ', 'წრ', 'წნ', 'წკ', 'ჭკ', 'ჭრ', 'ჭყ', 'ხლ', 'ხმ', 'ხნ', 'ხვ', 'ჯგ'
    ]),
    dictionary: new Map(),

    async init() {
        try {
            // გამოყენებულია v2.2.6-ის შესაბამისი CDN
            const req = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.6/data/exceptions.json');
            if (req.ok) {
                const data = await req.json();
                Object.entries(data).forEach(([key, val]) => {
                    // ლექსიკონში ტირეებს ვცვლით Word-ის Soft Hyphen-ით
                    this.dictionary.set(key, val.replace(/-/g, this.hyphenChar));
                });
                logActivity(`Dictionary loaded: ${this.dictionary.size} entries`);
            }
        } catch (e) { 
            logActivity("Dictionary load failed — algorithm-only mode", LOG.WARN);
        }
    },

    getHyphenatedWord(word) {
        // ლექსიკონის შემოწმება
        if (this.dictionary.has(word)) return this.dictionary.get(word);
        
        // ალგორითმის გამოყენება
        return this.applyAlgorithm(word);
    },

    applyAlgorithm(word) {
        // მინიმალური სიგრძის შემოწმება (leftMin + rightMin = 4)
        if (word.length < (this.leftMin + this.rightMin)) return word;

        const vowelIndices = [];
        for (let i = 0; i < word.length; i++) {
            if (this.vowels.includes(word[i])) vowelIndices.push(i);
        }

        if (vowelIndices.length < 2) return word;

        const insertPoints = [];
        for (let i = 0; i < vowelIndices.length - 1; i++) {
            const v1 = vowelIndices[i];
            const v2 = vowelIndices[i + 1];
            const distance = v2 - v1 - 1;
            const betweenSubstring = word.substring(v1 + 1, v2);

            let candidatePos = -1;

            if (distance === 0 || distance === 1) {
                // ორი ხმოვანი გვერდიგვერდ ან ერთი თანხმოვანი მათ შორის
                candidatePos = v1 + 1;
            } else {
                // Gemination (ორმაგი თანხმოვანი) შემოწმება
                let doubleConsonantIndex = -1;
                for (let j = 0; j < betweenSubstring.length - 1; j++) {
                    if (betweenSubstring[j] === betweenSubstring[j + 1]) {
                        doubleConsonantIndex = j;
                        break;
                    }
                }

                if (doubleConsonantIndex !== -1) {
                    candidatePos = v1 + 1 + doubleConsonantIndex + 1;
                } else {
                    // Harmonic cluster (ჰარმონიული ჯგუფის) შემოწმება
                    let breakIndex = -1;
                    if (distance >= 2) {
                        const lastTwo = betweenSubstring.substring(distance - 2, distance);
                        if (this.harmonicClusters.has(lastTwo)) {
                            breakIndex = distance - 2;
                        }
                    }
                    candidatePos = (breakIndex !== -1) ? v1 + 1 + breakIndex : v1 + 2;
                }
            }

            // Anti-orphan protection: არ ვუშვებთ ობოლ ასოებს სიტყვის დასაწყისში ან ბოლოში
            if (candidatePos >= this.leftMin && (word.length - candidatePos) >= this.rightMin) {
                insertPoints.push(candidatePos);
            }
        }

        // სიმბოლოების ჩასმა უკუპროპორციული მიმდევრობით (რომ ინდექსები არ აირიოს)
        let result = word.split('');
        for (let i = insertPoints.length - 1; i >= 0; i--) {
            result.splice(insertPoints[i], 0, this.hyphenChar);
        }
        return result.join('');
    }
};

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
            }, 1000); // Check every second for theme changes
        }
        
        Hyphenator.init();
        
        document.getElementById('hyphenate-document').onclick = () => runSafe(hyphenateBody);
        document.getElementById('hyphenate-selection').onclick = () => runSafe(hyphenateSelection);
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
        logActivity("Full-document hyphenation started (two-pass)");
        
        const body = context.document.body;
        const stats = await processRangeWithTwoPass(context, body, "document");
        
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity(`Completed in ${timerEnd('fullDoc')} ms — words processed: ${stats.processed}, hyphenated: ${stats.success}, paragraphs: ${stats.paragraphs}`);
    });
    hideProgress();
}

/**
 * ✅ HYPHENATE SELECTION using TWO-PASS OOXML method
 * Works directly on the selection range, not on paragraphs
 */
async function hyphenateSelection() {
    showProgress();
    timerStart('selection');
    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity("Selection hyphenation started (two-pass)");
        
        const selection = context.document.getSelection();
        
        // Load selection text to check if it contains Georgian
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
        
        logActivity(`Selection: ${selection.text.length} chars`);
        
        // ═══════════════════════════════════════════════════════
        // PASS 1: REMOVE ALL EXISTING HYPHENS FROM SELECTION
        // ═══════════════════════════════════════════════════════
        updateProgress(10, '🗑️ მოძველებული ნიშნების წაშლა...');
        timerStart('selPass1');
        logActivity("Pass 1 — removing existing hyphens…");
        
        try {
            const ooxml1 = selection.getOoxml();
            await context.sync();
            
            updateProgress(30, '🗑️ მოძველებული ნიშნების წაშლა...');
            const cleanedOOXML = removeAllHyphensFromOOXML(ooxml1.value);
            
            if (cleanedOOXML.changed) {
                selection.insertOoxml(cleanedOOXML.ooxml, Word.InsertLocation.replace);
                await context.sync();
                logActivity(`Pass 1 done in ${timerEnd('selPass1')} ms — hyphens removed`);
            } else {
                logActivity(`Pass 1 done in ${timerEnd('selPass1')} ms — nothing to remove`);
            }
        } catch (err) {
            logActivity(`Pass 1 failed: ${err.message}`, LOG.ERROR);
            // Highlight the problematic selection
            try {
                selection.font.highlightColor = "yellow";
                await context.sync();
            } catch (highlightErr) {
                // If highlighting fails, just continue
            }
            hideProgress();
            return;
        }
        
        // ═══════════════════════════════════════════════════════
        // PASS 2: ADD NEW HYPHENS TO CLEAN SELECTION
        // ═══════════════════════════════════════════════════════
        updateProgress(60, '➕ ახალი ნიშნების დამატება...');
        timerStart('selPass2');
        logActivity("Pass 2 — adding new hyphens…");
        
        try {
            // Get selection again after Pass 1 changes
            const selection2 = context.document.getSelection();
            const ooxml2 = selection2.getOoxml();
            await context.sync();
            
            updateProgress(80, '➕ ახალი ნიშნების დამატება...');
            const hyphenatedOOXML = addHyphensToOOXML(ooxml2.value);
            
            if (hyphenatedOOXML.changed) {
                selection2.insertOoxml(hyphenatedOOXML.ooxml, Word.InsertLocation.replace);
                await context.sync();
                
                updateProgress(100, '✅ დასრულდა');
                logActivity(`Pass 2 done in ${timerEnd('selPass2')} ms — ${hyphenatedOOXML.wordsHyphenated} of ${hyphenatedOOXML.wordsProcessed} words hyphenated`);
            } else {
                updateProgress(100, '✅ დასრულდა');
                logActivity(`Pass 2 done in ${timerEnd('selPass2')} ms — no words needed hyphenation`, LOG.WARN);
            }
        } catch (err) {
            logActivity(`Pass 2 failed: ${err.message}`, LOG.ERROR);
            // Highlight the problematic selection
            try {
                const selection2 = context.document.getSelection();
                selection2.font.highlightColor = "yellow";
                await context.sync();
            } catch (highlightErr) {
                // If highlighting fails, just continue
            }
        }

        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", LOG.SEP);
        logActivity(`Completed in ${timerEnd('selection')} ms`);
    });
    
    setTimeout(hideProgress, 1000); // Keep progress visible for 1 second
}

/**
 * 🔧 TWO-PASS APPROACH: First remove ALL hyphens, then add NEW ones
 * This prevents mixing old and new hyphen positions
 */
async function processRangeWithTwoPass(context, range, rangeType) {
    let totalProcessed = 0;
    let totalSuccess = 0;
    let paragraphsProcessed = 0;
    
    try {
        // Get all paragraphs
        const paragraphs = range.paragraphs;
        paragraphs.load("items");
        await context.sync();
        
        logActivity(`Found ${paragraphs.items.length} paragraphs`);
        updateProgress(5, 'პარაგრაფების მომზადება...');
        
        // Filter paragraphs that need processing
        const validParagraphs = [];
        
        for (let i = 0; i < paragraphs.items.length; i++) {
            const para = paragraphs.items[i];
            para.load("text, style, isListItem");
        }
        await context.sync();
        
        for (let i = 0; i < paragraphs.items.length; i++) {
            const para = paragraphs.items[i];
            
            // Skip empty paragraphs
            if (!para.text || para.text.trim().length < 4) continue;
            
            // Skip headings
            if (para.style) {
                const styleStr = para.style.toString().toLowerCase();
                if (styleStr.includes("heading") || styleStr.includes("title") || styleStr.includes("toc")) {
                    continue;
                }
            }
            
            // Skip list items
            if (para.isListItem) continue;
            
            // Skip if no Georgian text
            if (!/[ა-ჰ]/.test(para.text)) continue;
            
            validParagraphs.push(para);
        }
        
        logActivity(`${validParagraphs.length} paragraphs contain Georgian text`);
        updateProgress(10, `${validParagraphs.length} პარაგრამი მოიძებნა`);
        
        if (validParagraphs.length === 0) {
            logActivity("No valid paragraphs to process", LOG.WARN);
            return { processed: 0, success: 0, paragraphs: 0 };
        }
        
        // ═══════════════════════════════════════════════════════
        // PASS 1: REMOVE ALL EXISTING HYPHENS
        // ═══════════════════════════════════════════════════════
        timerStart('pass1');
        logActivity("Pass 1 — removing existing hyphens…");
        updateProgress(15, '🗑️ ძველი ნიშნების წაშლა...');
        
        const CHUNK_SIZE = 10;
        let removedCount = 0;
        const pass1Errors = [];
        
        for (let i = 0; i < validParagraphs.length; i += CHUNK_SIZE) {
            const endIdx = Math.min(i + CHUNK_SIZE, validParagraphs.length);
            
            for (let j = i; j < endIdx; j++) {
                try {
                    const para = validParagraphs[j];
                    const paraRange = para.getRange();
                    const ooxml = paraRange.getOoxml();
                    await context.sync();
                    
                    const cleanedOOXML = removeAllHyphensFromOOXML(ooxml.value);
                    
                    if (cleanedOOXML.changed) {
                        paraRange.insertOoxml(cleanedOOXML.ooxml, Word.InsertLocation.replace);
                        removedCount++;
                    }
                    
                } catch (err) {
                    // Capture detailed error information
                    const para = validParagraphs[j];
                    try {
                        para.load('text,style,styleBuiltIn');
                        await context.sync();
                        
                        const errorDetails = {
                            paraNum: j,
                            textPreview: para.text ? para.text.substring(0, 50) + (para.text.length > 50 ? '...' : '') : '',
                            style: para.style || 'unknown'
                        };
                        
                        pass1Errors.push(`para ${j}: ${err.message} | text: "${errorDetails.textPreview}" | style: ${errorDetails.style}`);
                    } catch (loadErr) {
                        pass1Errors.push(`para ${j}: ${err.message}`);
                    }
                    
                    // Highlight the problematic content
                    try {
                        await highlightProblematicContent(context, para);
                    } catch (highlightErr) {
                        // If highlighting fails, just continue
                    }
                }
            }
            
            // Update progress
            const progress = 15 + ((i + CHUNK_SIZE) / validParagraphs.length) * 35; // 15% to 50%
            updateProgress(progress, `🗑️ წაშლა: ${Math.min(i + CHUNK_SIZE, validParagraphs.length)}/${validParagraphs.length}`);
            
            // Sync after each chunk
            await context.sync();
        }
        
        logActivity(`Pass 1 done in ${timerEnd('pass1')} ms — ${removedCount} paragraphs cleaned`);
        if (pass1Errors.length) {
            logActivity(`Pass 1 errors (${pass1Errors.length}): ${pass1Errors.join(' | ')}`, LOG.ERROR);
        }
        updateProgress(50, '✓ ძველი ნიშნები წაშლილია');
        
        // ═══════════════════════════════════════════════════════
        // PASS 2: ADD NEW HYPHENS TO CLEAN TEXT
        // ═══════════════════════════════════════════════════════
        timerStart('pass2');
        logActivity("Pass 2 — adding new hyphens…");
        updateProgress(55, '➕ ახალი ნიშნების დამატება...');
        
        // Need to reload paragraphs after Pass 1 changes
        const paragraphs2 = range.paragraphs;
        paragraphs2.load("items");
        await context.sync();
        
        // Re-filter valid paragraphs (indices may have changed)
        const validParagraphs2 = [];
        
        for (let i = 0; i < paragraphs2.items.length; i++) {
            const para = paragraphs2.items[i];
            para.load("text, style, isListItem");
        }
        await context.sync();
        
        for (let i = 0; i < paragraphs2.items.length; i++) {
            const para = paragraphs2.items[i];
            
            if (!para.text || para.text.trim().length < 4) continue;
            
            if (para.style) {
                const styleStr = para.style.toString().toLowerCase();
                if (styleStr.includes("heading") || styleStr.includes("title") || styleStr.includes("toc")) {
                    continue;
                }
            }
            
            if (para.isListItem) continue;
            if (!/[ა-ჰ]/.test(para.text)) continue;
            
            validParagraphs2.push(para);
        }
        
        const pass2Errors = [];
        
        for (let i = 0; i < validParagraphs2.length; i += CHUNK_SIZE) {
            const endIdx = Math.min(i + CHUNK_SIZE, validParagraphs2.length);
            
            for (let j = i; j < endIdx; j++) {
                try {
                    const para = validParagraphs2[j];
                    const paraRange = para.getRange();
                    const ooxml = paraRange.getOoxml();
                    await context.sync();
                    
                    const hyphenatedOOXML = addHyphensToOOXML(ooxml.value);
                    
                    if (hyphenatedOOXML.changed) {
                        paraRange.insertOoxml(hyphenatedOOXML.ooxml, Word.InsertLocation.replace);
                        totalSuccess += hyphenatedOOXML.wordsHyphenated;
                        totalProcessed += hyphenatedOOXML.wordsProcessed;
                        paragraphsProcessed++;
                    }
                    
                } catch (err) {
                    // Capture detailed error information
                    const para = validParagraphs2[j];
                    try {
                        para.load('text,style,styleBuiltIn,alignment,firstLineIndent,leftIndent,rightIndent,spaceAfter,spaceBefore,lineSpacing,outlineLevel');
                        await context.sync();
                        
                        const errorDetails = {
                            paraNum: j,
                            textLength: para.text ? para.text.length : 0,
                            textPreview: para.text ? para.text.substring(0, 50) + (para.text.length > 50 ? '...' : '') : '',
                            style: para.style || 'unknown',
                            alignment: para.alignment || 'unknown',
                            error: err.message
                        };
                        
                        pass2Errors.push(`para ${j}: ${err.message} | text: "${errorDetails.textPreview}" | style: ${errorDetails.style}`);
                        logActivity(`Error details: Length=${errorDetails.textLength}, Style=${errorDetails.style}, Alignment=${errorDetails.alignment}`, LOG.WARN);
                    } catch (loadErr) {
                        pass2Errors.push(`para ${j}: ${err.message}`);
                    }
                    
                    // Highlight the problematic content
                    try {
                        await highlightProblematicContent(context, para);
                    } catch (highlightErr) {
                        // If highlighting fails, just continue
                    }
                }
            }
            
            // Update progress
            const progress = 55 + ((i + CHUNK_SIZE) / validParagraphs2.length) * 40; // 55% to 95%
            updateProgress(progress, `➕ დამატება: ${Math.min(i + CHUNK_SIZE, validParagraphs2.length)}/${validParagraphs2.length}`);
            
            // Sync after each chunk
            await context.sync();
        }
        
        logActivity(`Pass 2 done in ${timerEnd('pass2')} ms — ${paragraphsProcessed} paragraphs hyphenated`);
        if (pass2Errors.length) {
            logActivity(`Pass 2 errors (${pass2Errors.length}): ${pass2Errors.join(' | ')}`, LOG.ERROR);
        }
        updateProgress(100, '✅ დასრულდა');
        
    } catch (err) {
        logActivity(`Processing error: ${err.message}`, LOG.ERROR);
    }
    
    return {
        processed: totalProcessed,
        success: totalSuccess,
        paragraphs: paragraphsProcessed
    };
}

/**
 * 🔍 COMPREHENSIVE error detection and highlighting
 * Captures EVERY possible detail about problematic paragraphs
 */
async function highlightProblematicContent(context, para) {
    try {
        // Load ALL available paragraph properties for comprehensive analysis
        para.load('text,font,style,styleBuiltIn,alignment,isListItem,leftIndent,rightIndent,firstLineIndent,lineSpacing,spaceAfter,spaceBefore,outlineLevel,listItem');
        await context.sync();
        
        const text = para.text;
        let foundSpecificIssues = false;
        let diagnosticInfo = [];
        
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        logActivity("DETAILED PARAGRAPH ANALYSIS", LOG.INFO);
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        
        // ═══ BASIC INFO ═══
        diagnosticInfo.push(`Text length: ${text.length} characters`);
        diagnosticInfo.push(`Style: ${para.style || 'unknown'}`);
        diagnosticInfo.push(`Built-in style: ${para.styleBuiltIn || 'unknown'}`);
        diagnosticInfo.push(`Alignment: ${para.alignment || 'unknown'}`);
        diagnosticInfo.push(`Is list item: ${para.isListItem ? 'YES' : 'NO'}`);
        diagnosticInfo.push(`Left indent: ${para.leftIndent || 0}pt`);
        diagnosticInfo.push(`Right indent: ${para.rightIndent || 0}pt`);
        diagnosticInfo.push(`First line indent: ${para.firstLineIndent || 0}pt`);
        diagnosticInfo.push(`Line spacing: ${para.lineSpacing || 'default'}`);
        diagnosticInfo.push(`Space after: ${para.spaceAfter || 0}pt`);
        diagnosticInfo.push(`Space before: ${para.spaceBefore || 0}pt`);
        diagnosticInfo.push(`Outline level: ${para.outlineLevel || 'none'}`);
        
        logActivity("Basic Properties:", LOG.INFO);
        diagnosticInfo.forEach(info => logActivity(`  - ${info}`, LOG.INFO));
        diagnosticInfo = [];
        
        // ═══ TEXT PREVIEW ═══
        const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
        logActivity(`Text preview: "${preview}"`, LOG.INFO);
        
        // ═══ CHARACTER-BY-CHARACTER ANALYSIS ═══
        logActivity("Character Analysis:", LOG.INFO);
        
        // Count character types
        let georgianCount = 0;
        let latinCount = 0;
        let digitCount = 0;
        let spaceCount = 0;
        let punctuationCount = 0;
        let otherCount = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const code = text.charCodeAt(i);
            
            if (code >= 0x10A0 && code <= 0x10FF) georgianCount++; // Georgian
            else if (code >= 0x1C90 && code <= 0x1CBF) georgianCount++; // Georgian Extended
            else if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) latinCount++; // Latin
            else if (code >= 0x30 && code <= 0x39) digitCount++; // Digits
            else if (code === 0x20 || code === 0xA0 || code === 0x09) spaceCount++; // Spaces
            else if (/[.,!?;:()\[\]{}'"«»—\-]/.test(char)) punctuationCount++;
            else otherCount++;
        }
        
        logActivity(`  - Georgian characters: ${georgianCount}`, LOG.INFO);
        logActivity(`  - Latin characters: ${latinCount}`, LOG.INFO);
        logActivity(`  - Digits: ${digitCount}`, LOG.INFO);
        logActivity(`  - Spaces: ${spaceCount}`, LOG.INFO);
        logActivity(`  - Punctuation: ${punctuationCount}`, LOG.INFO);
        logActivity(`  - Other characters: ${otherCount}`, LOG.INFO);
        
        // ═══ PROBLEMATIC CHARACTERS DETECTION ═══
        logActivity("Scanning for Problematic Characters:", LOG.INFO);
        
        const problematicChars = {
            // Zero-width characters
            '\u200B': 'ZERO WIDTH SPACE',
            '\u200C': 'ZERO WIDTH NON-JOINER',
            '\u200D': 'ZERO WIDTH JOINER',
            '\u200E': 'LEFT-TO-RIGHT MARK',
            '\u200F': 'RIGHT-TO-LEFT MARK',
            '\uFEFF': 'ZERO WIDTH NO-BREAK SPACE (BOM)',
            // Replacement and special
            '\uFFFD': 'REPLACEMENT CHARACTER',
            '\uFFFC': 'OBJECT REPLACEMENT CHARACTER',
            // Control characters
            '\u0000': 'NULL',
            '\u0001': 'START OF HEADING',
            '\u0002': 'START OF TEXT',
            '\u0003': 'END OF TEXT',
            '\u0004': 'END OF TRANSMISSION',
            '\u0005': 'ENQUIRY',
            '\u0006': 'ACKNOWLEDGE',
            '\u0007': 'BELL',
            '\u0008': 'BACKSPACE',
            '\u0009': 'TAB',
            '\u000B': 'VERTICAL TAB',
            '\u000C': 'FORM FEED',
            '\u000E': 'SHIFT OUT',
            '\u000F': 'SHIFT IN',
            '\u0010': 'DATA LINK ESCAPE',
            '\u0011': 'DEVICE CONTROL 1',
            '\u0012': 'DEVICE CONTROL 2',
            '\u0013': 'DEVICE CONTROL 3',
            '\u0014': 'DEVICE CONTROL 4',
            '\u0015': 'NEGATIVE ACKNOWLEDGE',
            '\u0016': 'SYNCHRONOUS IDLE',
            '\u0017': 'END OF TRANSMISSION BLOCK',
            '\u0018': 'CANCEL',
            '\u0019': 'END OF MEDIUM',
            '\u001A': 'SUBSTITUTE',
            '\u001B': 'ESCAPE',
            '\u001C': 'FILE SEPARATOR',
            '\u001D': 'GROUP SEPARATOR',
            '\u001E': 'RECORD SEPARATOR',
            '\u001F': 'UNIT SEPARATOR'
        };
        
        let problematicPositions = [];
        let problematicCharDetails = [];
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (problematicChars[char]) {
                problematicPositions.push(i);
                const charCode = text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0');
                const charName = problematicChars[char];
                problematicCharDetails.push({
                    position: i,
                    code: charCode,
                    name: charName,
                    context: text.substring(Math.max(0, i - 10), Math.min(text.length, i + 11))
                });
                logActivity(`  ⚠️  Found U+${charCode} (${charName}) at position ${i}`, LOG.WARN);
                logActivity(`      Context: "${text.substring(Math.max(0, i - 10), Math.min(text.length, i + 11))}"`, LOG.WARN);
                foundSpecificIssues = true;
            }
        }
        
        if (problematicPositions.length === 0) {
            logActivity("  ✓ No problematic characters found", LOG.INFO);
        } else {
            logActivity(`  ⚠️  TOTAL: ${problematicPositions.length} problematic character(s) detected`, LOG.WARN);
        }
        
        // ═══ UNUSUAL UNICODE RANGES ═══
        logActivity("Scanning Unicode Ranges:", LOG.INFO);
        
        const unicodeRanges = {
            'Georgian (U+10A0-U+10FF)': /[\u10A0-\u10FF]/g,
            'Georgian Extended (U+1C90-U+1CBF)': /[\u1C90-\u1CBF]/g,
            'Combining Diacritics (U+0300-U+036F)': /[\u0300-\u036F]/g,
            'General Punctuation (U+2000-U+206F)': /[\u2000-\u206F]/g,
            'Superscripts/Subscripts (U+2070-U+209F)': /[\u2070-\u209F]/g,
            'Currency Symbols (U+20A0-U+20CF)': /[\u20A0-\u20CF]/g,
            'Mathematical Operators (U+2200-U+22FF)': /[\u2200-\u22FF]/g,
            'Box Drawing (U+2500-U+257F)': /[\u2500-\u257F]/g,
            'Cyrillic (U+0400-U+04FF)': /[\u0400-\u04FF]/g,
            'Latin Extended-A (U+0100-U+017F)': /[\u0100-\u017F]/g,
            'Latin Extended-B (U+0180-U+024F)': /[\u0180-\u024F]/g,
            'Private Use Area (U+E000-U+F8FF)': /[\uE000-\uF8FF]/g,
            'Specials (U+FFF0-U+FFFF)': /[\uFFF0-\uFFFF]/g
        };
        
        for (const [rangeName, regex] of Object.entries(unicodeRanges)) {
            const matches = text.match(regex);
            if (matches && matches.length > 0) {
                logActivity(`  - ${rangeName}: ${matches.length} character(s)`, LOG.INFO);
                if (rangeName.includes('Private Use') || rangeName.includes('Specials')) {
                    logActivity(`    ⚠️  WARNING: This range may cause compatibility issues`, LOG.WARN);
                    foundSpecificIssues = true;
                }
            }
        }
        
        // ═══ UNUSUAL SPACING PATTERNS ═══
        logActivity("Spacing Pattern Analysis:", LOG.INFO);
        
        const spacingIssues = {
            'Multiple consecutive spaces': /  +/g,
            'Tab characters': /\t/g,
            'Non-breaking spaces': /\u00A0/g,
            'En space': /\u2002/g,
            'Em space': /\u2003/g,
            'Thin space': /\u2009/g,
            'Hair space': /\u200A/g,
            'Line separator': /\u2028/g,
            'Paragraph separator': /\u2029/g,
            'Narrow no-break space': /\u202F/g
        };
        
        for (const [issueName, regex] of Object.entries(spacingIssues)) {
            const matches = text.match(regex);
            if (matches && matches.length > 0) {
                logActivity(`  - ${issueName}: ${matches.length} occurrence(s)`, LOG.WARN);
                foundSpecificIssues = true;
            }
        }
        
        // ═══ BIDIRECTIONAL TEXT MARKERS ═══
        const bidiMarkers = {
            '\u200E': 'LEFT-TO-RIGHT MARK',
            '\u200F': 'RIGHT-TO-LEFT MARK',
            '\u202A': 'LEFT-TO-RIGHT EMBEDDING',
            '\u202B': 'RIGHT-TO-LEFT EMBEDDING',
            '\u202C': 'POP DIRECTIONAL FORMATTING',
            '\u202D': 'LEFT-TO-RIGHT OVERRIDE',
            '\u202E': 'RIGHT-TO-LEFT OVERRIDE',
            '\u2066': 'LEFT-TO-RIGHT ISOLATE',
            '\u2067': 'RIGHT-TO-LEFT ISOLATE',
            '\u2068': 'FIRST STRONG ISOLATE',
            '\u2069': 'POP DIRECTIONAL ISOLATE'
        };
        
        let bidiFound = false;
        for (const [char, name] of Object.entries(bidiMarkers)) {
            if (text.includes(char)) {
                if (!bidiFound) {
                    logActivity("Bidirectional Text Markers:", LOG.INFO);
                    bidiFound = true;
                }
                const count = (text.match(new RegExp(char, 'g')) || []).length;
                logActivity(`  - ${name}: ${count} occurrence(s)`, LOG.WARN);
                foundSpecificIssues = true;
            }
        }
        
        // ═══ WORD BOUNDARY ANALYSIS ═══
        const words = text.split(/\s+/).filter(w => w.length > 0);
        logActivity(`Word Analysis: ${words.length} words total`, LOG.INFO);
        
        // Check for very long words (possible concatenation issues)
        const longWords = words.filter(w => w.length > 30);
        if (longWords.length > 0) {
            logActivity(`  ⚠️  Found ${longWords.length} unusually long word(s) (>30 chars):`, LOG.WARN);
            longWords.forEach(word => {
                logActivity(`      "${word.substring(0, 50)}${word.length > 50 ? '...' : ''}"`, LOG.WARN);
            });
        }
        
        // Check for mixed script words
        const mixedScriptWords = words.filter(word => {
            const hasGeorgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/.test(word);
            const hasLatin = /[a-zA-Z]/.test(word);
            const hasCyrillic = /[\u0400-\u04FF]/.test(word);
            return (hasGeorgian && hasLatin) || (hasGeorgian && hasCyrillic) || (hasLatin && hasCyrillic);
        });
        
        if (mixedScriptWords.length > 0) {
            logActivity(`  ⚠️  Found ${mixedScriptWords.length} mixed-script word(s):`, LOG.WARN);
            mixedScriptWords.slice(0, 5).forEach(word => {
                logActivity(`      "${word}"`, LOG.WARN);
            });
            if (mixedScriptWords.length > 5) {
                logActivity(`      ... and ${mixedScriptWords.length - 5} more`, LOG.WARN);
            }
        }
        
        // ═══ FONT PROPERTIES ═══
        logActivity("Font Properties:", LOG.INFO);
        try {
            para.font.load('name,size,bold,italic,underline,color,highlightColor');
            await context.sync();
            
            logActivity(`  - Font name: ${para.font.name || 'default'}`, LOG.INFO);
            logActivity(`  - Font size: ${para.font.size || 'default'}pt`, LOG.INFO);
            logActivity(`  - Bold: ${para.font.bold ? 'YES' : 'NO'}`, LOG.INFO);
            logActivity(`  - Italic: ${para.font.italic ? 'YES' : 'NO'}`, LOG.INFO);
            logActivity(`  - Underline: ${para.font.underline || 'NONE'}`, LOG.INFO);
            logActivity(`  - Color: ${para.font.color || 'default'}`, LOG.INFO);
            if (para.font.highlightColor) {
                logActivity(`  - Highlight: ${para.font.highlightColor}`, LOG.INFO);
            }
        } catch (fontErr) {
            logActivity(`  ⚠️  Could not load font properties: ${fontErr.message}`, LOG.WARN);
        }
        
        // ═══ HIGHLIGHT PROBLEMATIC WORDS ═══
        if (problematicPositions.length > 0) {
            logActivity("Attempting to highlight problematic words...", LOG.INFO);
            
            // For each problematic character position, find the word boundaries
            const wordsToHighlight = new Set();
            
            for (const pos of problematicPositions) {
                // Find word boundaries
                let wordStart = pos;
                let wordEnd = pos;
                
                while (wordStart > 0 && /[^\s.,!?;:()\[\]{}'"«»—\-]/.test(text[wordStart - 1])) {
                    wordStart--;
                }
                
                while (wordEnd < text.length && /[^\s.,!?;:()\[\]{}'"«»—\-]/.test(text[wordEnd])) {
                    wordEnd++;
                }
                
                if (wordStart < wordEnd) {
                    const word = text.substring(wordStart, wordEnd);
                    wordsToHighlight.add(word);
                }
            }
            
            // Search and highlight each problematic word
            const paraRange = para.getRange();
            let highlightedCount = 0;
            
            for (const word of wordsToHighlight) {
                try {
                    const searchResults = paraRange.search(word, { 
                        matchCase: true,
                        matchWholeWord: false 
                    });
                    searchResults.load('items');
                    await context.sync();
                    
                    if (searchResults.items.length > 0) {
                        for (let i = 0; i < searchResults.items.length; i++) {
                            searchResults.items[i].font.highlightColor = "red";
                            highlightedCount++;
                        }
                        const cleanWord = word.replace(/[\u0000-\u001F\u200B-\u200F\uFEFF\uFFFD]/g, '�');
                        logActivity(`  ✓ Highlighted word: "${cleanWord}"`, LOG.INFO);
                    }
                } catch (searchErr) {
                    logActivity(`  ✗ Could not highlight word: ${searchErr.message}`, LOG.WARN);
                }
            }
            
            logActivity(`Total words highlighted in red: ${highlightedCount}`, LOG.INFO);
        }
        
        // ═══ FINAL VERDICT ═══
        para.font.highlightColor = "yellow";
        await context.sync();
        
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        if (foundSpecificIssues) {
            logActivity("VERDICT: Specific issues detected and highlighted", LOG.WARN);
        } else {
            logActivity("VERDICT: No specific characters found - structural OOXML error", LOG.WARN);
        }
        logActivity("═══════════════════════════════════════════════", LOG.SEP);
        
        return foundSpecificIssues;
        
    } catch (err) {
        logActivity(`CRITICAL: Highlighting function failed: ${err.message}`, LOG.ERROR);
        logActivity(`Stack trace: ${err.stack || 'not available'}`, LOG.ERROR);
        return false;
    }
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
                const result = Hyphenator.getHyphenatedWord(word).replace(/\u00AD/g, marker);
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