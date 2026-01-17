/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION
 * Version: 2.3.0 - IMPROVED SANITIZATION
 * 
 * FIXES:
 * - Handles .mermaid-placeholder elements with data-mermaid-code attribute
 * - Sanitizes parentheses in BOTH [] and {} shapes
 * - Handles accents, slashes, and special characters
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
            actorMargin: 80,
            showSequenceNumbers: true
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
        
        /**
         * Initialize Mermaid with FixAIR configuration
         */
        init: function() {
            if (this.initialized) {
                return true;
            }
            
            if (typeof mermaid === 'undefined') {
                console.error('[FixAIR Diagrams] Mermaid library not found.');
                return false;
            }
            
            mermaid.initialize(MERMAID_CONFIG);
            this.initialized = true;
            console.log('[FixAIR Diagrams] Initialized v2.3.0 ✓');
            return true;
        },
        
        /**
         * IMPROVED SANITIZE FUNCTION
         * Fixes: parentheses in {} and [], accents, slashes, special chars
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
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(
                /subgraph\s+([^[\n]+?)(?=\n)/g,
                function(match, name) {
                    if (name.includes('[')) return match;
                    const id = name.trim()
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '_')
                        .substring(0, 20);
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
            // 6. REMOVE style/classDef commands (we use CSS)
            // ═══════════════════════════════════════════════════════════════════
            sanitized = sanitized.replace(/^\s*style\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*classDef\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*class\s+\w+\s+\w+\s*$/gm, '');
            
            // ═══════════════════════════════════════════════════════════════════
            // 7. FIX remaining problematic characters in {} diamonds
            //    Handle any ? or special punctuation that might cause issues
            // ═══════════════════════════════════════════════════════════════════
            // (keeping ? is usually OK, but if issues persist, can quote)
            
            return sanitized;
        },
        
        /**
         * MAIN RENDER FUNCTION
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
                // HANDLE .mermaid-placeholder ELEMENTS
                // ═══════════════════════════════════════════════════════════════
                const placeholders = el.querySelectorAll('.mermaid-placeholder:not(.mermaid-rendered)');
                
                for (const placeholder of placeholders) {
                    const mermaidCode = placeholder.getAttribute('data-mermaid-code');
                    
                    if (mermaidCode) {
                        let decodedCode = decodeHtmlEntities(mermaidCode);
                        const sanitizedCode = this.sanitize(decodedCode);
                        
                        const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        
                        try {
                            const { svg } = await mermaid.render(diagramId, sanitizedCode);
                            placeholder.innerHTML = svg;
                            placeholder.classList.add('mermaid-rendered');
                            console.log('[FixAIR Diagrams] Rendered placeholder ✓');
                        } catch (renderError) {
                            console.error('[FixAIR Diagrams] Render error:', renderError.message);
                            console.log('[FixAIR Diagrams] Failed code:', sanitizedCode);
                            placeholder.innerHTML = '<div style="color: #f97316; padding: 16px; background: rgba(249,115,22,0.1); border-radius: 12px; font-size: 13px; font-family: Inter, sans-serif;"><strong>⚠️ Erreur diagramme</strong><br><small>' + renderError.message.substring(0, 100) + '</small></div>';
                            placeholder.classList.add('mermaid-rendered');
                        }
                    }
                }
                
                // ═══════════════════════════════════════════════════════════════
                // HANDLE STANDARD .mermaid ELEMENTS
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
         * Render code string directly
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
        
        getConfig: function() {
            return { ...MERMAID_CONFIG };
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO-INIT
    // ─────────────────────────────────────────────────────────────────────────────
    FixAIRDiagrams.init();
    window.FixAIRDiagrams = FixAIRDiagrams;
    console.log('[FixAIR Diagrams] Module loaded v2.3.0 ✓');

})();
