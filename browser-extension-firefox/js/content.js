/**
 * Georgian Hyphenation — content script (shared by Chrome and Firefox).
 *
 * SHARED SOURCE — do not edit the generated copies under each extension's
 * js/ folder. Edit this file, then run: node browser-extension-shared/build.mjs
 *
 * Loaded after georgian-hyphenator.js (window.GeorgianHyphenator) and
 * dictionary.js (window.GEORGIAN_HYPHENATION_DICT), both bundled locally —
 * no external/CDN requests.
 */
( function () {
	'use strict';

	if ( window.georgianHyphenationExtensionLoaded ) {
		return;
	}
	window.georgianHyphenationExtensionLoaded = true;

	if ( typeof window.GeorgianHyphenator !== 'function' ) {
		return;
	}

	var DEBUG = false;
	function log() {
		if ( DEBUG && window.console ) {
			window.console.log.apply( window.console, [ '[GeoHyph]' ].concat( [].slice.call( arguments ) ) );
		}
	}

	// Sites where hyphenating the DOM is unwanted or interferes with the app.
	var BLACKLIST = [ 'claude.ai', 'chat.openai.com', 'gemini.google.com' ];
	if ( BLACKLIST.some( function ( host ) { return window.location.hostname.indexOf( host ) !== -1; } ) ) {
		return;
	}

	var hyphenator = new window.GeorgianHyphenator( '\u00AD' );
	if ( window.GEORGIAN_HYPHENATION_DICT ) {
		hyphenator.loadLibrary( window.GEORGIAN_HYPHENATION_DICT );
	}

	var isEnabled = true;
	var smartJustify = true;
	var stats = { processed: 0, hyphenated: 0 };

	// Processed state is tracked per TEXT NODE, so content added later inside
	// an already-processed container is still picked up.
	var processedNodes = new WeakSet();

	var GEORGIAN = /[ა-ჰ]/;
	var GEORGIAN_WORD = /[ა-ჰ]{4,}/;

	// -- element/node filtering ------------------------------------------------

	function shouldSkipElement( element ) {
		if ( ! element || ! element.tagName ) {
			return true;
		}
		var tag = element.tagName.toLowerCase();

		// Headings and structural chrome are skipped: conventionally not
		// hyphenated, and they typically use display fonts — some of which
		// render the soft hyphen (U+00AD) as a VISIBLE dash inside words.
		var skipTags = [
			'script', 'style', 'noscript', 'iframe', 'object', 'embed',
			'input', 'textarea', 'select', 'code', 'pre',
			'nav', 'header', 'footer', 'aside',
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'button'
		];
		if ( skipTags.indexOf( tag ) !== -1 ) {
			return true;
		}

		if ( element.isContentEditable ) {
			return true;
		}

		var role = element.getAttribute && element.getAttribute( 'role' );
		if ( role === 'heading' || role === 'button' || role === 'textbox' || role === 'combobox' ) {
			return true;
		}

		// General defense against display fonts that expose a bad U+00AD
		// glyph: skip large text, where hyphenation is unwanted anyway.
		try {
			if ( parseFloat( window.getComputedStyle( element ).fontSize ) > 20 ) {
				return true;
			}
		} catch ( e ) {}

		return false;
	}

	function shouldSkipNode( node ) {
		var el = node.parentElement;
		var depth = 0;
		while ( el && depth < 8 ) {
			if ( shouldSkipElement( el ) ) {
				return true;
			}
			el = el.parentElement;
			depth++;
		}
		return false;
	}

	// -- processing ------------------------------------------------------------

	function processTextNode( node ) {
		if ( processedNodes.has( node ) ) {
			return;
		}
		var text = node.nodeValue;
		if ( ! text || ! GEORGIAN_WORD.test( text ) || shouldSkipNode( node ) ) {
			return;
		}

		var hyphenated = hyphenator.hyphenateText( text );
		processedNodes.add( node );

		if ( hyphenated !== text ) {
			node.nodeValue = hyphenated;
			stats.processed++;
			stats.hyphenated++;
			if ( smartJustify ) {
				markForJustify( node.parentElement );
			}
		}
	}

	function markForJustify( element ) {
		if ( ! element ) {
			return;
		}
		try {
			var align = window.getComputedStyle( element ).textAlign;
			if ( align === 'center' || align === 'right' ) {
				return;
			}
		} catch ( e ) {}
		element.classList.add( 'georgian-text-content' );
	}

	function walk( root ) {
		if ( ! root ) {
			return;
		}
		if ( root.nodeType === Node.TEXT_NODE ) {
			processTextNode( root );
			return;
		}
		if ( root.nodeType !== Node.ELEMENT_NODE ) {
			return;
		}
		if ( shouldSkipElement( root ) ) {
			return;
		}
		var walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT, {
			acceptNode: function ( node ) {
				return ( ! processedNodes.has( node ) && GEORGIAN.test( node.nodeValue ) )
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			}
		} );
		var node;
		var batch = [];
		while ( ( node = walker.nextNode() ) ) {
			batch.push( node );
			if ( batch.length > 5000 ) {
				break;
			}
		}
		batch.forEach( processTextNode );
	}

	function processPage() {
		if ( ! isEnabled ) {
			return;
		}
		var run = function () {
			var before = stats.processed;
			walk( document.body );
			if ( stats.processed > before ) {
				saveStats();
				log( 'processed', stats.processed - before, 'new nodes' );
			}
		};
		if ( window.requestIdleCallback ) {
			window.requestIdleCallback( run, { timeout: 2000 } );
		} else {
			setTimeout( run, 100 );
		}
	}

	// -- observers -------------------------------------------------------------

	var debounce;
	var observer = new MutationObserver( function ( mutations ) {
		if ( ! isEnabled ) {
			return;
		}
		var added = false;
		for ( var i = 0; i < mutations.length; i++ ) {
			if ( mutations[ i ].addedNodes.length ) {
				added = true;
				break;
			}
		}
		if ( ! added ) {
			return;
		}
		clearTimeout( debounce );
		debounce = setTimeout( processPage, 400 );
	} );

	function startObserving() {
		if ( document.body ) {
			observer.observe( document.body, { childList: true, subtree: true } );
		}
	}

	function stopObserving() {
		observer.disconnect();
	}

	// SPA navigation: re-process after a client-side route change.
	var lastUrl = window.location.href;
	function watchUrl() {
		if ( window.location.href !== lastUrl ) {
			lastUrl = window.location.href;
			processedNodes = new WeakSet();
			setTimeout( processPage, 600 );
		}
	}
	new MutationObserver( watchUrl ).observe( document, { subtree: true, childList: true } );
	window.addEventListener( 'popstate', function () { setTimeout( watchUrl, 0 ); } );

	// -- injected CSS ----------------------------------------------------------

	function injectStyles() {
		if ( document.getElementById( 'georgian-hyphenation-css' ) ) {
			return;
		}
		var style = document.createElement( 'style' );
		style.id = 'georgian-hyphenation-css';
		style.textContent =
			'body,p,div,span,article,section,li,td,th,blockquote,figcaption{' +
				'-webkit-hyphens:manual;hyphens:manual;overflow-wrap:break-word;' +
			'}' +
			'.georgian-text-content{text-align:justify;}' +
			// Never justify headings/editors even if the class lands on them.
			'h1.georgian-text-content,h2.georgian-text-content,h3.georgian-text-content,' +
			'h4.georgian-text-content,h5.georgian-text-content,h6.georgian-text-content,' +
			'[contenteditable="true"] .georgian-text-content{text-align:inherit;}';
		( document.head || document.documentElement ).appendChild( style );
	}

	function removeStyles() {
		var style = document.getElementById( 'georgian-hyphenation-css' );
		if ( style ) {
			style.remove();
		}
	}

	// -- storage / messaging ---------------------------------------------------

	function saveStats() {
		try {
			chrome.storage.sync.set( { stats: stats } );
		} catch ( e ) {}
	}

	function enable() {
		isEnabled = true;
		injectStyles();
		processPage();
		startObserving();
	}

	function disable() {
		isEnabled = false;
		stopObserving();
		removeStyles();
		// Reload to drop the injected soft hyphens from the current page.
		window.location.reload();
	}

	chrome.runtime.onMessage.addListener( function ( message, sender, sendResponse ) {
		if ( ! message || ! message.action ) {
			return false;
		}
		if ( message.action === 'toggleHyphenation' || message.action === 'toggle' ) {
			if ( message.enabled ) {
				enable();
			} else {
				disable();
			}
			sendResponse( { success: true, enabled: isEnabled } );
		} else if ( message.action === 'toggleSmartJustify' ) {
			smartJustify = message.smartJustify;
			if ( smartJustify ) {
				processPage();
			}
			sendResponse( { success: true, smartJustify: smartJustify } );
		} else if ( message.action === 'getStats' ) {
			sendResponse( { stats: stats } );
		}
		return true;
	} );

	// -- init ------------------------------------------------------------------

	function init() {
		chrome.storage.sync.get( [ 'enabled', 'smartJustify', 'stats' ], function ( result ) {
			isEnabled = result.enabled !== false;
			smartJustify = result.smartJustify !== false;
			if ( result.stats ) {
				stats = result.stats;
			}
			if ( ! isEnabled ) {
				return;
			}
			injectStyles();
			var go = function () {
				processPage();
				startObserving();
			};
			if ( document.readyState === 'loading' ) {
				document.addEventListener( 'DOMContentLoaded', function () { setTimeout( go, 100 ); } );
			} else {
				setTimeout( go, 100 );
			}
		} );
	}

	init();
} )();
