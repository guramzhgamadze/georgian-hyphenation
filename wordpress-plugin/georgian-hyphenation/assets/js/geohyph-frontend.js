/**
 * Georgian Hyphenation — frontend processor.
 *
 * Walks the configured containers, injects soft hyphens into Georgian text
 * nodes via the bundled GeorgianHyphenator engine, and keeps watching for
 * dynamically added content (AJAX, Elementor popups, infinite scroll).
 *
 * Configuration arrives via the `geohyphSettings` global, injected with
 * wp_add_inline_script() before this file.
 */
( function () {
	'use strict';

	var settings = window.geohyphSettings;
	if ( ! settings || typeof window.GeorgianHyphenator !== 'function' ) {
		return;
	}

	var hyphenator = new window.GeorgianHyphenator( '\u00AD' )
		.setLeftMin( parseInt( settings.leftMin, 10 ) || 2 )
		.setRightMin( parseInt( settings.rightMin, 10 ) || 2 );

	// Processed state is tracked per TEXT NODE, not per container, so text
	// added later inside an already-processed container is still picked up.
	var processedNodes = new WeakSet();

	var GEORGIAN = /[ა-ჰ]/;
	var SKIP_CLOSEST = 'script,style,code,pre,textarea,[contenteditable="true"]';

	var selectorsValid = true;

	function collectContainers( root ) {
		if ( ! selectorsValid || ! root.querySelectorAll ) {
			return [];
		}
		try {
			return root.querySelectorAll( settings.selectors );
		} catch ( e ) {
			// Invalid user-supplied selector — disable rather than throw on
			// every mutation.
			selectorsValid = false;
			if ( window.console && window.console.warn ) {
				window.console.warn( 'Georgian Hyphenation: invalid CSS selector list, skipping.', e );
			}
			return [];
		}
	}

	function processContainer( el ) {
		var walker = document.createTreeWalker( el, NodeFilter.SHOW_TEXT, {
			acceptNode: function ( node ) {
				if ( processedNodes.has( node ) || ! GEORGIAN.test( node.nodeValue ) ) {
					return NodeFilter.FILTER_REJECT;
				}
				var parent = node.parentElement;
				if ( ! parent || parent.closest( SKIP_CLOSEST ) ) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		} );

		var touched = false;
		var node;
		while ( ( node = walker.nextNode() ) ) {
			var hyphenated = hyphenator.hyphenateText( node.nodeValue );
			if ( hyphenated !== node.nodeValue ) {
				node.nodeValue = hyphenated;
				touched = true;
			}
			processedNodes.add( node );
		}

		if ( touched && settings.autoJustify ) {
			el.classList.add( 'geohyph-justify' );
		}
	}

	function processAll() {
		var containers = collectContainers( document );
		for ( var i = 0; i < containers.length; i++ ) {
			processContainer( containers[ i ] );
		}
	}

	var debounce;
	function scheduleProcess() {
		clearTimeout( debounce );
		debounce = setTimeout( processAll, 400 );
	}

	function start() {
		var ready = settings.loadDictionary && settings.dictionaryUrl
			? hyphenator.loadDefaultLibrary( settings.dictionaryUrl )
			: Promise.resolve();

		// Process even if the dictionary fails to load — the engine falls
		// back to its algorithm.
		ready.then( processAll, processAll );

		new MutationObserver( function ( mutations ) {
			for ( var i = 0; i < mutations.length; i++ ) {
				if ( mutations[ i ].addedNodes.length ) {
					scheduleProcess();
					return;
				}
			}
		} ).observe( document.body, { childList: true, subtree: true } );

		// Elementor popups mount asynchronously; the MutationObserver catches
		// them, but this hook processes them without the debounce delay.
		// Elementor fires this event through jQuery's event system only.
		if ( typeof jQuery !== 'undefined' ) {
			jQuery( document ).on( 'elementor/popup/show', function () {
				setTimeout( processAll, 100 );
			} );
		}
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', start );
	} else {
		start();
	}
} )();
