<?php
/**
 * Plugin Name: Georgian Hyphenation
 * Plugin URI: https://github.com/guramzhgamadze/georgian-hyphenation
 * Description: Academic Georgian hyphenation with full Elementor support. Uses v2.0 Academic Logic with Phonological Distance Analysis.
 * Version: 2.0.3
 * Author: Guram Zhgamadze
 * Author URI: https://github.com/guramzhgamadze
 * License: MIT
 * Text Domain: georgian-hyphenation
 * Requires at least: 5.0
 * Requires PHP: 7.0
 * 
 * Changelog:
 * 2.0.3 - Individual toggles for Elementor widgets, fixed auto-justify
 * 2.0.2 - Fixed unicode escaping, added debug logs
 * 2.0.1 - Initial release
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class GeorgianHyphenationWP {

    private $elementor_widgets = array(
        'text_editor' => array(
            'label' => 'Text Editor Widget',
            'selector' => '.elementor-text-editor, .elementor-widget-container p'
        ),
        'heading' => array(
            'label' => 'Heading Widget',
            'selector' => '.elementor-heading-title'
        ),
        'icon_box' => array(
            'label' => 'Icon Box Widget',
            'selector' => '.elementor-icon-box-description, .elementor-icon-box-title'
        ),
        'testimonial' => array(
            'label' => 'Testimonial Widget',
            'selector' => '.elementor-testimonial-content'
        ),
        'accordion' => array(
            'label' => 'Accordion Widget',
            'selector' => '.elementor-accordion-content, .elementor-tab-title'
        ),
        'tabs' => array(
            'label' => 'Tabs Widget',
            'selector' => '.elementor-tab-content'
        ),
        'toggle' => array(
            'label' => 'Toggle Widget',
            'selector' => '.elementor-toggle-content, .elementor-toggle-title'
        )
    );

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'create_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function create_menu() {
        add_options_page(
            __('Georgian Hyphenation Settings', 'georgian-hyphenation'),
            __('Georgian Hyphenation', 'georgian-hyphenation'),
            'manage_options',
            'georgian-hyphenation',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting( 'gh-settings', 'gh_enabled', array(
            'type' => 'boolean',
            'default' => true
        ));
        
        // Register each Elementor widget toggle
        foreach ($this->elementor_widgets as $key => $widget) {
            register_setting( 'gh-settings', 'gh_elementor_' . $key, array(
                'type' => 'boolean',
                'default' => true
            ));
        }
        
        register_setting( 'gh-settings', 'gh_additional_selectors', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'article p, .entry-content p, .site-content p'
        ));
        
        register_setting( 'gh-settings', 'gh_auto_justify', array(
            'type' => 'boolean',
            'default' => true
        ));
    }

    public function settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            return;
        }
        ?>
        <div class="wrap">
            <h1>🇬🇪 <?php echo esc_html( get_admin_page_title() ); ?></h1>
            
            <div class="notice notice-info">
                <p><strong>Version 2.0.3</strong> - Academic Logic with Phonological Distance Analysis</p>
                <p>
                    📦 <a href="https://www.npmjs.com/package/georgian-hyphenation" target="_blank">NPM Package</a> | 
                    🐍 <a href="https://pypi.org/project/georgian-hyphenation/" target="_blank">PyPI Package</a> | 
                    🐙 <a href="https://github.com/guramzhgamadze/georgian-hyphenation" target="_blank">GitHub</a> | 
                    🎨 <a href="https://guramzhgamadze.github.io/georgian-hyphenation/" target="_blank">Live Demo</a>
                </p>
            </div>
            
            <form method="post" action="options.php">
                <?php settings_fields( 'gh-settings' ); ?>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">
                            <label for="gh_enabled"><?php _e('Enable Hyphenation', 'georgian-hyphenation'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" 
                                   id="gh_enabled" 
                                   name="gh_enabled" 
                                   value="1" 
                                   <?php checked(1, get_option('gh_enabled', 1)); ?> />
                            <label for="gh_enabled"><strong>ქართული დამარცვლის ჩართვა</strong></label>
                            <p class="description">მთავარი ჩართვა/გამორთვა</p>
                        </td>
                    </tr>
                </table>
                
                <hr style="margin: 30px 0;">
                
                <h2 style="margin-top: 0;">🎨 Elementor Widgets</h2>
                <p class="description" style="margin-bottom: 20px;">აირჩიეთ რომელ Elementor ვიჯეტებზე გინდათ დამარცვლა:</p>
                
                <table class="form-table">
                    <?php foreach ($this->elementor_widgets as $key => $widget): ?>
                    <tr valign="top">
                        <th scope="row">
                            <label for="gh_elementor_<?php echo $key; ?>"><?php echo esc_html($widget['label']); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" 
                                   id="gh_elementor_<?php echo $key; ?>" 
                                   name="gh_elementor_<?php echo $key; ?>" 
                                   value="1" 
                                   <?php checked(1, get_option('gh_elementor_' . $key, 1)); ?> />
                            <label for="gh_elementor_<?php echo $key; ?>">ჩართვა</label>
                            <p class="description">
                                <code><?php echo esc_html($widget['selector']); ?></code>
                            </p>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </table>
                
                <hr style="margin: 30px 0;">
                
                <h2 style="margin-top: 0;">➕ Additional Selectors</h2>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">
                            <label for="gh_additional_selectors"><?php _e('Custom CSS Selectors', 'georgian-hyphenation'); ?></label>
                        </th>
                        <td>
                            <textarea id="gh_additional_selectors" 
                                      name="gh_additional_selectors" 
                                      rows="4" 
                                      cols="50" 
                                      class="large-text code"
                                      placeholder="article p, .custom-class"><?php echo esc_textarea( get_option('gh_additional_selectors', 'article p, .entry-content p, .site-content p') ); ?></textarea>
                            <p class="description">
                                დამატებითი CSS selectors (მაგ: WordPress themes, custom elements)<br>
                                <strong>მაგალითი:</strong> <code>.my-custom-content p, .post-body</code>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <hr style="margin: 30px 0;">
                
                <h2 style="margin-top: 0;">⚙️ Options</h2>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">
                            <label for="gh_auto_justify"><?php _e('Auto Justify Text', 'georgian-hyphenation'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" 
                                   id="gh_auto_justify" 
                                   name="gh_auto_justify" 
                                   value="1" 
                                   <?php checked(1, get_option('gh_auto_justify', 1)); ?> />
                            <label for="gh_auto_justify"><?php _e('Apply text-align: justify', 'georgian-hyphenation'); ?></label>
                            <p class="description">ტექსტის ორივე მხარეს გასწორება გადატანის უკეთესი ეფექტისთვის</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Save Settings', 'primary', 'submit', true, array('style' => 'font-size: 16px; padding: 10px 30px;')); ?>
            </form>
            
            <hr style="margin-top: 40px;">
            
            <h2>📋 <?php _e('Current Configuration', 'georgian-hyphenation'); ?></h2>
            <div style="background: #f0f0f1; padding: 20px; border-radius: 5px;">
                <h3>Active CSS Selectors:</h3>
                <code style="display: block; background: white; padding: 15px; border-radius: 4px; white-space: pre-wrap; word-break: break-all;">
                    <?php 
                    $selectors_preview = $this->get_active_selectors();
                    echo esc_html($selectors_preview ? $selectors_preview : 'No selectors active');
                    ?>
                </code>
            </div>
            
            <hr>
            
            <h2>📊 <?php _e('Test Preview', 'georgian-hyphenation'); ?></h2>
            <p><?php _e('Narrow your browser window to see hyphenation in action:', 'georgian-hyphenation'); ?></p>
            <div style="max-width: 400px; padding: 20px; background: #f0f0f1; border-radius: 5px; text-align: justify; hyphens: manual;">
                <p>სა­ქარ­თვე­ლო არის ძა­ლი­ან ლა­მა­ზი ქვე­ყა­ნა კავ­კა­სი­ა­ში, რო­მე­ლიც გა­მო­ირ­ჩე­ვა თა­ვი­სი უნი­კა­ლუ­რი კულ­ტუ­რი­თა და ის­ტო­რი­ით.</p>
            </div>
            
            <hr>
            
            <h2>🧠 <?php _e('Algorithm', 'georgian-hyphenation'); ?></h2>
            <p><?php _e('This plugin uses v2.0 Academic Logic with:', 'georgian-hyphenation'); ?></p>
            <ul style="list-style: disc; margin-left: 20px;">
                <li><strong>Phonological Distance Analysis</strong> - Intelligent vowel-to-vowel distance calculation</li>
                <li><strong>Anti-Orphan Protection</strong> - Prevents single-character splits</li>
                <li><strong>'R' Rule</strong> - Special handling for Georgian 'რ' in consonant clusters</li>
                <li><strong>98%+ Accuracy</strong> - Validated on 10,000+ Georgian words</li>
            </ul>
            
            <hr>
            
            <h2>🐛 <?php _e('Debugging', 'georgian-hyphenation'); ?></h2>
            <p>Open browser console (F12) to see detailed logs when plugin runs.</p>
            <p><strong>Expected console output:</strong></p>
            <ul style="list-style: disc; margin-left: 20px;">
                <li>🎯 Georgian Hyphenation Plugin v2.0.3: Starting...</li>
                <li>✅ GeorgianHyphenator library loaded!</li>
                <li>📋 CSS Selectors: ...</li>
                <li>🎯 Found elements: X</li>
                <li>✅ Georgian Hyphenation Complete!</li>
            </ul>
        </div>
        <?php
    }

    private function get_active_selectors() {
        $selectors_array = array();
        
        // Add enabled Elementor widgets
        foreach ($this->elementor_widgets as $key => $widget) {
            if ( get_option('gh_elementor_' . $key, 1) ) {
                $selectors_array[] = $widget['selector'];
            }
        }
        
        // Add additional selectors if not empty
        $additional_selectors = get_option('gh_additional_selectors', '');
        if ( !empty($additional_selectors) ) {
            $selectors_array[] = trim($additional_selectors);
        }
        
        return implode(', ', $selectors_array);
    }

    public function enqueue_assets() {
        // Check if enabled
        if ( ! get_option('gh_enabled', 1) ) {
            return;
        }
        
        // Skip in Elementor editor mode
        if ( did_action( 'elementor/loaded' ) ) {
            if ( \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
                return;
            }
        }

        // Load georgian-hyphenation from jsDelivr CDN (NPM package)
        wp_enqueue_script(
            'georgian-hyphenation',
            'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2/src/javascript/index.js',
            array(),
            '2.0.3',
            true
        );

        // Get active selectors
        $selectors = $this->get_active_selectors();
        
        // Get auto justify setting (properly handle checkbox)
        $justify_option = get_option('gh_auto_justify', 1);
        $justify = !empty($justify_option) ? 1 : 0;
        
        // Escape for JavaScript
        $selectors_escaped = esc_js($selectors);
        $justify_escaped = esc_js($justify);

        // Use heredoc to avoid escaping issues
        $init_js = <<<JAVASCRIPT
(function() {
    'use strict';
    
    console.log('🎯 Georgian Hyphenation Plugin v2.0.3: Starting...');
    
    const runHyphenation = () => {
        // Wait for library to load
        if (typeof window.GeorgianHyphenator === 'undefined') {
            console.log('⏳ Waiting for GeorgianHyphenator library...');
            setTimeout(runHyphenation, 100);
            return;
        }
        
        console.log('✅ GeorgianHyphenator library loaded!');
        
        const hyphenator = new window.GeorgianHyphenator('\u00AD');
        const selectors = '{$selectors_escaped}';
        const autoJustify = '{$justify_escaped}' === '1';
        
        console.log('📋 CSS Selectors:', selectors);
        console.log('🎨 Auto Justify:', autoJustify);
        
        if (!selectors) {
            console.warn('⚠️ No selectors configured!');
            return;
        }
        
        const elements = document.querySelectorAll(selectors);
        
        console.log('🎯 Found elements:', elements.length);
        
        if (elements.length === 0) {
            console.warn('⚠️ No matching elements found for selectors:', selectors);
            return;
        }
        
        let processedCount = 0;
        
        elements.forEach((el, index) => {
            // Skip if already processed
            if (el.dataset.ghProcessed === 'true') {
                console.log('⏭️ Element ' + (index + 1) + ' already processed, skipping');
                return;
            }
            
            // Skip editable elements
            if (el.isContentEditable) {
                console.log('⏭️ Element ' + (index + 1) + ' is contentEditable, skipping');
                return;
            }
            
            console.log('📝 Processing element ' + (index + 1) + ':', el.className || el.tagName);
            
            // Process text nodes
            const walker = document.createTreeWalker(
                el,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Only process nodes with Georgian text (4+ chars)
                        return /[ა-ჰ]{4,}/.test(node.nodeValue) 
                            ? NodeFilter.FILTER_ACCEPT 
                            : NodeFilter.FILTER_SKIP;
                    }
                },
                false
            );
            
            let node;
            const nodes = [];
            while (node = walker.nextNode()) {
                nodes.push(node);
            }
            
            console.log('   📄 Found ' + nodes.length + ' text nodes with Georgian text');
            
            if (nodes.length === 0) {
                console.log('   ⏭️ No Georgian text found in element ' + (index + 1));
                return;
            }
            
            nodes.forEach((textNode, i) => {
                const original = textNode.nodeValue;
                
                // 1. Remove any existing soft hyphens first (clean slate)
                let cleanText = textNode.nodeValue.replace(/\u00AD/g, '');
                
                // 2. Apply fresh hyphenation with v2.0 Academic Logic
                textNode.nodeValue = hyphenator.hyphenateText(cleanText);
                
                const hyphensAdded = (textNode.nodeValue.match(/\u00AD/g) || []).length;
                console.log('   ' + (i + 1) + '. Hyphenated: "' + original.substring(0, 30) + '..." → ' + hyphensAdded + ' hyphens');
            });
            
            // Apply justify if enabled and text was processed
            if (autoJustify && nodes.length > 0) {
                el.style.textAlign = 'justify';
                el.style.hyphens = 'manual';
                el.style.webkitHyphens = 'manual';
                console.log('   ✅ Applied justify to element ' + (index + 1));
            }
            
            // Mark as processed
            el.dataset.ghProcessed = 'true';
            processedCount++;
        });
        
        console.log('✅ Georgian Hyphenation Complete! Processed ' + processedCount + ' elements.');
    };

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runHyphenation);
    } else {
        runHyphenation();
    }
    
    // Support for Elementor popups
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('elementor/popup/show', function() {
            console.log('🎨 Elementor popup detected, running hyphenation...');
            setTimeout(runHyphenation, 100);
        });
    }
    
    // MutationObserver for dynamic content (AJAX, Load More, etc.)
    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                shouldRun = true;
            }
        });
        if (shouldRun) {
            console.log('🔄 DOM changed, re-running hyphenation...');
            setTimeout(runHyphenation, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('👀 MutationObserver active, watching for dynamic content...');
})();
JAVASCRIPT;
        
        wp_add_inline_script('georgian-hyphenation', $init_js);
    }
}

// Initialize plugin
new GeorgianHyphenationWP();