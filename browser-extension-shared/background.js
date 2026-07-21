/**
 * Georgian Hyphenation — background (shared by Chrome and Firefox).
 *
 * SHARED SOURCE — do not edit the generated copies under each extension's
 * js/ folder. Runs as a Chrome MV3 service worker and Firefox MV3 background script.
 *
 * Content scripts are injected declaratively via the manifest, so this only
 * seeds default settings on first install.
 */
chrome.runtime.onInstalled.addListener( function ( details ) {
	if ( details.reason === 'install' ) {
		chrome.storage.sync.set( {
			enabled: true,
			smartJustify: true,
			stats: { processed: 0, hyphenated: 0 }
		} );
	}
} );
