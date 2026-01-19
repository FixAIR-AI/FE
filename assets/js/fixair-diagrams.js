/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION
 * Version: 2.3.0
 * 
 * FEATURES:
 * - Handles .mermaid-placeholder elements with data-mermaid-code attribute
 * - Sanitizes parentheses in BOTH [] and {} shapes
 * - Handles accents, slashes, and special characters
 * - Removes style/classDef commands (CSS handles styling)
 * 
 * USAGE:
 * 1. Include Mermaid CDN before this script
 * 2. Include fixair-diagrams.css
 * 3. Call FixAIRDiagrams.render(container) after adding content
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // MERMAID CONFIGURATION - Premium FixAIR Theme
    // ─────────────────────────────────────────────────────────────────────────────
    const MERMAID_CONFIG = {
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        
        themeVariables: {
            background: 'transparent',
            mainBkg: '#18181b',
            secondaryBkg: '#18181b',
            tertiaryBkg: '#1f1f23',
            
            primaryColor: '#18181b',
            primaryTextColor: '#fafafa',
            primaryBorderColor: 'rgba(255, 255, 255, 0.12)',
            
            secondaryColor: '#18181b',
            secondaryTextColor: '#fafafa',
            secondaryBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            tertiaryColor: '#1f1f23',
            tertiaryTextColor: '#a1a1aa',
            tertiaryBorderColor: 'rgba(255, 255, 255, 0.08)',
            
            nodeBorder: 'rgba(255, 255, 255, 0.12)',
            nodeTextColor: '#fafafa',
            
            lineColor: '#52525b',
            edgeLabelBackground: 'transparent',
            
            clusterBkg: 'rgba(255, 255, 255, 0.02)',
            clusterBorder: 'rgba(255, 255, 255, 0.05)',
            
            noteBkgColor: '#18181b',
            noteBorderColor: 'rgba(255, 255, 255, 0.1)',
            noteTextColor: '#a1a1aa',
            
            actorBkg: '#18181b',
            actorBorder: 'rgba(255, 255, 255, 0.12)',
            actorTextColor: '#fafafa',
            actorLineColor: '#27272a',
            
            signalColor: '#52525b',
            signalTextColor: '#e4e4e7',
            
            labelBoxBkgColor: '#18181b',
            labelBoxBorderColor: 'rgba(255, 255, 255, 0.08)',
            labelTextColor: '#71717a',
            loopTextColor: '#71717a',
            
            activationBkgColor: '#1f1f23',
            activationBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            labelBackgroundColor: 'transparent',
            
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px'
        },
        
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 50,
            rankSpacing: 60,
            padding: 20
        },
        
        sequence: {
            useMaxWidth: true,
            diagramMarginX: 60,
            diagramMarginY: 40,
            actorMargin: 100,
            width: 200,
            height: 65,
            messageMargin: 60,
            boxMargin: 30,
            boxTextMargin: 10,
            noteMargin: 20,
            mirrorActors: false,
            showSequenceNumbers: true,
            actorFontSize: 16,
            messageFontSize: 14,
            noteFontSize: 13
        },
        
        state: {
            useMaxWidth: true,
            nodeSpacing: 80,
            rankSpacing: 80,
            labelBoxBkgColor: 'transparent',
            labelBoxBorderColor: 'transparent'
        },
        
        gantt: {
            useMaxWidth: true,
            barHeight: 35,
            barGap: 8,
            topPadding: 60,
            leftPadding: 140,
            gridLineStartPadding: 40,
            fontSize: 13,
            sectionFontSize: 14,
            numberSectionStyles: 4
        },
        
        er: {
            useMaxWidth: true,
            layoutDirection: 'TB',
            minEntityWidth: 160,
            minEntityHeight: 80,
            entityPadding: 20,
            fontSize: 13
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPER: Decode HTML entities
    // ─────────────────────────────────────────────────────────────────────────────
    function decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // FIXAIR DIAGRAMS NAMESPACE
    // ─────────────────────────────────────────────────────────────────────────────
    const FixAIRDiagrams = {
        initialized: false,
        version: '2.3.0',
        
        /**
         * Initialize Mermaid with FixAIR configuration
         */
        init: function() {
            if (this.initialized) {
                return true;
            }
            
            if (typeof mermaid === 'undefined') {
                console.error('[FixAIR Diagrams] Mermaid library not found. Please include mermaid.min.js');
                return false;
            }
            
            mermaid.initialize(MERMAID_CONFIG);
            this.initialized = true;
            console.log('[FixAIR Diagrams] Initialized v' + this.version + ' ✓');
            return true;
        },
        
        /**
         * SANITIZE FUNCTION v2.3.0
         * Fixes common Mermaid syntax issues that cause parse errors
         * 
         * Handles:
         * - Parentheses in {} diamond shapes
         * - Parentheses in [] rectangle shapes
         * - Subgraph names with accents/special chars
         * - Edge labels with parentheses
         * - Slashes in labels
         * - Removes style/classDef commands
         */
        sanitize: function(code) {
            if (!code) return '';
            let sanitized = code;
            
            // ═══════════════════════════════════════════════════════════════════
            // 1. FIX DIAMOND SHAPES {} with parentheses
            //    {Carte inverter (IPM) OK ?} → {Carte inverter IPM OK ?}
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /\{([^}]*)\(([^)]*)\)([^}]*)\}/g,
                function(match, before, inside, after) {
                    // Remove parentheses but keep content
                    return '{' + before + inside + after + '}';
                }
            );
            
            // ═══════════════════════════════════════════════════════════════════
            // 2. FIX SQUARE BRACKETS [] with parentheses (if not already quoted)
            //    ["text (note)"] is OK, but [text (note)] needs fixing
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /\[([^\]"]*)\(([^)]*)\)([^\]"]*)\]/g,
                function(match, before, inside, after) {
                    // Wrap in quotes to protect special chars
                    return '["' + before + inside + after + '"]';
                }
            );
            
            // ═══════════════════════════════════════════════════════════════════
            // 3. FIX SUBGRAPH names with accents/special chars
            //    subgraph Télécommandes → subgraph TELECOMMANDES[" Telecommandes "]
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /subgraph\s+([^[\n]+?)(?=\n)/g,
                function(match, name) {
                    // Skip if already has brackets
                    if (name.includes('[')) return match;
                    
                    // Create safe ID (uppercase, no special chars)
                    const id = name.trim()
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '_')
                        .substring(0, 20);
                    
                    // Create display name (remove accents)
                    const displayName = name.trim()
                        .replace(/[()]/g, '')
                        .replace(/[éèêë]/g, 'e')
                        .replace(/[àâä]/g, 'a')
                        .replace(/[ùûü]/g, 'u')
                        .replace(/[ôö]/g, 'o')
                        .replace(/[îï]/g, 'i')
                        .replace(/[ç]/g, 'c')
                        .replace(/'/g, '');
                    
                    return 'subgraph ' + id + '[" ' + displayName + ' "]';
                }
            );
            
            // ═══════════════════════════════════════════════════════════════════
            // 4. FIX EDGE LABELS with parentheses |text (note)|
            //    |Bus M-NET (TB3)| → |Bus M-NET TB3|
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /\|([^|"]*)\(([^)]*)\)([^|"]*)\|/g,
                function(match, before, inside, after) {
                    return '|' + before + inside + after + '|';
                }
            );
            
            // ═══════════════════════════════════════════════════════════════════
            // 5. FIX SLASHES in labels (can break parsing)
            //    [TB3/TB5] → ["TB3/TB5"]
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /\[([^\]"]*\/[^\]"]*)\]/g,
                '["$1"]'
            );
            
            // ═══════════════════════════════════════════════════════════════════
            // 6. REMOVE style/classDef commands (we use CSS for styling)
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(/^\s*style\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*classDef\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*class\s+\w+\s+\w+\s*$/gm, '');
            
            return sanitized;
        },
        
        /**
         * MAIN RENDER FUNCTION
         * Processes all diagram placeholders and mermaid elements in a container
         * 
         * @param {HTMLElement|string} container - Element or selector to search within
         */
        render: async function(container) {
            if (!this.initialized) {
                this.init();
            }
            
            const el = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
            
            if (!el) {
                console.warn('[FixAIR Diagrams] Container not found');
                return;
            }
            
            try {
                // ═══════════════════════════════════════════════════════════════
                // HANDLE .mermaid-placeholder ELEMENTS (from parseMarkdown)
                // These have data-mermaid-code attribute with escaped HTML
                // ═══════════════════════════════════════════════════════════════
                const placeholders = el.querySelectorAll('.mermaid-placeholder:not(.mermaid-rendered)');
                
                for (const placeholder of placeholders) {
                    const mermaidCode = placeholder.getAttribute('data-mermaid-code');
                    
                    if (mermaidCode) {
                        // Decode HTML entities (&lt; → <, etc.)
                        let decodedCode = decodeHtmlEntities(mermaidCode);
                        
                        // Apply sanitization
                        const sanitizedCode = this.sanitize(decodedCode);
                        
                        // Generate unique ID for this diagram
                        const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        
                        try {
                            const { svg } = await mermaid.render(diagramId, sanitizedCode);
                            placeholder.innerHTML = svg;
                            placeholder.classList.add('mermaid-rendered');
                            console.log('[FixAIR Diagrams] Rendered placeholder ✓');
                        } catch (renderError) {
                            console.error('[FixAIR Diagrams] Render error:', renderError.message);
                            console.log('[FixAIR Diagrams] Failed code:', sanitizedCode.substring(0, 200));
                            
                            // Show error to user
                            placeholder.innerHTML = `
                                <div class="fd-diagram-error">
                                    <strong>⚠️ Erreur diagramme</strong>
                                    <small>${renderError.message.substring(0, 100)}</small>
                                </div>
                            `;
                            placeholder.classList.add('mermaid-rendered');
                        }
                    }
                }
                
                // ═══════════════════════════════════════════════════════════════
                // HANDLE STANDARD .mermaid ELEMENTS (direct mermaid content)
                // ═══════════════════════════════════════════════════════════════
                const mermaidEls = el.querySelectorAll('.mermaid:not([data-processed]):not(.mermaid-placeholder)');
                
                for (const mermaidEl of mermaidEls) {
                    const original = mermaidEl.textContent;
                    if (!original || original.trim() === '') continue;
                    
                    const sanitized = this.sanitize(original);
                    const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    
                    try {
                        const { svg } = await mermaid.render(diagramId, sanitized);
                        mermaidEl.innerHTML = svg;
                        mermaidEl.setAttribute('data-processed', 'true');
                    } catch (renderError) {
                        console.error('[FixAIR Diagrams] Render error:', renderError.message);
                        mermaidEl.setAttribute('data-processed', 'true');
                    }
                }
                
            } catch (error) {
                console.error('[FixAIR Diagrams] Error:', error);
            }
        },
        
        /**
         * Render Mermaid code directly to a container
         * 
         * @param {string} code - Mermaid code
         * @param {HTMLElement} container - Container to render into
         * @param {string} id - Optional custom ID
         * @returns {Promise<string>} - The rendered SVG
         */
        renderCode: async function(code, container, id) {
            if (!this.initialized) this.init();
            
            const diagramId = id || 'fd-' + Date.now();
            const sanitizedCode = this.sanitize(code);
            
            try {
                const { svg } = await mermaid.render(diagramId, sanitizedCode);
                if (container) container.innerHTML = svg;
                return svg;
            } catch (error) {
                console.error('[FixAIR Diagrams] renderCode error:', error);
                throw error;
            }
        },
        
        /**
         * Get the current Mermaid configuration
         */
        getConfig: function() {
            return { ...MERMAID_CONFIG };
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO-INIT on script load
    // ─────────────────────────────────────────────────────────────────────────────
    FixAIRDiagrams.init();
    
    // Export to global scope
    window.FixAIRDiagrams = FixAIRDiagrams;
    
    console.log('[FixAIR Diagrams] Module loaded v' + FixAIRDiagrams.version + ' ✓');

})();
