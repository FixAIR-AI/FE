/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION
 * Version: 2.1.0
 * 
 * This file initializes Mermaid with FixAIR premium styling.
 * The styling is applied via themeVariables which Mermaid uses to generate
 * inline SVG styles. External CSS cannot override these, so configuration
 * must be done here.
 * 
 * USAGE:
 * 1. Include Mermaid CDN BEFORE this file
 * 2. Include this file
 * 3. For dynamic content, call: FixAIRDiagrams.render(element)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // MERMAID CONFIGURATION - Premium FixAIR Theme
    // These themeVariables generate inline SVG styles
    // ─────────────────────────────────────────────────────────────────────────────
    const MERMAID_CONFIG = {
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        
        // ═══════════════════════════════════════════════════════════════════════
        // THEME VARIABLES - These control the inline SVG styles Mermaid generates
        // ═══════════════════════════════════════════════════════════════════════
        themeVariables: {
            // ─────────────────────────────────────────────────────────────────────
            // BACKGROUNDS
            // ─────────────────────────────────────────────────────────────────────
            background: 'transparent',
            mainBkg: '#18181b',              // Node fill color
            secondaryBkg: '#18181b',
            tertiaryBkg: '#1f1f23',
            
            // ─────────────────────────────────────────────────────────────────────
            // PRIMARY COLORS (Nodes)
            // ─────────────────────────────────────────────────────────────────────
            primaryColor: '#18181b',          // Node background - CRITICAL!
            primaryTextColor: '#fafafa',      // Node text
            primaryBorderColor: 'rgba(255, 255, 255, 0.12)', // Node border
            
            // ─────────────────────────────────────────────────────────────────────
            // SECONDARY COLORS
            // ─────────────────────────────────────────────────────────────────────
            secondaryColor: '#18181b',
            secondaryTextColor: '#fafafa',
            secondaryBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            // ─────────────────────────────────────────────────────────────────────
            // TERTIARY COLORS
            // ─────────────────────────────────────────────────────────────────────
            tertiaryColor: '#1f1f23',
            tertiaryTextColor: '#a1a1aa',
            tertiaryBorderColor: 'rgba(255, 255, 255, 0.08)',
            
            // ─────────────────────────────────────────────────────────────────────
            // NODE SPECIFIC
            // ─────────────────────────────────────────────────────────────────────
            nodeBorder: 'rgba(255, 255, 255, 0.12)',
            nodeTextColor: '#fafafa',
            
            // ─────────────────────────────────────────────────────────────────────
            // LINES / EDGES
            // ─────────────────────────────────────────────────────────────────────
            lineColor: '#52525b',             // Edge/arrow color
            
            // ─────────────────────────────────────────────────────────────────────
            // EDGE LABELS
            // ─────────────────────────────────────────────────────────────────────
            edgeLabelBackground: 'transparent',
            
            // ─────────────────────────────────────────────────────────────────────
            // CLUSTERS / SUBGRAPHS
            // ─────────────────────────────────────────────────────────────────────
            clusterBkg: 'rgba(255, 255, 255, 0.02)',
            clusterBorder: 'rgba(255, 255, 255, 0.05)',
            
            // ─────────────────────────────────────────────────────────────────────
            // NOTES
            // ─────────────────────────────────────────────────────────────────────
            noteBkgColor: '#18181b',
            noteBorderColor: 'rgba(255, 255, 255, 0.1)',
            noteTextColor: '#a1a1aa',
            
            // ─────────────────────────────────────────────────────────────────────
            // SEQUENCE DIAGRAM - ACTORS
            // ─────────────────────────────────────────────────────────────────────
            actorBkg: '#18181b',
            actorBorder: 'rgba(255, 255, 255, 0.12)',
            actorTextColor: '#fafafa',
            actorLineColor: '#27272a',
            
            // ─────────────────────────────────────────────────────────────────────
            // SEQUENCE DIAGRAM - SIGNALS
            // ─────────────────────────────────────────────────────────────────────
            signalColor: '#52525b',
            signalTextColor: '#e4e4e7',
            
            // ─────────────────────────────────────────────────────────────────────
            // SEQUENCE DIAGRAM - LABELS
            // ─────────────────────────────────────────────────────────────────────
            labelBoxBkgColor: '#18181b',
            labelBoxBorderColor: 'rgba(255, 255, 255, 0.08)',
            labelTextColor: '#71717a',
            
            // ─────────────────────────────────────────────────────────────────────
            // SEQUENCE DIAGRAM - LOOPS
            // ─────────────────────────────────────────────────────────────────────
            loopTextColor: '#71717a',
            
            // ─────────────────────────────────────────────────────────────────────
            // SEQUENCE DIAGRAM - ACTIVATION
            // ─────────────────────────────────────────────────────────────────────
            activationBkgColor: '#1f1f23',
            activationBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            // ─────────────────────────────────────────────────────────────────────
            // STATE DIAGRAM
            // ─────────────────────────────────────────────────────────────────────
            labelBackgroundColor: 'transparent',
            
            // ─────────────────────────────────────────────────────────────────────
            // GANTT
            // ─────────────────────────────────────────────────────────────────────
            gridColor: '#1f1f23',
            doneTaskBkgColor: '#18181b',
            doneTaskBorderColor: '#22c55e',
            activeTaskBkgColor: '#18181b',
            activeTaskBorderColor: '#f97316',
            taskBkgColor: '#18181b',
            taskBorderColor: 'rgba(255, 255, 255, 0.08)',
            taskTextColor: '#fafafa',
            sectionBkgColor: 'rgba(255, 255, 255, 0.02)',
            
            // ─────────────────────────────────────────────────────────────────────
            // PIE CHART
            // ─────────────────────────────────────────────────────────────────────
            pie1: '#f97316',
            pie2: '#22c55e',
            pie3: '#3b82f6',
            pie4: '#a855f7',
            pie5: '#ef4444',
            pie6: '#eab308',
            pie7: '#06b6d4',
            pieStrokeColor: '#09090b',
            pieStrokeWidth: '2px',
            pieOpacity: '1',
            pieTitleTextColor: '#fafafa',
            pieSectionTextColor: '#fafafa',
            pieLegendTextColor: '#a1a1aa',
            
            // ─────────────────────────────────────────────────────────────────────
            // ER DIAGRAM
            // ─────────────────────────────────────────────────────────────────────
            entityBkg: '#18181b',
            entityBorder: 'rgba(255, 255, 255, 0.1)',
            
            // ─────────────────────────────────────────────────────────────────────
            // TYPOGRAPHY
            // ─────────────────────────────────────────────────────────────────────
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '14px'
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // FLOWCHART SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 50,
            rankSpacing: 60,
            padding: 20,
            diagramPadding: 20
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // SEQUENCE DIAGRAM SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        sequence: {
            useMaxWidth: true,
            diagramMarginX: 50,
            diagramMarginY: 30,
            actorMargin: 80,
            width: 180,
            height: 60,
            messageMargin: 50,
            boxMargin: 20,
            boxTextMargin: 10,
            noteMargin: 20,
            mirrorActors: false,
            showSequenceNumbers: true,
            actorFontSize: 16,
            messageFontSize: 14,
            noteFontSize: 13
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // STATE DIAGRAM SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        state: {
            useMaxWidth: true,
            nodeSpacing: 50,
            rankSpacing: 50
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // ER DIAGRAM SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        er: {
            useMaxWidth: true,
            layoutDirection: 'TB',
            minEntityWidth: 150,
            minEntityHeight: 80,
            entityPadding: 20,
            fontSize: 14
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // GANTT SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        gantt: {
            useMaxWidth: true,
            barHeight: 30,
            barGap: 8,
            topPadding: 60,
            leftPadding: 120,
            gridLineStartPadding: 40,
            fontSize: 13,
            sectionFontSize: 14,
            numberSectionStyles: 4
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // PIE CHART SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        pie: {
            useMaxWidth: true
        },
        
        // ═══════════════════════════════════════════════════════════════════════
        // CLASS DIAGRAM SETTINGS
        // ═══════════════════════════════════════════════════════════════════════
        class: {
            useMaxWidth: true
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // FIXAIR DIAGRAMS NAMESPACE
    // ─────────────────────────────────────────────────────────────────────────────
    const FixAIRDiagrams = {
        
        /**
         * Initialize Mermaid with FixAIR configuration
         */
        init: function() {
            if (typeof mermaid === 'undefined') {
                console.error('[FixAIR Diagrams] Mermaid library not found.');
                return false;
            }
            
            mermaid.initialize(MERMAID_CONFIG);
            console.log('[FixAIR Diagrams] Initialized with premium theme ✓');
            return true;
        },
        
        /**
         * Sanitize Mermaid code to fix common AI syntax errors
         * Fixes: accents, parentheses, subgraph names, slashes
         */
        sanitize: function(code) {
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
                    return '[' + content.replace(/[()]/g, '') + ']';
                }
            );
            
            // 4. Fix slashes in node labels
            sanitized = sanitized.replace(
                /\[([^\]]*?)\/([^\]]*?)\]/g,
                '[$1-$2]'
            );
            
            // 5. Remove style commands (CSS handles styling)
            sanitized = sanitized.replace(/^\s*style\s+.+$/gm, '');
            sanitized = sanitized.replace(/^\s*classDef\s+.+$/gm, '');
            
            return sanitized;
        },
        
        /**
         * Render all mermaid diagrams in a container
         * Use this for dynamically added content (e.g., chat messages)
         */
        render: async function(container) {
            const el = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;
            
            if (!el) {
                console.warn('[FixAIR Diagrams] Container not found');
                return;
            }
            
            try {
                // Find unprocessed mermaid elements
                const mermaidEls = el.querySelectorAll('.mermaid:not([data-processed])');
                
                // Sanitize code before rendering
                mermaidEls.forEach(function(mermaidEl) {
                    const original = mermaidEl.textContent;
                    const sanitized = FixAIRDiagrams.sanitize(original);
                    if (original !== sanitized) {
                        mermaidEl.textContent = sanitized;
                        console.log('[FixAIR Diagrams] Sanitized code');
                    }
                });
                
                // Render
                if (mermaidEls.length > 0) {
                    await mermaid.run({ nodes: mermaidEls });
                    console.log('[FixAIR Diagrams] Rendered', mermaidEls.length, 'diagram(s) ✓');
                }
            } catch (error) {
                console.error('[FixAIR Diagrams] Render error:', error);
            }
        },
        
        /**
         * Render a single diagram from code string
         */
        renderCode: async function(code, container, id) {
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
         * Parse content and extract mermaid code blocks
         */
        parseContent: function(content) {
            const diagrams = [];
            const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gi;
            let match;
            
            while ((match = mermaidRegex.exec(content)) !== null) {
                diagrams.push({
                    type: 'mermaid',
                    code: match[1].trim(),
                    fullMatch: match[0]
                });
            }
            
            return diagrams;
        },
        
        /**
         * Process a chat message and render mermaid diagrams
         */
        processMessage: async function(messageElement) {
            const mermaidBlocks = messageElement.querySelectorAll('pre code.language-mermaid, .mermaid-code');
            
            for (const block of mermaidBlocks) {
                const code = block.textContent;
                const sanitizedCode = this.sanitize(code);
                
                const wrapper = document.createElement('div');
                wrapper.className = 'fd-diagram-box fd-compact';
                
                const content = document.createElement('div');
                content.className = 'fd-diagram-content';
                
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = sanitizedCode;
                
                content.appendChild(mermaidDiv);
                wrapper.appendChild(content);
                
                block.parentElement.replaceWith(wrapper);
            }
            
            await this.render(messageElement);
        },
        
        /**
         * Get configuration (for debugging)
         */
        getConfig: function() {
            return { ...MERMAID_CONFIG };
        },
        
        /**
         * Detect diagram type from code
         */
        detectType: function(code) {
            const firstLine = code.trim().split('\n')[0].toLowerCase();
            
            if (firstLine.includes('flowchart') || firstLine.includes('graph')) return 'flowchart';
            if (firstLine.includes('sequencediagram') || firstLine.includes('sequence')) return 'sequence';
            if (firstLine.includes('statediagram') || firstLine.includes('state')) return 'state';
            if (firstLine.includes('erdiagram') || firstLine.includes('er')) return 'er';
            if (firstLine.includes('classdiagram') || firstLine.includes('class')) return 'class';
            if (firstLine.includes('gantt')) return 'gantt';
            if (firstLine.includes('pie')) return 'pie';
            if (firstLine.includes('journey')) return 'journey';
            if (firstLine.includes('gitgraph') || firstLine.includes('git')) return 'git';
            if (firstLine.includes('mindmap')) return 'mindmap';
            if (firstLine.includes('timeline')) return 'timeline';
            
            return 'unknown';
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO-INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                FixAIRDiagrams.init();
            }, 100);
        });
    } else {
        setTimeout(function() {
            FixAIRDiagrams.init();
        }, 100);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // EXPORT TO GLOBAL SCOPE
    // ─────────────────────────────────────────────────────────────────────────────
    window.FixAIRDiagrams = FixAIRDiagrams;
    window.FIXAIR_MERMAID_CONFIG = MERMAID_CONFIG;
    
    console.log('[FixAIR Diagrams] Module loaded ✓');

})();
