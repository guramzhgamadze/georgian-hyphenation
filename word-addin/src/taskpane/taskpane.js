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
        Hyphenator.init();
        
        document.getElementById('hyphenate-document').onclick = () => runSafe(hyphenateBody);
        document.getElementById('hyphenate-selection').onclick = () => runSafe(hyphenateSelection);
        document.getElementById('clear-log').onclick = clearLog;
        
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
        
        document.getElementById('status').textContent = "მზად არის (v6.0-TwoPass)";
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
                    pass1Errors.push(`para ${j}: ${err.message}`);
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
                    pass2Errors.push(`para ${j}: ${err.message}`);
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
        const paragraphs = body.paragraphs;
        paragraphs.load("items");
        await context.sync();
        
        let cleared = 0;
        for (let i = 0; i < paragraphs.items.length; i++) {
            try {
                const para = paragraphs.items[i];
                para.font.highlightColor = null;
                cleared++;
                
                if (i % 50 === 0) {
                    await context.sync();
                }
            } catch (err) {
                continue;
            }
        }
        
        await context.sync();
        logActivity(`Highlighting cleared from ${cleared} paragraphs`);
    });
}