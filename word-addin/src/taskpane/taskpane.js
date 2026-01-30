/* global Office Word */

/**
 * ✅ Georgian Hyphenation Library v3.8.2 (Smart Trailing Cleanup)
 * Finds last real paragraph and deletes everything after it
 */
class GeorgianHyphenator {
    constructor(hyphenChar = '&shy;') {
        this.hyphenChar = hyphenChar;
        this.vowels = 'აეიოუ';
        this.leftMin = 2; 
        this.rightMin = 2; 

        this.harmonicClusters = new Set([
            'ბლ', 'ბრ', 'ბღ', 'ბზ', 'გდ', 'გლ', 'გმ', 'გნ', 'გვ', 'გზ', 'გრ',
            'დრ', 'თლ', 'თრ', 'თღ', 'კლ', 'კმ', 'კნ', 'კრ', 'კვ', 'მტ', 'პლ', 
            'პრ', 'ჟღ', 'რგ', 'რლ', 'რმ', 'სწ', 'სხ', 'ტკ', 'ტპ', 'ტრ', 'ფლ', 
            'ფრ', 'ფქ', 'ფშ', 'ქლ', 'ქნ', 'ქვ', 'ქრ', 'ღლ', 'ღრ', 'ყლ', 'ყრ', 
            'შთ', 'შპ', 'ჩქ', 'ჩრ', 'ცლ', 'ცნ', 'ცრ', 'ცვ', 'ძგ', 'ძვ', 'ძღ', 
            'წლ', 'წრ', 'წნ', 'წკ', 'ჭკ', 'ჭრ', 'ჭყ', 'ხლ', 'ხმ', 'ხნ', 'ხვ', 'ჯგ'
        ]);

        this.dictionary = new Map();
        this.dictionaryLoaded = false;
    }

    _stripHyphens(text) {
        if (!text) return '';
        return text.replace(/[\u00AD\u200B]/g, '').replace(new RegExp(this.hyphenChar, 'g'), '');
    }

    loadLibrary(data) {
        if (data && typeof data === 'object') {
            Object.entries(data).forEach(([word, hyphenated]) => {
                this.dictionary.set(word, hyphenated.replace(/-/g, this.hyphenChar));
            });
        }
    }

    async loadDefaultLibrary() {
        if (this.dictionaryLoaded) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
            const response = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.4/data/exceptions.json', { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error();
            const data = await response.json();
            this.loadLibrary(data);
            this.dictionaryLoaded = true;
            console.log(`📚 Dictionary loaded (${this.dictionary.size} words)`);
        } catch (error) {
            console.warn('⚠️ Dictionary unavailable');
        }
    }

    hyphenate(word) {
        const sanitizedWord = this._stripHyphens(word);
        const cleanWord = sanitizedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

        let result = '';

        if (this.dictionary.has(cleanWord)) {
            result = this.dictionary.get(cleanWord);
        } else {
            result = this.applyAlgorithm(sanitizedWord);
        }

        return this.fixOrphans(result);
    }

    fixOrphans(hyphenatedWord) {
        let parts = hyphenatedWord.split(this.hyphenChar);
        if (parts.length <= 1) return hyphenatedWord;

        if (parts[0].length === 1) {
            parts[0] = parts[0] + parts[1];
            parts.splice(1, 1);
        }

        if (parts.length > 1 && parts[parts.length - 1].length === 1) {
            let lastIdx = parts.length - 1;
            parts[lastIdx - 1] = parts[lastIdx - 1] + parts[lastIdx];
            parts.pop();
        }

        return parts.join(this.hyphenChar);
    }

    applyAlgorithm(word) {
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
                candidatePos = v1 + 1;
            } else {
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
                    let breakIndex = -1;
                    if (distance >= 2) {
                        const lastTwo = betweenSubstring.substring(distance - 2, distance);
                        if (this.harmonicClusters.has(lastTwo)) breakIndex = distance - 2;
                    }
                    candidatePos = (breakIndex !== -1) ? v1 + 1 + breakIndex : v1 + 2;
                }
            }
            if (candidatePos >= this.leftMin && (word.length - candidatePos) >= this.rightMin) {
                insertPoints.push(candidatePos);
            }
        }
        let result = word.split('');
        for (let i = insertPoints.length - 1; i >= 0; i--) {
            result.splice(insertPoints[i], 0, this.hyphenChar);
        }
        return result.join('');
    }

    hyphenateText(text) {
        if (!text) return '';
        const sanitizedText = this._stripHyphens(text);
        
        return sanitizedText.replace(/([ა-ჰ]+)/g, (word) => {
            if (word.length >= 4) return this.hyphenate(word);
            return word;
        }).trim();
    }
}

/**
 * ✅ Word Add-in Logic
 */
Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        console.log('🇬🇪 Georgian Hyphenation Add-in Ready v3.8.2');

        const docBtn = document.getElementById('hyphenate-document');
        const selBtn = document.getElementById('hyphenate-selection');

        if (docBtn) docBtn.onclick = hyphenateDocument;
        if (selBtn) selBtn.onclick = hyphenateSelection;
        
        showStatus('მზად არის (v3.8.2)', '');
    }
});

async function preserveFormattingHyphenation(context, objectWithHtml) {
    const htmlResult = objectWithHtml.getHtml();
    await context.sync();

    let rawHtml = htmlResult.value;
    const hyphenator = new GeorgianHyphenator();
    await hyphenator.loadDefaultLibrary();

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    walkAndHyphenate(doc.body, hyphenator);

    let newHtml = doc.body.innerHTML;

    // 1. JS String Trim (Basic cleaning)
    newHtml = newHtml.trim();
    const tailRegex = /(&nbsp;|[\s\u00A0\u200B]|<br\s*\/?>)+$/gi;
    while (tailRegex.test(newHtml)) {
        newHtml = newHtml.replace(tailRegex, '');
    }

    objectWithHtml.insertHtml(newHtml, Word.InsertLocation.replace);
    
    // 2. ☢️ SMART CLEANUP (იპოვე ბოლო რეალური პარაგრაფი და წაშალე ყველაფერი მის შემდეგ)
    await cleanUpWordArtifacts(context, objectWithHtml);
    
    await context.sync();
}

/**
 * ✅ ჭკვიანი გასუფთავება
 * გადის ყველა პარაგრაფს უკუღმა, პოულობს ბოლო რეალურ ტექსტს და შლის ყველაფერს მის შემდეგ
 */
async function cleanUpWordArtifacts(context, rangeObject) {
    try {
        const paragraphs = rangeObject.paragraphs;
        paragraphs.load("items");
        await context.sync();

        const totalCount = paragraphs.items.length;
        console.log(`📄 სულ პარაგრაფები: ${totalCount}`);

        // ვიღებთ ყველა პარაგრაფის ტექსტს ერთდროულად (ეფექტურობისთვის)
        paragraphs.items.forEach(para => para.load("text"));
        await context.sync();

        // ვეძებთ ბოლო პარაგრაფს რომელსაც აქვს რეალური ტექსტი
        let lastRealParagraphIndex = -1;
        
        for (let i = totalCount - 1; i >= 0; i--) {
            const text = paragraphs.items[i].text || '';
            const cleanText = text.replace(/[\u00A0\u200B\s\r\n\t]/g, '');
            
            if (cleanText.length > 0) {
                lastRealParagraphIndex = i;
                console.log(`✅ ბოლო რეალური პარაგრაფი: ${i + 1} ("${text.substring(0, 30)}...")`);
                break;
            }
        }

        // თუ ვიპოვეთ ბოლო რეალური და მის შემდეგ კიდევ არის პარაგრაფები
        if (lastRealParagraphIndex !== -1 && lastRealParagraphIndex < totalCount - 1) {
            const deleteCount = totalCount - 1 - lastRealParagraphIndex;
            console.log(`🗑️ წავშალოთ ${deleteCount} ცარიელი პარაგრაფი`);
            
            // ვშლით უკუღმა (ბოლოდან) რომ ინდექსები არ დაიბნეს
            for (let i = totalCount - 1; i > lastRealParagraphIndex; i--) {
                console.log(`   წავშალე პარაგრაფი ${i + 1}`);
                paragraphs.items[i].delete();
            }
            
            await context.sync();
            console.log(`✅ გასუფთავდა!`);
        } else {
            console.log(`ℹ️ ცარიელი პარაგრაფები არ მოიძებნა`);
        }

    } catch (error) {
        console.warn('⚠️ Cleanup warning:', error.message);
    }
}

function walkAndHyphenate(node, hyphenator) {
    if (node.nodeType === 3) { 
        const originalText = node.nodeValue;
        if (!originalText || !originalText.trim()) return;

        const hyphenatedText = hyphenator.hyphenateText(originalText);

        if (originalText !== hyphenatedText) {
            const tempSpan = document.createElement('span');
            tempSpan.innerHTML = hyphenatedText;
            node.replaceWith(...tempSpan.childNodes);
        }
    } else if (node.nodeType === 1) { 
        if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'svg', 'path'].includes(node.tagName)) return;
        Array.from(node.childNodes).forEach(child => walkAndHyphenate(child, hyphenator));
    }
}

async function hyphenateDocument() {
    showStatus('⏳ მიმდინარეობს დამუშავება...', '');
    try {
        await Word.run(async (context) => {
            const body = context.document.body;
            await preserveFormattingHyphenation(context, body);
            showStatus('✅ დოკუმენტი დამარცვლილია!', 'success');
        });
    } catch (error) {
        showStatus('❌ შეცდომა: ' + error.message, 'error');
        console.error('Full error:', error);
    }
}

async function hyphenateSelection() {
    showStatus('⏳ მიმდინარეობს დამუშავება...', '');
    try {
        await Word.run(async (context) => {
            const selection = context.document.getSelection();
            selection.load("text");
            await context.sync();

            if (!selection.text || !selection.text.trim()) {
                showStatus('⚠️ ჯერ მონიშნეთ ტექსტი', 'error');
                return;
            }

            await preserveFormattingHyphenation(context, selection);
            showStatus('✅ მონიშნული დამარცვლილია!', 'success');
        });
    } catch (error) {
        showStatus('❌ შეცდომა: ' + error.message, 'error');
        console.error('Full error:', error);
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        if (type === 'error') {
            status.style.backgroundColor = '#fde7e9';
            status.style.borderBottom = '2px solid #a80000';
            status.style.color = '#a80000';
        } else if (type === 'success') {
            status.style.backgroundColor = '#dff6dd';
            status.style.borderBottom = '2px solid #107c10';
            status.style.color = '#107c10';
        } else {
            status.style.backgroundColor = '#f3f2f1';
            status.style.borderBottom = '2px solid #0078d4';
            status.style.color = '#323130';
        }
        if (type) setTimeout(() => { showStatus('მზად არის (v3.8.2)', ''); }, 3000);
    }
}