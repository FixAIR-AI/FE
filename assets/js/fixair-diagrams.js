/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION & UTILITIES
 * Version: 2.0.0
 * 
 * This file initializes Mermaid with FixAIR premium styling and provides
 * utility functions for rendering diagrams in chat responses.
 * 
 * USAGE:
 * 1. Include Mermaid CDN BEFORE this file:
 *    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
 * 
 * 2. Include this file:
 *    <script src="fixair-diagrams.js"></script>
 * 
 * 3. Mermaid will auto-initialize on page load
 * 
 * 4. For dynamic content, call: FixAIRDiagrams.render(element)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // MERMAID CONFIGURATION - Premium FixAIR Theme
    // ─────────────────────────────────────────────────────────────────────────────
    const MERMAID_CONFIG = {
        startOnLoad: true,
        theme: 'base',
        securityLevel: 'loose',
        
        themeVariables: {
            // Backgrounds - TRANSPARENT
            background: 'transparent',
            mainBkg: 'transparent',
            
            // Nodes
            primaryColor: '#18181b',
            primaryTextColor: '#fafafa',
            primaryBorderColor: 'rgba(255, 255, 255, 0.1)',
            
            secondaryColor: '#18181b',
            secondaryTextColor: '#fafafa',
            
            tertiaryColor: '#1f1f23',
            tertiaryTextColor: '#71717a',
            
            // Clusters
            clusterBkg: 'rgba(255, 255, 255, 0.02)',
            clusterBorder: 'rgba(255, 255, 255, 0.05)',
            
            // Lines
            lineColor: '#3f3f46',
            
            // Edge labels - TRANSPARENT for state diagrams
            edgeLabelBackground: 'transparent',
            
            // Notes
            noteBkgColor: '#18181b',
            noteBorderColor: 'rgba(255, 255, 255, 0.08)',
            noteTextColor: '#a1a1aa',
            
            // Actors (sequence diagrams)
            actorBkg: '#18181b',
            actorBorder: 'rgba(255, 255, 255, 0.12)',
            actorTextColor: '#fafafa',
            actorLineColor: '#27272a',
            
            // Signals
            signalColor: '#52525b',
            signalTextColor: '#e4e4e7',
            
            // State diagram
            labelBoxBkgColor: 'transparent',
            labelBoxBorderColor: 'transparent',
            labelTextColor: '#71717a',
            
            // Grid (Gantt)
            gridColor: '#1f1f23',
            
            // Font
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '16px'
        },
        
        // Flowchart settings
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 80,
            rankSpacing: 80,
            padding: 30,
            diagramPadding: 20
        },
        
        // Sequence diagram settings - EXTRA LARGE
        sequence: {
            useMaxWidth: true,
            diagramMarginX: 80,
            diagramMarginY: 50,
            actorMargin: 120,
            width: 280,
            height: 80,
            messageMargin: 80,
            boxMargin: 40,
            boxTextMargin: 15,
            noteMargin: 30,
            mirrorActors: false,
            showSequenceNumbers: true,
            actorFontSize: 18,
            messageFontSize: 16,
            noteFontSize: 15
        },
        
        // ER diagram settings
        er: {
            useMaxWidth: true,
            layoutDirection: 'TB',
            minEntityWidth: 180,
            minEntityHeight: 100,
            entityPadding: 30,
            fontSize: 14
        },
        
        // State diagram settings
        state: {
            useMaxWidth: true,
            nodeSpacing: 80,
            rankSpacing: 80,
            labelBoxBkgColor: 'transparent',
            labelBoxBorderColor: 'transparent'
        },
        
        // Gantt chart settings
        gantt: {
            useMaxWidth: true,
            barHeight: 40,
            barGap: 10,
            topPadding: 80,
            leftPadding: 160,
            gridLineStartPadding: 50,
            fontSize: 14,
            sectionFontSize: 16,
            numberSectionStyles: 4
        },
        
        // Class diagram settings
        class: {
            useMaxWidth: true
        },
        
        // Pie chart settings
        pie: {
            useMaxWidth: true
        }
    };


    // ─────────────────────────────────────────────────────────────────────────────
    // FIXAIR DIAGRAMS NAMESPACE
    // ─────────────────────────────────────────────────────────────────────────────
    const FixAIRDiagrams = {
        
        /**
         * Initialize Mermaid with FixAIR configuration
         * Called automatically on load, but can be called manually if needed
         */
        init: function() {
            if (typeof mermaid === 'undefined') {
                console.error('[FixAIR Diagrams] Mermaid library not found. Please include Mermaid CDN before this script.');
                return false;
            }
            
            mermaid.initialize(MERMAID_CONFIG);
            console.log('[FixAIR Diagrams] Initialized with premium theme');
            return true;
        },
        
        /**
         * Re-render all mermaid diagrams in a container
         * Use this for dynamically added content (e.g., chat messages)
         * 
         * @param {HTMLElement|string} container - DOM element or selector
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
                await mermaid.run({
                    nodes: el.querySelectorAll('.mermaid:not([data-processed])')
                });
                console.log('[FixAIR Diagrams] Rendered diagrams in container');
            } catch (error) {
                console.error('[FixAIR Diagrams] Render error:', error);
            }
        },
        
        /**
         * Render a single mermaid diagram from code
         * 
         * @param {string} code - Mermaid diagram code
         * @param {HTMLElement} container - Target container element
         * @param {string} id - Optional unique ID for the diagram
         * @returns {Promise<string>} - Rendered SVG string
         */
        renderCode: async function(code, container, id) {
            const diagramId = id || 'fd-diagram-' + Date.now();
            
            try {
                const { svg } = await mermaid.render(diagramId, code);
                
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
         * Parse AI response and extract mermaid code blocks
         * 
         * @param {string} content - AI response content
         * @returns {Array} - Array of {type: 'mermaid', code: '...'} objects
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
         * Process a chat message and render any mermaid diagrams
         * Replaces mermaid code blocks with rendered diagrams
         * 
         * @param {HTMLElement} messageElement - Chat message element
         */
        processMessage: async function(messageElement) {
            const mermaidBlocks = messageElement.querySelectorAll('pre code.language-mermaid, .mermaid-code');
            
            for (const block of mermaidBlocks) {
                const code = block.textContent;
                const wrapper = document.createElement('div');
                wrapper.className = 'fd-diagram-box fd-compact';
                
                const content = document.createElement('div');
                content.className = 'fd-diagram-content';
                
                const mermaidDiv = document.createElement('div');
                mermaidDiv.className = 'mermaid';
                mermaidDiv.textContent = code;
                
                content.appendChild(mermaidDiv);
                wrapper.appendChild(content);
                
                // Replace the code block with diagram
                block.parentElement.replaceWith(wrapper);
            }
            
            // Render any new mermaid elements
            await this.render(messageElement);
        },
        
        /**
         * Create a diagram container with label
         * 
         * @param {string} label - Diagram label text
         * @param {string} size - Size variant: 'compact', 'normal', 'large'
         * @returns {HTMLElement} - Container element with label
         */
        createContainer: function(label, size = 'normal') {
            const box = document.createElement('div');
            box.className = 'fd-diagram-box';
            
            if (size === 'compact') {
                box.classList.add('fd-compact');
            } else if (size === 'large') {
                box.classList.add('fd-extra-large');
            }
            
            if (label) {
                const labelEl = document.createElement('div');
                labelEl.className = 'fd-diagram-label';
                labelEl.textContent = label;
                box.appendChild(labelEl);
            }
            
            const content = document.createElement('div');
            content.className = 'fd-diagram-content';
            box.appendChild(content);
            
            return box;
        },
        
        /**
         * Detect diagram type from mermaid code
         * 
         * @param {string} code - Mermaid diagram code
         * @returns {string} - Diagram type
         */
        detectType: function(code) {
            const firstLine = code.trim().split('\n')[0].toLowerCase();
            
            if (firstLine.includes('flowchart') || firstLine.includes('graph')) {
                return 'flowchart';
            } else if (firstLine.includes('sequencediagram') || firstLine.includes('sequence')) {
                return 'sequence';
            } else if (firstLine.includes('erdiagram') || firstLine.includes('er')) {
                return 'erd';
            } else if (firstLine.includes('statediagram') || firstLine.includes('state')) {
                return 'state';
            } else if (firstLine.includes('classdiagram') || firstLine.includes('class')) {
                return 'class';
            } else if (firstLine.includes('gantt')) {
                return 'gantt';
            } else if (firstLine.includes('pie')) {
                return 'pie';
            } else if (firstLine.includes('journey')) {
                return 'journey';
            }
            
            return 'unknown';
        },
        
        /**
         * Sanitize mermaid code to handle special characters
         * 
         * @param {string} code - Raw mermaid code
         * @returns {string} - Sanitized code
         */
        sanitize: function(code) {
            // Replace problematic characters in labels
            return code
                .replace(/"/g, "'")  // Replace double quotes with single
                .replace(/[<>]/g, '') // Remove angle brackets
                .replace(/&/g, 'and'); // Replace ampersands
        },
        
        /**
         * Get configuration object (for debugging or modification)
         */
        getConfig: function() {
            return { ...MERMAID_CONFIG };
        }
    };


    // ─────────────────────────────────────────────────────────────────────────────
    // DIAGRAM TEMPLATES - Pre-built for common HVAC scenarios
    // ─────────────────────────────────────────────────────────────────────────────
    FixAIRDiagrams.templates = {
        
        // Diagnostic flowchart template
        diagnostic: (errorCode, steps) => `
flowchart TB
    START[🔴 Error ${errorCode}]
    ${steps.map((s, i) => `C${i}[${s.check}]`).join('\n    ')}
    ${steps.map((s, i) => `F${i}[🔧 ${s.fix}]`).join('\n    ')}
    RETEST[🔄 Retest]
    OK[✅ Resolved]
    
    START --> C0
    ${steps.map((s, i) => i < steps.length - 1 
        ? `C${i} -->|OK| C${i+1}\n    C${i} -->|Fail| F${i}` 
        : `C${i} -->|OK| OK\n    C${i} -->|Fail| F${i}`
    ).join('\n    ')}
    ${steps.map((s, i) => `F${i} --> RETEST`).join('\n    ')}
        `.trim(),
        
        // VRF wiring template
        vrfWiring: (units) => `
graph LR
    subgraph OUT[" OUTDOOR "]
        OC[Control Board]
    end
    
    ${units.map((u, i) => `
    subgraph U${i}[" ${u.name} "]
        I${i}[${u.model || 'Indoor Unit'}]
    end`).join('')}
    
    OC --- J1[ ]
    ${units.map((u, i) => `J1 --- I${i}`).join('\n    ')}
        `.trim(),
        
        // Sequence diagram template
        apiFlow: (steps) => `
sequenceDiagram
    autonumber
    ${steps.map(s => `${s.from}->>+${s.to}: ${s.action}`).join('\n    ')}
        `.trim()
    };


    // ─────────────────────────────────────────────────────────────────────────────
    // AUTO-INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────
    
    // Wait for DOM and Mermaid to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Small delay to ensure Mermaid is loaded
            setTimeout(function() {
                FixAIRDiagrams.init();
            }, 100);
        });
    } else {
        // DOM already loaded
        setTimeout(function() {
            FixAIRDiagrams.init();
        }, 100);
    }
    
    
    // ─────────────────────────────────────────────────────────────────────────────
    // EXPORT TO GLOBAL SCOPE
    // ─────────────────────────────────────────────────────────────────────────────
    window.FixAIRDiagrams = FixAIRDiagrams;
    
    // Also export config for direct mermaid access if needed
    window.FIXAIR_MERMAID_CONFIG = MERMAID_CONFIG;
    
    console.log('[FixAIR Diagrams] Module loaded');

})();
