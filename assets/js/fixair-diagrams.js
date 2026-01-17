/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION
 * Version: 2.2.0 - WITH PLACEHOLDER HANDLING
 * 
 * FIXES:
 * - Handles .mermaid-placeholder elements with data-mermaid-code attribute
 * - Proper initialization timing
 * - Sanitization of AI-generated code
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // MERMAID CONFIGURATION - Premium FixAIR Theme
    // ─────────────────────────────────────────────────────────────────────────────
    const MERMAID_CONFIG = {
        startOnLoad: false,  // We handle rendering manually
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        
        themeVariables: {
            // Backgrounds
            background: 'transparent',
            mainBkg: '#18181b',
            secondaryBkg: '#18181b',
            tertiaryBkg: '#1f1f23',
            
            // Primary (Nodes)
            primaryColor: '#18181b',
            primaryTextColor: '#fafafa',
            primaryBorderColor: 'rgba(255, 255, 255, 0.12)',
            
            // Secondary
            secondaryColor: '#18181b',
            secondaryTextColor: '#fafafa',
            secondaryBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            // Tertiary
            tertiaryColor: '#1f1f23',
            tertiaryTextColor: '#a1a1aa',
            tertiaryBorderColor: 'rgba(255, 255, 255, 0.08)',
            
            // Node specific
            nodeBorder: 'rgba(255, 255, 255, 0.12)',
            nodeTextColor: '#fafafa',
            
            // Lines
            lineColor: '#52525b',
            
            // Edge labels
            edgeLabelBackground: 'transparent',
            
            // Clusters
            clusterBkg: 'rgba(255, 255, 255, 0.02)',
            clusterBorder: 'rgba(255, 255, 255, 0.05)',
            
            // Notes
            noteBkgColor: '#18181b',
            noteBorderColor: 'rgba(255, 255, 255, 0.1)',
            noteTextColor: '#a1a1aa',
            
            // Sequence - Actors
            actorBkg: '#18181b',
            actorBorder: 'rgba(255, 255, 255, 0.12)',
            actorTextColor: '#fafafa',
            actorLineColor: '#27272a',
            
            // Sequence - Signals
            signalColor: '#52525b',
            signalTextColor: '#e4e4e7',
            
            // Sequence - Labels
            labelBoxBkgColor: '#18181b',
            labelBoxBorderColor: 'rgba(255, 255, 255, 0.08)',
            labelTextColor: '#71717a',
            loopTextColor: '#71717a',
            
            // Sequence - Activation
            activationBkgColor: '#1f1f23',
            activationBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            // State
            labelBackgroundColor: 'transparent',
            
            // Typography
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
                console.log('[FixAIR Diagrams] Already initialized');
                return true;
            }
            
            if (typeof mermaid === 'undefined') {
                console.error('[FixAIR Diagrams] Mermaid library not found.');
                return false;
            }
            
            mermaid.initialize(MERMAID_CONFIG);
            this.initialized = true;
            console.log('[FixAIR Diagrams] Initialized with premium theme ✓');
            return true;
        },
        
        /**
         * Sanitize Mermaid code to fix common AI syntax errors
         */
        sanitize: function(code) {
            if (!code) return '';
            let sanitized = code;
            
            // 1. Fix subgraph names with accents/special chars
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
            
            // 2. Fix edge labels with parentheses
            sanitized = sanitized.replace(
                /\|([^|"]+\([^)]+\)[^|]*)\|/g,
                function(match, content) {
                    return '|"' + content.replace(/[()]/g, '') + '"|';
                }
            );
            
            // 3. Fix node labels with unquoted parentheses  
            sanitized = sanitized.replace(
                /\[([^\]"]+\([^)]+\)[^\]]*)\]/g,
                function(match, content) {
                    return '["' + content + '"]';
                }
            );
            
            // 4. Fix slashes in node labels
            sanitized = sanitized.replace(
                /\[([^\]"]*?)\/([^\]"]*?)\]/g,
                '["$1/$2"]'
            );
            
            // 5. Remove style commands
            sanitized = sanitized.replace(/^\s*style\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*classDef\s+.+$/gm, '');
            
            return sanitized;
        },
        
        /**
         * MAIN RENDER FUNCTION
         * Handles both .mermaid elements AND .mermaid-placeholder elements
         */
        render: async function(container) {
            // Ensure initialized
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
                // HANDLE .mermaid-placeholder ELEMENTS (from technician app)
                // ═══════════════════════════════════════════════════════════════
                const placeholders = el.querySelectorAll('.mermaid-placeholder:not(.mermaid-rendered)');
                
                for (const placeholder of placeholders) {
                    const mermaidCode = placeholder.getAttribute('data-mermaid-code');
                    
                    if (mermaidCode) {
                        // Decode HTML entities
                        let decodedCode = decodeHtmlEntities(mermaidCode);
                        
                        // Sanitize the code
                        const sanitizedCode = this.sanitize(decodedCode);
                        
                        // Generate unique ID
                        const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        
                        try {
                            // Render with mermaid
                            const { svg } = await mermaid.render(diagramId, sanitizedCode);
                            
                            // Insert SVG and mark as rendered
                            placeholder.innerHTML = svg;
                            placeholder.classList.add('mermaid-rendered');
                            
                            console.log('[FixAIR Diagrams] Rendered placeholder ✓');
                        } catch (renderError) {
                            console.error('[FixAIR Diagrams] Render error:', renderError);
                            placeholder.innerHTML = '<div class="mermaid-error" style="color: #ef4444; padding: 16px; background: rgba(239,68,68,0.1); border-radius: 8px; font-size: 12px;">Diagram error: ' + renderError.message + '</div>';
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
                        console.log('[FixAIR Diagrams] Rendered .mermaid element ✓');
                    } catch (renderError) {
                        console.error('[FixAIR Diagrams] Render error:', renderError);
                        mermaidEl.innerHTML = '<div class="mermaid-error" style="color: #ef4444; padding: 16px;">Error: ' + renderError.message + '</div>';
                        mermaidEl.setAttribute('data-processed', 'true');
                    }
                }
                
                // ═══════════════════════════════════════════════════════════════
                // HANDLE CODE BLOCKS (```mermaid)
                // ═══════════════════════════════════════════════════════════════
                const codeBlocks = el.querySelectorAll('pre code.language-mermaid:not([data-processed]), code.mermaid:not([data-processed])');
                
                for (const block of codeBlocks) {
                    const code = block.textContent;
                    if (!code || code.trim() === '') continue;
                    
                    const sanitizedCode = this.sanitize(code);
                    const diagramId = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                    
                    try {
                        const { svg } = await mermaid.render(diagramId, sanitizedCode);
                        
                        // Create wrapper
                        const wrapper = document.createElement('div');
                        wrapper.className = 'mermaid-rendered';
                        wrapper.innerHTML = svg;
                        
                        // Replace code block
                        const pre = block.closest('pre') || block;
                        pre.parentNode.replaceChild(wrapper, pre);
                        
                        console.log('[FixAIR Diagrams] Rendered code block ✓');
                    } catch (renderError) {
                        console.error('[FixAIR Diagrams] Code block error:', renderError);
                        block.setAttribute('data-processed', 'true');
                    }
                }
                
            } catch (error) {
                console.error('[FixAIR Diagrams] Render error:', error);
            }
        },
        
        /**
         * Render a single diagram from code string
         */
        renderCode: async function(code, container, id) {
            if (!this.initialized) this.init();
            
            const diagramId = id || 'fd-diagram-' + Date.now();
            const sanitizedCode = this.sanitize(code);
            
            try {
                const { svg } = await mermaid.render(diagramId, sanitizedCode);
                if (container) {
                    container.innerHTML = svg;
                }
                return svg;
            } catch (error) {
                console.error('[FixAIR Diagrams] Code render error:', error);
                throw error;
            }
        },
        
        /**
         * Get configuration (for debugging)
         */
        getConfig: function() {
            return { ...MERMAID_CONFIG };
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO-INITIALIZATION - Run immediately when script loads
    // ─────────────────────────────────────────────────────────────────────────────
    FixAIRDiagrams.init();

    // ─────────────────────────────────────────────────────────────────────────────
    // EXPORT TO GLOBAL SCOPE
    // ─────────────────────────────────────────────────────────────────────────────
    window.FixAIRDiagrams = FixAIRDiagrams;
    
    console.log('[FixAIR Diagrams] Module loaded v2.2.0 ✓');

})();
