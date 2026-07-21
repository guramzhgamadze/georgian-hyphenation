/**
 * Builds the Chrome and Firefox extensions from the shared source.
 *
 *   node browser-extension-shared/build.mjs
 *
 * Generates the local engine (georgian-hyphenator.js) and dictionary
 * (dictionary.js) from the npm package, copies the shared content/popup/
 * background scripts + popup.html into each browser folder, and writes each
 * browser's manifest. Icons are left untouched. No CDN / external requests.
 */

import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const VERSION = '2.3.0';
const shared = new URL( './', import.meta.url );
const root = new URL( '../', import.meta.url );

const targets = {
	chrome: {
		dir: new URL( 'browser-extension-chrome/', root ),
		manifest: {
			manifest_version: 3,
			name: 'Georgian Hyphenation',
			version: VERSION,
			description: 'Automatic hyphenation for Georgian text — fully offline, no external requests.',
			permissions: [ 'storage' ],
			host_permissions: [ '<all_urls>' ],
			action: {
				default_popup: 'popup.html',
				default_icon: { 48: 'icons/icon48.png', 128: 'icons/icon128.png' }
			},
			icons: { 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
			background: { service_worker: 'js/background.js' },
			content_scripts: [ {
				matches: [ '<all_urls>' ],
				js: [ 'js/georgian-hyphenator.js', 'js/dictionary.js', 'js/content.js' ],
				run_at: 'document_idle',
				all_frames: false
			} ]
		}
	},
	firefox: {
		dir: new URL( 'browser-extension-firefox/', root ),
		manifest: {
			manifest_version: 3,
			name: 'Georgian Hyphenation',
			version: VERSION,
			description: 'Automatic hyphenation for Georgian text — fully offline, no external requests.',
			permissions: [ 'storage' ],
			host_permissions: [ '<all_urls>' ],
			action: {
				default_popup: 'popup.html',
				default_icon: { 48: 'icons/icon48.png', 128: 'icons/icon128.png' }
			},
			icons: { 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
			background: { scripts: [ 'js/background.js' ] },
			content_scripts: [ {
				matches: [ '<all_urls>' ],
				js: [ 'js/georgian-hyphenator.js', 'js/dictionary.js', 'js/content.js' ],
				run_at: 'document_idle',
				all_frames: false
			} ],
			browser_specific_settings: {
				gecko: {
					id: 'georgian-hyphenation@guramzhgamadze.github.io',
					strict_min_version: '128.0',
					data_collection_permissions: { required: [ 'none' ] }
				}
			}
		}
	}
};

// --- generate the classic engine build from the npm CommonJS source ---------

async function buildEngine() {
	const src = fileURLToPath( new URL( 'npm/src/javascript/index.cjs', root ) );
	let body = await readFile( src, 'utf8' );

	const marker = 'module.exports = GeorgianHyphenator;';
	const idx = body.indexOf( marker );
	if ( idx === -1 ) {
		throw new Error( 'module.exports marker not found in npm/src/javascript/index.cjs' );
	}
	body = body.slice( 0, idx ).trimEnd();
	body = body.replace( /^\/\*\*[\s\S]*?\*\/\s*/, '' ).replace( /^'use strict';\s*/, '' );
	// Indent the class body one level for the guard block.
	body = body.split( '\n' ).map( ( line ) => ( line ? '\t' + line : line ) ).join( '\n' );

	return `/**
 * Georgian Hyphenation engine — browser-extension build (classic script).
 *
 * GENERATED — do not edit. Class body is identical to the npm package
 * (georgian-hyphenation v${ VERSION }). Regenerate with:
 *   node browser-extension-shared/build.mjs
 */
'use strict';
if ( typeof window !== 'undefined' && typeof window.GeorgianHyphenator === 'undefined' ) {
${ body }

\twindow.GeorgianHyphenator = GeorgianHyphenator;
}
`;
}

async function buildDictionary() {
	const src = fileURLToPath( new URL( 'npm/data/exceptions.json', root ) );
	const json = await readFile( src, 'utf8' );
	// Assign to the content-script isolated-world global; no fetch, no
	// web_accessible_resources needed.
	return `/* GENERATED — Georgian Hyphenation exception dictionary (v${ VERSION }). */\n`
		+ `if ( typeof window !== 'undefined' ) { window.GEORGIAN_HYPHENATION_DICT = ${ json.trim() }; }\n`;
}

// --- assemble ---------------------------------------------------------------

const engine = await buildEngine();
const dictionary = await buildDictionary();

for ( const [ name, target ] of Object.entries( targets ) ) {
	const jsDir = new URL( 'js/', target.dir );
	await mkdir( jsDir, { recursive: true } );

	// Remove the old bundled engine name so no stale copy lingers.
	await rm( new URL( 'hyphenator.js', jsDir ), { force: true } );

	await writeFile( fileURLToPath( new URL( 'georgian-hyphenator.js', jsDir ) ), engine );
	await writeFile( fileURLToPath( new URL( 'dictionary.js', jsDir ) ), dictionary );

	for ( const file of [ 'content.js', 'popup.js', 'background.js' ] ) {
		await copyFile( fileURLToPath( new URL( file, shared ) ), fileURLToPath( new URL( file, jsDir ) ) );
	}
	await copyFile(
		fileURLToPath( new URL( 'popup.html', shared ) ),
		fileURLToPath( new URL( 'popup.html', target.dir ) )
	);

	await writeFile(
		fileURLToPath( new URL( 'manifest.json', target.dir ) ),
		JSON.stringify( target.manifest, null, 2 ) + '\n'
	);

	console.log( `${ name }: built v${ VERSION } (${ target.manifest.manifest_version === 3 ? 'MV3' : 'MV2' })` );
}

console.log( 'done' );
