/* global Office Word */

// ✅ INLINE Georgian Hyphenator v3.0.0 (Preserves Formatting)
class GeorgianHyphenator {
  constructor(hyphenChar = '&shy;') { 
    this.hyphenChar = hyphenChar;
    this.vowels = 'აეიოუ';
    this.leftMin = 2;
    this.rightMin = 2;
    // ჰარმონიული კომპლექსები
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

  // ასუფთავებს სიტყვას ძველი ტირეებისგან
  _stripHyphens(text) {
    if (!text) return '';
    return text.replace(/[\u00AD\-]|\&shy;/g, '');
  }

  async loadDefaultLibrary() {
    if (this.dictionaryLoaded) return true;
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.4/data/exceptions.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      Object.entries(data).forEach(([word, hyphenated]) => {
        this.dictionary.set(word, hyphenated);
      });
      this.dictionaryLoaded = true;
      console.log(`📚 Dictionary loaded (${this.dictionary.size} words)`);
      return true;
    } catch (error) {
      console.warn('Dictionary unavailable, using algorithm only');
      return false;
    }
  }

  hyphenate(word) {
    const sanitizedWord = this._stripHyphens(word);
    const cleanWord = sanitizedWord.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""); // პუნქტუაციის მოშორება შემოწმებისთვის
    
    if (this.dictionary.has(cleanWord)) {
      return this.dictionary.get(cleanWord).replace(/-/g, this.hyphenChar);
    }
    return this.applyAlgorithm(sanitizedWord);
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
}

// ✅ Office.onReady
Office.onReady((info) => {
    if (info.host === Office.HostType.Word) {
        console.log('🇬🇪 Georgian Hyphenation v3.0.0 loaded');
        
        const docBtn = document.getElementById('hyphenate-document');
        const selBtn = document.getElementById('hyphenate-selection');
        
        if (docBtn) docBtn.addEventListener('click', hyphenateDocument);
        if (selBtn) selBtn.addEventListener('click', hyphenateSelection);
        
        showStatus('Ready', '');
    }
});

// ✅ მთავარი ლოგიკა: HTML-ის დამუშავება ფორმატის შესანარჩუნებლად
async function preserveFormattingHyphenation(context, objectWithHtml) {
    // 1. ვიღებთ არსებულ HTML-ს სტილებით
    const htmlResult = objectWithHtml.getHtml();
    await context.sync();
    
    let rawHtml = htmlResult.value;
    
    // 2. ვამზადებთ ჰიფენატორს
    const hyphenator = new GeorgianHyphenator('&shy;');
    await hyphenator.loadDefaultLibrary();
    
    // 3. ვშლით HTML-ს დროებით DOM-ში (ბრაუზერის მეხსიერებაში)
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");
    
    // 4. რეკურსიულად ვუვლით ყველა ელემენტს და ვპოულობთ მხოლოდ ტექსტს
    walkAndHyphenate(doc.body, hyphenator);
    
    // 5. ვაწყობთ ახალ HTML სტრიქონს
    const newHtml = doc.body.innerHTML;
    
    // 6. ვაბრუნებთ უკან Word-ში
    objectWithHtml.insertHtml(newHtml, Word.InsertLocation.replace);
    await context.sync();
}

// რეკურსიული ფუნქცია DOM-ის სასიარულოდ
function walkAndHyphenate(node, hyphenator) {
    if (node.nodeType === 3) { // 3 = TEXT_NODE (მხოლოდ ტექსტი)
        const originalText = node.nodeValue;
        
        // თუ ტექსტი ცარიელია, ვატარებთ
        if (!originalText || !originalText.trim()) return;

        // ვამარცვლებთ მხოლოდ ქართულ სიტყვებს
        const hyphenatedText = processTextContent(originalText, hyphenator);

        // თუ შეიცვალა რამე, ვანახლებთ ნოუდის მნიშვნელობას
        if (originalText !== hyphenatedText) {
             // მნიშვნელოვანი: nodeValue-ში პირდაპირ &shy; არ მუშაობს (ტექსტად წერს).
             // ამიტომ ვქმნით დროებით ელემენტს, რომ HTML ენთითი სწორად აღიქვას.
             const tempSpan = document.createElement('span');
             tempSpan.innerHTML = hyphenatedText;
             
             // ვანაცვლებთ ძველ ტექსტურ ნოუდს ახალი ნოუდებით (სადაც &shy; უკვე სიმბოლოა)
             node.replaceWith(...tempSpan.childNodes);
        }
    } else if (node.nodeType === 1) { // 1 = ELEMENT_NODE (მაგ: <p>, <b>, <span>)
        // არ შევდივართ სკრიპტებში და სტილებში
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            // ვაკეთებთ კლონს შვილების სიის, რომ ლუპის დროს არ აგვერიოს
            const childNodes = Array.from(node.childNodes);
            childNodes.forEach(child => walkAndHyphenate(child, hyphenator));
        }
    }
}

// ტექსტის დამუშავება (იყოფა სიტყვებად)
function processTextContent(text, hyphenator) {
    // ვყოფთ სიტყვებს და არა-სიტყვებს (ნიშნებს)
    const parts = text.split(/([ა-ჰ]{4,})/); 
    
    return parts.map(part => {
        if (/[ა-ჰ]{4,}/.test(part)) {
            // მხოლოდ ქართული, 4+ ასოიანი სიტყვები
            return hyphenator.hyphenate(part);
        }
        return part; // დანარჩენს (სფეისებს, ნიშნებს) ხელს არ ვახლებთ
    }).join('');
}


// ✅ Document Button Handler
async function hyphenateDocument() {
    showStatus('⏳ Loading...', '');
    try {
        await Word.run(async (context) => {
            const body = context.document.body;
            await preserveFormattingHyphenation(context, body);
            showStatus('✅ დოკუმენტი დამარცვლილია!', 'success');
        });
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'error');
        console.error(error);
    }
}

// ✅ Selection Button Handler
async function hyphenateSelection() {
    showStatus('⏳ Loading...', '');
    try {
        await Word.run(async (context) => {
            const selection = context.document.getSelection();
            
            // შემოწმება, არის თუ არა რამე მონიშნული
            selection.load("text");
            await context.sync();
            if (!selection.text || !selection.text.trim()) {
                showStatus('⚠️ მონიშნეთ ტექსტი', 'error');
                return;
            }

            await preserveFormattingHyphenation(context, selection);
            showStatus('✅ მონიშნული ტექსტი დამარცვლილია!', 'success');
        });
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'error');
        console.error(error);
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.className = 'status ' + type;
        if (type) setTimeout(() => { status.className = 'status'; status.textContent = 'Ready'; }, 3000);
    }
}