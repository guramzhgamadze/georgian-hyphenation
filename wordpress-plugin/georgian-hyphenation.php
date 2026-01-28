<?php
/**
 * Plugin Name: Georgian Hyphenation
 * Plugin URI: https://github.com/guramzhgamadze/georgian-hyphenation
 * Description: Georgian hyphenation with v2.2 Hybrid Engine (Algorithm + Dictionary). Full Elementor support.
 * Version: 2.2.4
 * Author: Guram Zhgamadze
 * Author URI: https://github.com/guramzhgamadze
 * License: MIT
 * Text Domain: georgian-hyphenation
 * Requires at least: 5.0
 * Requires PHP: 7.0
 * 
 * Changelog:
 * 2.2.4 - Fixed ESM loading with manual type="module" injection
 * 2.2.3 - Added Dictionary Support (150+ exceptions)
 * 2.2.2 - Automatic Sanitization (strips old hyphens)
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class GeorgianHyphenationWP {

    private $elementor_widgets = array(
        'text_editor' => array(
            'label' => 'Text Editor Widget',
            'selector' => '.elementor-text-editor, .elementor-widget-text-editor'
        ),
        'heading' => array(
            'label' => 'Heading Widget',
            'selector' => '.elementor-heading-title'
        ),
        'icon_box' => array(
            'label' => 'Icon Box Widget',
            'selector' => '.elementor-icon-box-description'
        ),
        'testimonial' => array(
            'label' => 'Testimonial Widget',
            'selector' => '.elementor-testimonial-content'
        ),
        'accordion' => array(
            'label' => 'Accordion/Toggle',
            'selector' => '.elementor-accordion-content, .elementor-tab-content, .elementor-toggle-content'
        )
    );

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'create_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'wp_footer', array( $this, 'inject_script' ), 100 );
    }

    public function create_menu() {
        add_menu_page(
            __('Georgian Hyphenation', 'georgian-hyphenation'),
            __('Geo Hyphenation', 'georgian-hyphenation'),
            'manage_options',
            'georgian-hyphenation',
            array($this, 'settings_page'),
            'dashicons-editor-paragraph',
            80
        );
    }

    public function register_settings() {
        register_setting( 'gh-settings', 'gh_enabled', array('type' => 'boolean', 'default' => true));
        
        foreach ($this->elementor_widgets as $key => $widget) {
            register_setting( 'gh-settings', 'gh_elementor_' . $key, array('type' => 'boolean', 'default' => true));
        }
        
        register_setting( 'gh-settings', 'gh_additional_selectors', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'article p, .entry-content p'
        ));
        
        register_setting( 'gh-settings', 'gh_auto_justify', array('type' => 'boolean', 'default' => true));
        register_setting( 'gh-settings', 'gh_load_dictionary', array('type' => 'boolean', 'default' => true));
    }

    public function settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) return;
        ?>
        <style>
            .gh-switch { position: relative; display: inline-block; width: 50px; height: 24px; vertical-align: middle; margin-right: 10px; }
            .gh-switch input { opacity: 0; width: 0; height: 0; }
            .gh-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ff4d4d; transition: .4s; border-radius: 34px; }
            .gh-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .gh-slider { background-color: #4CAF50; }
            input:focus + .gh-slider { box-shadow: 0 0 1px #4CAF50; }
            input:checked + .gh-slider:before { transform: translateX(26px); }
            .gh-label { vertical-align: middle; font-weight: 600; }
            .gh-desc-code { display: block; margin-top: 5px; color: #666; font-size: 12px; }
            .gh-helper-box { background: #f0f0f1; border-left: 4px solid #72aee6; padding: 15px; margin-top: 10px; border-radius: 0 4px 4px 0; }
            .gh-helper-list { margin: 0; padding-left: 20px; }
            .gh-helper-list li { margin-bottom: 5px; font-size: 13px; color: #50575e; }
            .gh-helper-list code { background: #fff; color: #d63638; padding: 2px 5px; }
            .gh-version-badge { display: inline-block; background: #4CAF50; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 10px; }
            .gh-feature-new { color: #4CAF50; font-weight: bold; font-size: 11px; }
        </style>

        <div class="wrap">
            <h1>
                🇬🇪 Georgian Hyphenation 
                <span class="gh-version-badge">v2.2.4</span>
            </h1>
            <p style="font-size: 14px; color: #666;">
                Hybrid Engine: Algorithm + Dictionary (150+ exceptions) | Auto-Sanitization
            </p>
            
            <form method="post" action="options.php">
                <?php settings_fields( 'gh-settings' ); ?>
                
                <h2>ძირითადი პარამეტრები</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">მთავარი სტატუსი</th>
                        <td>
                            <label class="gh-switch">
                                <input type="checkbox" name="gh_enabled" value="1" <?php checked(1, get_option('gh_enabled', 1)); ?> />
                                <span class="gh-slider"></span>
                            </label>
                            <span class="gh-label">პლაგინის ჩართვა</span>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            Dictionary Support 
                            <span class="gh-feature-new">✨ NEW</span>
                        </th>
                        <td>
                            <label class="gh-switch">
                                <input type="checkbox" name="gh_load_dictionary" value="1" <?php checked(1, get_option('gh_load_dictionary', 1)); ?> />
                                <span class="gh-slider"></span>
                            </label>
                            <span class="gh-label">გამონაკლისების ლექსიკონის ჩატვირთვა (150+ სიტყვა)</span>
                            <p class="description">
                                ℹ️ რეკომენდებულია! უზრუნველყოფს უფრო მაღალ სიზუსტეს.
                            </p>
                        </td>
                    </tr>
                </table>

                <h2>Elementor ვიჯეტები</h2>
                <table class="form-table">
                    <?php foreach ($this->elementor_widgets as $key => $widget): ?>
                    <tr>
                        <th scope="row"><?php echo esc_html($widget['label']); ?></th>
                        <td>
                            <div style="display: flex; align-items: center;">
                                <label class="gh-switch">
                                    <input type="checkbox" name="gh_elementor_<?php echo $key; ?>" value="1" <?php checked(1, get_option('gh_elementor_' . $key, 1)); ?> />
                                    <span class="gh-slider"></span>
                                </label>
                                <div>
                                    <span class="gh-label">აქტივაცია</span>
                                    <code class="gh-desc-code"><?php echo esc_html($widget['selector']); ?></code>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </table>

                <h2>დამატებითი პარამეტრები</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Custom CSS Selectors</th>
                        <td>
                            <textarea name="gh_additional_selectors" class="large-text code" rows="3" placeholder="მაგ: p, .my-custom-class"><?php echo esc_textarea( get_option('gh_additional_selectors', 'article p, .entry-content p') ); ?></textarea>
                            
                            <div class="gh-helper-box">
                                <p style="margin-top: 0; font-weight: bold;">ℹ️ როგორ გამოვიყენოთ:</p>
                                <ul class="gh-helper-list" style="list-style-type: disc;">
                                    <li><code>p</code> — ყველა პარაგრაფი.</li>
                                    <li><code>.entry-content p</code> — WordPress პოსტები.</li>
                                    <li><code>.elementor-widget-text-editor</code> — Elementor ტექსტი.</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Auto Justify</th>
                        <td>
                            <label class="gh-switch">
                                <input type="checkbox" name="gh_auto_justify" value="1" <?php checked(1, get_option('gh_auto_justify', 1)); ?> />
                                <span class="gh-slider"></span>
                            </label>
                            <span class="gh-label">ტექსტის გასწორება (Justify)</span>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr>
            <h2>დიაგნოსტიკა</h2>
            <table class="form-table">
                <tr>
                    <th scope="row">აქტიური სელექტორები:</th>
                    <td>
                        <code style="display:block; background:#fff; padding:10px; border:1px solid #ddd;">
                            <?php echo esc_html($this->get_active_selectors()); ?>
                        </code>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    private function get_active_selectors() {
        $selectors = array();
        
        foreach ($this->elementor_widgets as $key => $widget) {
            if ( get_option('gh_elementor_' . $key, 1) ) {
                $selectors[] = $widget['selector'];
            }
        }
        
        $custom = get_option('gh_additional_selectors', '');
        if ( !empty($custom) ) {
            $selectors[] = trim($custom);
        }
        
        if (empty($selectors)) {
            $selectors[] = 'p';
        }
        
        return implode(', ', $selectors);
    }

    public function inject_script() {
        if ( ! get_option('gh_enabled', 1) ) return;
        if ( did_action( 'elementor/loaded' ) && \Elementor\Plugin::$instance->editor->is_edit_mode() ) return;

        $selectors = esc_js($this->get_active_selectors());
        $auto_justify = get_option('gh_auto_justify', 1) ? 'true' : 'false';
        $load_dictionary = get_option('gh_load_dictionary', 1) ? 'true' : 'false';

        ?>
        <script type="module">
import GeorgianHyphenator from 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2.2.4/src/javascript/index.js';

(async function() {
    'use strict';
    const DEBUG = true;
    const LOAD_DICTIONARY = <?php echo $load_dictionary; ?>;
    
    function log(msg, ...args) {
        if(DEBUG) console.log('🇬🇪 GH v2.2.4:', msg, ...args);
    }

    log('🚀 Initializing...');

    const selectors = '<?php echo $selectors; ?>';
    
    async function processElements() {
        const elements = document.querySelectorAll(selectors);
        
        if (elements.length === 0) {
            log('⚠️ No elements found with selectors:', selectors);
            return;
        }

        log('📋 Elements found:', elements.length);

        // Initialize hyphenator
        const hyphenator = new GeorgianHyphenator('\u00AD');
        
        // Load Dictionary (if enabled)
        if (LOAD_DICTIONARY) {
            try {
                await hyphenator.loadDefaultLibrary();
                log('📚 Dictionary loaded');
            } catch (error) {
                log('⚠️ Dictionary unavailable');
            }
        }

        let count = 0;

        elements.forEach(el => {
            if (el.dataset.ghProcessed || el.isContentEditable) return;
            
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let node; 
            let hasGeorgian = false;
            
            while (node = walker.nextNode()) {
                if (/[ა-ჰ]{4,}/.test(node.nodeValue)) {
                    node.nodeValue = hyphenator.hyphenateText(node.nodeValue);
                    hasGeorgian = true;
                }
            }

            if (hasGeorgian) {
                if (<?php echo $auto_justify; ?>) {
                    el.style.textAlign = 'justify';
                    el.style.hyphens = 'manual';
                    el.style.webkitHyphens = 'manual';
                }
                el.dataset.ghProcessed = 'true';
                count++;
            }
        });
        
        if (count > 0) log('✅ Processed', count, 'elements');
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processElements);
    } else {
        processElements();
    }
    
    // MutationObserver for dynamic content
    let timeout;
    new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length)) {
            clearTimeout(timeout);
            timeout = setTimeout(processElements, 500);
        }
    }).observe(document.body, { childList: true, subtree: true });
    
    // Elementor Popup Support
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('elementor/popup/show', () => setTimeout(processElements, 200));
    }
})();
        </script>
        <?php
    }
}

new GeorgianHyphenationWP();