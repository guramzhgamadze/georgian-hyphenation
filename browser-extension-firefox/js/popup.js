/**
 * Georgian Hyphenation — popup (shared by Chrome and Firefox).
 *
 * SHARED SOURCE — do not edit the generated copies under each extension's
 * js/ folder. Uses the callback-style chrome.* API, which both browsers support.
 */
( function () {
	'use strict';

	var toggle = document.getElementById( 'toggle' );
	var toggleJustify = document.getElementById( 'toggleJustify' );
	var status = document.getElementById( 'status' );
	var wordsProcessed = document.getElementById( 'wordsProcessed' );
	var wordsHyphenated = document.getElementById( 'wordsHyphenated' );

	if ( ! toggle || ! status || ! wordsProcessed || ! wordsHyphenated ) {
		return;
	}

	function updateUI( enabled ) {
		toggle.classList.toggle( 'active', enabled );
		status.classList.toggle( 'active', enabled );
		status.textContent = enabled ? '✅ გააქტიურებულია' : '⏸️ გამორთულია';
	}

	function updateJustifyUI( enabled ) {
		if ( toggleJustify ) {
			toggleJustify.classList.toggle( 'active', enabled );
		}
	}

	function showStats( s ) {
		if ( s ) {
			wordsProcessed.textContent = s.processed || 0;
			wordsHyphenated.textContent = s.hyphenated || 0;
		}
	}

	function withActiveTab( cb ) {
		chrome.tabs.query( { active: true, currentWindow: true }, function ( tabs ) {
			if ( ! chrome.runtime.lastError && tabs && tabs[ 0 ] ) {
				cb( tabs[ 0 ].id );
			}
		} );
	}

	function sendToTab( message ) {
		withActiveTab( function ( tabId ) {
			chrome.tabs.sendMessage( tabId, message, function () {
				// Ignore "no receiver" — the content script reads storage on
				// its next load (e.g. after the page is refreshed).
				void chrome.runtime.lastError;
			} );
		} );
	}

	function loadStats() {
		withActiveTab( function ( tabId ) {
			chrome.tabs.sendMessage( tabId, { action: 'getStats' }, function ( response ) {
				if ( chrome.runtime.lastError || ! response ) {
					return;
				}
				showStats( response.stats );
				if ( response.stats ) {
					chrome.storage.sync.set( { stats: response.stats } );
				}
			} );
		} );
	}

	function handleToggle() {
		var next = ! toggle.classList.contains( 'active' );
		updateUI( next );
		chrome.storage.sync.set( { enabled: next } );
		sendToTab( { action: 'toggleHyphenation', enabled: next } );
	}

	function handleToggleJustify() {
		if ( ! toggleJustify ) {
			return;
		}
		var next = ! toggleJustify.classList.contains( 'active' );
		updateJustifyUI( next );
		chrome.storage.sync.set( { smartJustify: next } );
		sendToTab( { action: 'toggleSmartJustify', smartJustify: next } );
	}

	toggle.addEventListener( 'click', handleToggle );
	if ( toggleJustify ) {
		toggleJustify.addEventListener( 'click', handleToggleJustify );
	}

	chrome.storage.sync.get( [ 'enabled', 'smartJustify', 'stats' ], function ( result ) {
		updateUI( result.enabled !== false );
		updateJustifyUI( result.smartJustify !== false );
		showStats( result.stats );
		loadStats();
	} );

	var statsInterval = setInterval( loadStats, 2000 );
	window.addEventListener( 'unload', function () { clearInterval( statsInterval ); } );
} )();
