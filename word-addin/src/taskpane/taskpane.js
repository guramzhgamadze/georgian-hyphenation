/* global Office Word */

const GEORGIAN_LANG_ID = "1079";

function logActivity(message) {
    const content = document.getElementById('error-log-content');
    const container = document.getElementById('error-log-container');
    if (container) container.style.display = 'block';
    if (content) {
        content.textContent += `> ${message}\n`;
        content.scrollTop = content.scrollHeight;
    }
}

function clearLog() {
    const content = document.getElementById('error-log-content');
    const container = document.getElementById('error-log-container');
    if (content) content.textContent = '';
    if (container) container.style.display = 'none';
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
                logActivity(`✅ Dictionary loaded: ${this.dictionary.size} entries`);
            }
        } catch (e) { 
            logActivity("⚠ Dictionary load failed - using algorithm only");
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
        logActivity("✅ Office.js loaded successfully");
        logActivity(`Host: ${info.host}, Platform: ${info.platform}`);
        logActivity("🔧 OOXML METHOD: Extract → Process → Replace");
        Hyphenator.init();
        
        document.getElementById('hyphenate-document').onclick = () => runSafe(hyphenateBody);
        document.getElementById('hyphenate-selection').onclick = () => runSafe(hyphenateSelection);
        document.getElementById('clear-log').onclick = clearLog;
        
        const clearHighlightBtn = document.getElementById('clear-highlighting');
        if (clearHighlightBtn) {
            clearHighlightBtn.onclick = () => runSafe(clearHighlighting);
        }
        
        document.getElementById('status').textContent = "მზად არის (v5.1)";
    } else {
        logActivity("❌ ERROR: Not running in Word");
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
        logActivity(`❌ ERROR: ${err.message}`);
        console.error(err);
    } finally {
        setButtonsEnabled(true);
    }
}

/**
 * ✅ HYPHENATE FULL DOCUMENT using OOXML method
 */
async function hyphenateBody() {
    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logActivity("🚀 Starting FULL DOCUMENT hyphenation (OOXML Method)");
        
        const body = context.document.body;
        const stats = await processRangeWithOOXML(context, body, "document");
        
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logActivity(`✅ COMPLETED:`);
        logActivity(`   Words processed: ${stats.processed}`);
        logActivity(`   Words hyphenated: ${stats.success}`);
        logActivity(`   Paragraphs processed: ${stats.paragraphs}`);
    });
}

/**
 * ✅ HYPHENATE SELECTION using OOXML method
 */
async function hyphenateSelection() {
    await Word.run(async (context) => {
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logActivity("🎯 Starting SELECTION hyphenation (OOXML Method)");
        
        const selection = context.document.getSelection();
        const stats = await processRangeWithOOXML(context, selection, "selection");
        
        logActivity("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        logActivity(`✅ COMPLETED:`);
        logActivity(`   Words processed: ${stats.processed}`);
        logActivity(`   Words hyphenated: ${stats.success}`);
        logActivity(`   Paragraphs processed: ${stats.paragraphs}`);
    });
}

/**
 * 🔧 Process range using OOXML extraction and manipulation
 * This is the ONLY reliable way to handle soft hyphens in Word JavaScript API
 */
async function processRangeWithOOXML(context, range, rangeType) {
    let totalProcessed = 0;
    let totalSuccess = 0;
    let paragraphsProcessed = 0;
    
    try {
        // Get all paragraphs
        const paragraphs = range.paragraphs;
        paragraphs.load("items");
        await context.sync();
        
        logActivity(`   📄 Processing ${paragraphs.items.length} paragraphs...`);
        
        // Process paragraphs in chunks to avoid memory issues
        const CHUNK_SIZE = 10;
        
        for (let i = 0; i < paragraphs.items.length; i += CHUNK_SIZE) {
            const endIdx = Math.min(i + CHUNK_SIZE, paragraphs.items.length);
            
            for (let j = i; j < endIdx; j++) {
                try {
                    const para = paragraphs.items[j];
                    
                    // Load paragraph properties
                    para.load("text, style, isListItem");
                    await context.sync();
                    
                    // Skip empty paragraphs
                    if (!para.text || para.text.trim().length < 4) {
                        continue;
                    }
                    
                    // Skip headings
                    if (para.style) {
                        const styleStr = para.style.toString().toLowerCase();
                        if (styleStr.includes("heading") || styleStr.includes("title") || styleStr.includes("toc")) {
                            continue;
                        }
                    }
                    
                    // Skip list items
                    if (para.isListItem) {
                        continue;
                    }
                    
                    // Skip if no Georgian text
                    if (!/[ა-ჰ]/.test(para.text)) {
                        continue;
                    }
                    
                    // Get paragraph OOXML
                    const paraRange = para.getRange();
                    const ooxml = paraRange.getOoxml();
                    await context.sync();
                    
                    // Process OOXML to remove soft hyphens and add new ones
                    const result = processOOXML(ooxml.value);
                    
                    if (result.changed) {
                        // Replace paragraph with processed OOXML
                        try {
                            paraRange.insertOoxml(result.ooxml, Word.InsertLocation.replace);
                            totalSuccess += result.wordsHyphenated;
                            totalProcessed += result.wordsProcessed;
                            paragraphsProcessed++;
                            
                            if (result.wordsHyphenated > 0) {
                                logActivity(`   ✓ Para ${j}: ${result.wordsHyphenated} words hyphenated`);
                            }
                        } catch (insertErr) {
                            logActivity(`   ✗ Para ${j}: Failed to insert OOXML - ${insertErr.message}`);
                        }
                    }
                    
                } catch (paraErr) {
                    logActivity(`   ✗ Para ${j}: Error - ${paraErr.message}`);
                    continue;
                }
            }
            
            // Sync after each chunk
            await context.sync();
            
            if ((i + CHUNK_SIZE) % 50 === 0) {
                logActivity(`   ⏳ Progress: ${Math.min(i + CHUNK_SIZE, paragraphs.items.length)}/${paragraphs.items.length} paragraphs`);
            }
        }
        
    } catch (err) {
        logActivity(`   ⚠️ Error during processing: ${err.message}`);
    }
    
    return {
        processed: totalProcessed,
        success: totalSuccess,
        paragraphs: paragraphsProcessed
    };
}

/**
 * 🔧 Process OOXML string to remove old soft hyphens and add new ones
 */
/**
 * 🔧 განახლებული OOXML დამუშავება: 
 * იყენებს \u00AD სიმბოლოს, რომელიც ვიზუალურად უხილავია (Soft Hyphen).
 */
function processOOXML(ooxmlString) {
    let changed = false;
    let wordsProcessed = 0;
    let wordsHyphenated = 0;
    
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(ooxmlString, "text/xml");
        const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        
        // 1. ვშლით ყველა არსებულ რბილ დეფისს (თეგებსაც და სიმბოლოებსაც)
        const existingSoftHyphens = xmlDoc.getElementsByTagNameNS(ns, 'softHyphen');
        while (existingSoftHyphens.length > 0) {
            existingSoftHyphens[0].parentNode.removeChild(existingSoftHyphens[0]);
            changed = true;
        }

        const textNodes = xmlDoc.getElementsByTagNameNS(ns, 't');
        const marker = "[[SH]]"; // დროებითი მარკერი ალგორითმისთვის

        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            // ვშლით \u00AD სიმბოლოებს თუ სადმე დარჩა
            let originalText = textNode.textContent.replace(/\u00AD/g, '');
            
            // ვიყენებთ მარკერს, რომ ალგორითმმა მონიშნოს დაყოფის ადგილები
            const hyphenatedText = originalText.replace(/[ა-ჰ]{4,}/g, (word) => {
                wordsProcessed++;
                // დროებით ვცვლით ჰიფენის სიმბოლოს მარკერით
                const result = Hyphenator.getHyphenatedWord(word).replace(/\u00AD/g, marker);
                if (result.includes(marker)) wordsHyphenated++;
                return result;
            });

            if (hyphenatedText.includes(marker)) {
                changed = true;
                const parent = textNode.parentNode;
                const parts = hyphenatedText.split(marker);

                // ვშლით ძველ ტექსტურ კვანძს და მის ნაცვლად ვსვამთ ტექსტი + <w:softHyphen/> კომბინაციას
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
            } else {
                textNode.textContent = originalText;
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
        console.error("OOXML error:", err);
        return { ooxml: ooxmlString, changed: false, wordsProcessed: 0, wordsHyphenated: 0 };
    }
}
/**
 * ✅ Clear all highlighting from the document
 */
async function clearHighlighting() {
    await Word.run(async (context) => {
        logActivity("🧹 Clearing all highlighting...");
        
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
        logActivity(`✅ Cleared highlighting from ${cleared} paragraphs`);
    });
}