<?php
/**
 * Plugin Name: Georgian Hyphenation
 * Plugin URI: https://github.com/guramzhgamadze/georgian-hyphenation
 * Description: Academic Georgian hyphenation with full Elementor support. Uses v2.0 Academic Logic with Phonological Distance Analysis.
 * Version: 2.0.8
 * Author: Guram Zhgamadze
 * Author URI: https://github.com/guramzhgamadze
 * License: MIT
 * Text Domain: georgian-hyphenation
 * Requires at least: 5.0
 * Requires PHP: 7.0
 * * Changelog:
 * 2.0.8 - Moved to Top-Level Admin Menu with Icon
 * 2.0.7 - Added detailed helper text for Custom Selectors
 * 2.0.6 - Added modern UI switches
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
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function create_menu() {
        // შევცვალეთ add_options_page -> add_menu_page-ით
        add_menu_page(
            __('Georgian Hyphenation', 'georgian-hyphenation'), // გვერდის სათაური
            __('Geo Hyphenation', 'georgian-hyphenation'),      // მენიუს სათაური (ცოტა მოკლე რომ ჩაეტიოს)
            'manage_options',                                   // უფლებები
            'georgian-hyphenation',                             // Slug
            array($this, 'settings_page'),                      // ფუნქცია
            'dashicons-editor-paragraph',                       // აიკონი (აბზაცის ნიშანი)
            80                                                  // პოზიცია (Settings-ის ქვემოთ)
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
    }

    public function settings_page() {
        if ( ! current_user_can( 'manage_options' ) ) return;
        ?>
        <style>
            /* Switch Styles */
            .gh-switch { position: relative; display: inline-block; width: 50px; height: 24px; vertical-align: middle; margin-right: 10px; }
            .gh-switch input { opacity: 0; width: 0; height: 0; }
            .gh-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ff4d4d; transition: .4s; border-radius: 34px; }
            .gh-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .gh-slider { background-color: #4CAF50; }
            input:focus + .gh-slider { box-shadow: 0 0 1px #4CAF50; }
            input:checked + .gh-slider:before { transform: translateX(26px); }
            .gh-label { vertical-align: middle; font-weight: 600; }
            .gh-desc-code { display: block; margin-top: 5px; color: #666; font-size: 12px; }
            
            /* Helper Box Styles */
            .gh-helper-box {
                background: #f0f0f1;
                border-left: 4px solid #72aee6;
                padding: 15px;
                margin-top: 10px;
                border-radius: 0 4px 4px 0;
            }
            .gh-helper-list { margin: 0; padding-left: 20px; }
            .gh-helper-list li { margin-bottom: 5px; font-size: 13px; color: #50575e; }
            .gh-helper-list code { background: #fff; color: #d63638; padding: 2px 5px; }
        </style>

        <div class="wrap">
            <h1>🇬🇪 Georgian Hyphenation v2.0.8</h1>
            <form method="post" action="options.php">
                <?php settings_fields( 'gh-settings' ); ?>
                
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
                </table>

                <h3>Elementor ვიჯეტები</h3>
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

                <h3>დამატებითი პარამეტრები</h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">Custom CSS Selectors</th>
                        <td>
                            <textarea name="gh_additional_selectors" class="large-text code" rows="3" placeholder="მაგ: p, .my-custom-class"><?php echo esc_textarea( get_option('gh_additional_selectors', 'article p, .entry-content p') ); ?></textarea>
                            
                            <div class="gh-helper-box">
                                <p style="margin-top: 0; font-weight: bold;">ℹ️ როგორ გამოვიყენოთ:</p>
                                <p style="font-size: 13px;">ჩაწერეთ CSS კლასები მძიმით გამოყოფილი. ქვემოთ მოცემულია სტანდარტული კლასები:</p>
                                <ul class="gh-helper-list" style="list-style-type: disc;">
                                    <li><code>p</code> — ყველაზე უნივერსალური. დაამარცვლავს ყველა პარაგრაფს საიტზე.</li>
                                    <li><code>.entry-content p</code> — სტანდარტული WordPress პოსტების/სტატიების შიგთავსი.</li>
                                    <li><code>.elementor-widget-text-editor</code> — Elementor-ის ტექსტური ვიჯეტი (დაზღვევისთვის).</li>
                                    <li><code>.custom-class</code> — თქვენი საკუთარი კლასი (თუ იყენებთ Custom HTML/CSS-ს).</li>
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
            <h3>დიაგნოსტიკა</h3>
            <p><strong>აქტიური სელექტორები:</strong></p>
            <code style="display:block; background:#fff; padding:10px;"><?php echo esc_html($this->get_active_selectors()); ?></code>
        </div>
        <?php
    }

    private function get_active_selectors() {
        $selectors = array();
        
        // Elementor Selectors
        foreach ($this->elementor_widgets as $key => $widget) {
            if ( get_option('gh_elementor_' . $key, 1) ) {
                $selectors[] = $widget['selector'];
            }
        }
        
        // Custom Selectors
        $custom = get_option('gh_additional_selectors', '');
        if ( !empty($custom) ) {
            $selectors[] = trim($custom);
        }
        
        // FALLBACK: თუ არაფერია მონიშნული, დავამატოთ უბრალო 'p'
        if (empty($selectors)) {
            $selectors[] = 'p';
        }
        
        return implode(', ', $selectors);
    }

    public function enqueue_assets() {
        if ( ! get_option('gh_enabled', 1) ) return;
        if ( did_action( 'elementor/loaded' ) && \Elementor\Plugin::$instance->editor->is_edit_mode() ) return;

        wp_enqueue_script('georgian-hyphenation', 'https://cdn.jsdelivr.net/npm/georgian-hyphenation@2/src/javascript/index.js', array(), '2.0.8', true);

        $selectors_escaped = esc_js($this->get_active_selectors());
        $auto_justify = get_option('gh_auto_justify', 1) ? 'true' : 'false';

        $script = <<<JS
(function() {
    'use strict';
    const DEBUG = true;
    
    function log(msg, ...args) {
        if(DEBUG) console.log('🇬🇪 GH:', msg, ...args);
    }

    const run = () => {
        if (typeof window.GeorgianHyphenator === 'undefined') {
            return setTimeout(run, 200);
        }

        const selectors = '{$selectors_escaped}';
        const elements = document.querySelectorAll(selectors);
        
        if (elements.length === 0) {
            log('⚠️ მითითებული კლასებით ელემენტები ვერ მოიძებნა. ვცდილობ Fallback-ს: "p"');
            const fallbackElements = document.querySelectorAll('p');
            if (fallbackElements.length > 0) {
                 log('✅ Fallback-მა იპოვა ' + fallbackElements.length + ' ელემენტი.');
            }
            return;
        }

        const hyphenator = new window.GeorgianHyphenator('\\u00AD');
        let count = 0;

        elements.forEach(el => {
            if (el.dataset.ghProcessed || el.isContentEditable) return;
            
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let node; 
            let hasGeorgian = false;
            
            while (node = walker.nextNode()) {
                if (/[ა-ჰ]{4,}/.test(node.nodeValue)) {
                    node.nodeValue = hyphenator.hyphenateText(node.nodeValue.replace(/\\u00AD/g, ''));
                    hasGeorgian = true;
                }
            }

            if (hasGeorgian) {
                if ({$auto_justify}) {
                    el.style.textAlign = 'justify';
                    el.style.hyphens = 'manual';
                }
                el.dataset.ghProcessed = 'true';
                count++;
            }
        });
        
        if (count > 0) log('✅ წარმატებით დამუშავდა ' + count + ' ელემენტი.');
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
    
    let timeout;
    new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length)) {
            clearTimeout(timeout);
            timeout = setTimeout(run, 500);
        }
    }).observe(document.body, { childList: true, subtree: true });
    
    if (typeof jQuery !== 'undefined') jQuery(document).on('elementor/popup/show', () => setTimeout(run, 200));
})();
JS;
        wp_add_inline_script('georgian-hyphenation', $script);
    }
}
new GeorgianHyphenationWP();