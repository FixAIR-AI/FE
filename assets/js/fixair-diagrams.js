/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * FIXAIR DIAGRAM SYSTEM - MERMAID CONFIGURATION
 * Version: 2.2.0
 * 
 * This file initializes Mermaid with FixAIR premium styling.
 * Since Mermaid's CSS selectors don't always match the generated DOM,
 * we use post-processing to ensure consistent styling.
 * 
 * USAGE:
 * 1. Include Mermaid CDN BEFORE this file
 * 2. Include this file
 * 3. Call FixAIRDiagrams.render(element) to render diagrams
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // STYLE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    const STYLES = {
        // Node (rectangles, diamonds, etc.)
        node: {
            fill: '#18181b',
            stroke: 'rgba(255, 255, 255, 0.12)',
            strokeWidth: '1px',
            rx: '12',
            ry: '12',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
        },
        
        // Diamond shapes (decisions)
        diamond: {
            fill: '#18181b',
            stroke: 'rgba(255, 255, 255, 0.15)',
            strokeWidth: '1px',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
        },
        
        // Text labels
        text: {
            fill: '#fafafa',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            fontSize: '14px'
        },
        
        // Edge text (labels on arrows)
        edgeLabel: {
            fill: '#a1a1aa',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '500',
            fontSize: '12px'
        },
        
        // Edge label background
        edgeLabelBg: {
            fill: 'transparent'
        },
        
        // Lines/Arrows
        edge: {
            stroke: '#52525b',
            strokeWidth: '2px'
        },
        
        // Arrowheads
        arrowhead: {
            fill: '#52525b',
            stroke: '#52525b'
        },
        
        // Clusters/Subgraphs
        cluster: {
            fill: 'rgba(255, 255, 255, 0.02)',
            stroke: 'rgba(255, 255, 255, 0.06)',
            strokeWidth: '1px',
            rx: '16',
            ry: '16'
        },
        
        // Cluster titles
        clusterLabel: {
            fill: '#71717a',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // MERMAID INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    function initMermaid() {
        if (typeof mermaid === 'undefined') {
            console.warn('[FixAIR Diagrams] Mermaid not loaded yet');
            return false;
        }

        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            securityLevel: 'loose',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            
            // Theme variables (Mermaid uses these to generate inline styles)
            themeVariables: {
                // Primary colors
                primaryColor: '#18181b',
                primaryTextColor: '#fafafa',
                primaryBorderColor: 'rgba(255, 255, 255, 0.12)',
                
                // Secondary/tertiary
                secondaryColor: '#18181b',
                secondaryTextColor: '#fafafa',
                secondaryBorderColor: 'rgba(255, 255, 255, 0.12)',
                tertiaryColor: '#1f1f23',
                tertiaryTextColor: '#fafafa',
                tertiaryBorderColor: 'rgba(255, 255, 255, 0.1)',
                
                // Lines
                lineColor: '#52525b',
                
                // Text
                textColor: '#fafafa',
                
                // Background
                mainBkg: '#18181b',
                nodeBkg: '#18181b',
                nodeBorder: 'rgba(255, 255, 255, 0.12)',
                
                // Clusters
                clusterBkg: 'rgba(255, 255, 255, 0.02)',
                clusterBorder: 'rgba(255, 255, 255, 0.06)',
                
                // Edge labels
                edgeLabelBackground: 'transparent',
                
                // Font
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px'
            },
            
            // Flowchart specific settings
            flowchart: {
                htmlLabels: true,
                useMaxWidth: true,
                curve: 'basis',
                padding: 20,
                nodeSpacing: 50,
                rankSpacing: 60,
                diagramPadding: 20
            }
        });

        console.log('[FixAIR Diagrams] Mermaid initialized v2.2.0');
        return true;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SANITIZATION - Fix special characters that break Mermaid
    // ═══════════════════════════════════════════════════════════════════════════
    
    function sanitize(code) {
        if (!code) return code;
        
        // Helper: check if content needs quotes
        function needsQuotes(content) {
            return /[àâäéèêëïîôùûüç()\/\-:',.]/.test(content);
        }
        
        // Helper: add quotes if not already quoted
        function addQuotes(content) {
            content = content.trim();
            if ((content.startsWith('"') && content.endsWith('"')) ||
                (content.startsWith("'") && content.endsWith("'"))) {
                return content;
            }
            // Escape internal quotes
            content = content.replace(/"/g, "'");
            return '"' + content + '"';
        }
        
        // Fix subgraph names with accents: subgraph Name → subgraph Name["Name"]
        code = code.replace(/^(\s*subgraph\s+)([^\["\n]+)$/gm, (match, prefix, name) => {
            name = name.trim();
            if (name.includes('[')) return match;
            if (needsQuotes(name)) {
                // Create safe ID and display name
                const safeId = name.replace(/[^a-zA-Z0-9]/g, '_');
                return prefix + safeId + '[' + addQuotes(name) + ']';
            }
            return match;
        });
        
        // Fix node labels with special chars: A[Label (text)] → A["Label (text)"]
        code = code.replace(/\[([^\]"]+)\]/g, (match, content) => {
            if (content.startsWith('"') || content.startsWith("'")) {
                return match;
            }
            if (needsQuotes(content)) {
                return '[' + addQuotes(content) + ']';
            }
            return match;
        });
        
        // Fix diamond labels: {Label} → {"Label"} if has special chars
        code = code.replace(/\{([^}"]+)\}/g, (match, content) => {
            if (content.startsWith('"') || content.startsWith("'")) {
                return match;
            }
            if (needsQuotes(content)) {
                return '{' + addQuotes(content) + '}';
            }
            return match;
        });
        
        // Fix edge labels: |text| → |"text"| if has special chars
        code = code.replace(/\|([^|"]+)\|/g, (match, content) => {
            if (content.startsWith('"') || content.startsWith("'")) {
                return match;
            }
            if (needsQuotes(content)) {
                return '|' + addQuotes(content) + '|';
            }
            return match;
        });
        
        // Clean up any double quotes that might have been created
        code = code.replace(/""/g, '"');
        
        // Remove style/classDef commands (we handle styling via post-processing)
        code = code.replace(/^\s*style\s+\w+\s+.+$/gm, '');
        code = code.replace(/^\s*classDef\s+.+$/gm, '');
        code = code.replace(/^\s*class\s+.+$/gm, '');
        
        return code;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // POST-PROCESSING - Apply FixAIR styling after Mermaid renders
    // ═══════════════════════════════════════════════════════════════════════════
    
    function applyStyles(container) {
        if (!container) return;
        
        const svg = container.querySelector('svg');
        if (!svg) return;
        
        // ─────────────────────────────────────────────────────────────────────
        // Style all rectangles (nodes)
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('rect').forEach(rect => {
            // Skip edge label backgrounds (they're small rects)
            const isEdgeLabel = rect.closest('.edgeLabel') || 
                               rect.classList.contains('labelBox') ||
                               (rect.getAttribute('width') && parseFloat(rect.getAttribute('width')) < 30);
            
            // Check if it's a cluster/subgraph rect
            const isCluster = rect.closest('.cluster') || rect.classList.contains('cluster');
            
            if (isCluster) {
                // Cluster styling
                rect.style.fill = STYLES.cluster.fill;
                rect.style.stroke = STYLES.cluster.stroke;
                rect.style.strokeWidth = STYLES.cluster.strokeWidth;
                rect.setAttribute('rx', STYLES.cluster.rx);
                rect.setAttribute('ry', STYLES.cluster.ry);
            } else if (isEdgeLabel) {
                // Edge label background
                rect.style.fill = STYLES.edgeLabelBg.fill;
                rect.style.stroke = 'none';
            } else {
                // Regular node
                rect.style.fill = STYLES.node.fill;
                rect.style.stroke = STYLES.node.stroke;
                rect.style.strokeWidth = STYLES.node.strokeWidth;
                rect.style.filter = STYLES.node.filter;
                rect.setAttribute('rx', STYLES.node.rx);
                rect.setAttribute('ry', STYLES.node.ry);
            }
        });
        
        // ─────────────────────────────────────────────────────────────────────
        // Style diamonds (decision nodes) - polygons
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('polygon').forEach(polygon => {
            polygon.style.fill = STYLES.diamond.fill;
            polygon.style.stroke = STYLES.diamond.stroke;
            polygon.style.strokeWidth = STYLES.diamond.strokeWidth;
            polygon.style.filter = STYLES.diamond.filter;
        });
        
        // ─────────────────────────────────────────────────────────────────────
        // Style text labels
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('.nodeLabel, .label text, text.nodeLabel').forEach(text => {
            text.style.fill = STYLES.text.fill;
            text.style.fontFamily = STYLES.text.fontFamily;
            text.style.fontWeight = STYLES.text.fontWeight;
            text.style.fontSize = STYLES.text.fontSize;
        });
        
        // Also catch text elements directly
        container.querySelectorAll('text').forEach(text => {
            // Skip if already styled or if it's an edge label
            if (text.closest('.edgeLabel') || text.closest('.edgeLabels')) {
                text.style.fill = STYLES.edgeLabel.fill;
                text.style.fontFamily = STYLES.edgeLabel.fontFamily;
                text.style.fontWeight = STYLES.edgeLabel.fontWeight;
                text.style.fontSize = STYLES.edgeLabel.fontSize;
            } else if (text.closest('.cluster')) {
                text.style.fill = STYLES.clusterLabel.fill;
                text.style.fontFamily = STYLES.clusterLabel.fontFamily;
                text.style.fontWeight = STYLES.clusterLabel.fontWeight;
                text.style.fontSize = STYLES.clusterLabel.fontSize;
            } else {
                // Regular node text
                if (!text.style.fill || text.style.fill === 'rgb(0, 0, 0)' || text.style.fill === 'black') {
                    text.style.fill = STYLES.text.fill;
                }
                text.style.fontFamily = STYLES.text.fontFamily;
            }
        });
        
        // Style foreignObject content (HTML labels)
        container.querySelectorAll('foreignObject .nodeLabel, foreignObject .label').forEach(label => {
            label.style.color = STYLES.text.fill;
            label.style.fontFamily = STYLES.text.fontFamily;
            label.style.fontWeight = STYLES.text.fontWeight;
            label.style.fontSize = STYLES.text.fontSize;
        });
        
        // ─────────────────────────────────────────────────────────────────────
        // Style edges (lines/arrows)
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('.edgePath path, path.path').forEach(path => {
            path.style.stroke = STYLES.edge.stroke;
            path.style.strokeWidth = STYLES.edge.strokeWidth;
        });
        
        // ─────────────────────────────────────────────────────────────────────
        // Style arrowheads
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('marker path, .arrowheadPath').forEach(arrow => {
            arrow.style.fill = STYLES.arrowhead.fill;
            arrow.style.stroke = STYLES.arrowhead.stroke;
        });
        
        // Also check defs for markers
        container.querySelectorAll('defs marker path').forEach(path => {
            path.setAttribute('fill', STYLES.arrowhead.fill);
            path.setAttribute('stroke', STYLES.arrowhead.stroke);
        });
        
        // ─────────────────────────────────────────────────────────────────────
        // Style edge labels
        // ─────────────────────────────────────────────────────────────────────
        container.querySelectorAll('.edgeLabel .label, .edgeLabel span').forEach(label => {
            label.style.color = STYLES.edgeLabel.fill;
            label.style.fill = STYLES.edgeLabel.fill;
            label.style.fontFamily = STYLES.edgeLabel.fontFamily;
            label.style.fontWeight = STYLES.edgeLabel.fontWeight;
            label.style.fontSize = STYLES.edgeLabel.fontSize;
            label.style.background = 'transparent';
        });
        
        console.log('[FixAIR Diagrams] Styles applied');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MAIN RENDER FUNCTION
    // ═══════════════════════════════════════════════════════════════════════════
    
    async function render(placeholder, code) {
        if (!placeholder) {
            console.error('[FixAIR Diagrams] No placeholder element provided');
            return false;
        }
        
        if (!code) {
            // Try to get code from placeholder's data attribute or text content
            code = placeholder.getAttribute('data-mermaid') || placeholder.textContent;
        }
        
        if (!code || !code.trim()) {
            console.error('[FixAIR Diagrams] No mermaid code provided');
            return false;
        }
        
        // Ensure Mermaid is initialized
        if (typeof mermaid === 'undefined') {
            console.error('[FixAIR Diagrams] Mermaid library not loaded');
            return false;
        }
        
        // Sanitize the code
        const sanitizedCode = sanitize(code);
        console.log('[FixAIR Diagrams] Rendering:', sanitizedCode.substring(0, 100) + '...');
        
        try {
            // Generate unique ID
            const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Render with Mermaid
            const { svg } = await mermaid.render(id, sanitizedCode);
            
            // Insert SVG
            placeholder.innerHTML = svg;
            
            // Apply FixAIR styling
            applyStyles(placeholder);
            
            // Mark as rendered
            placeholder.classList.add('mermaid-rendered');
            
            console.log('[FixAIR Diagrams] Render complete');
            return true;
            
        } catch (error) {
            console.error('[FixAIR Diagrams] Render error:', error);
            console.error('[FixAIR Diagrams] Code that failed:', sanitizedCode);
            
            // Show error in placeholder
            placeholder.innerHTML = `
                <div class="mermaid-error" style="
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid rgba(220, 38, 38, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    color: #fca5a5;
                    font-family: Inter, sans-serif;
                ">
                    <div style="font-weight: 600; margin-bottom: 8px;">⚠️ Diagram Error</div>
                    <pre style="
                        font-size: 12px;
                        overflow-x: auto;
                        background: rgba(0,0,0,0.2);
                        padding: 12px;
                        border-radius: 8px;
                        margin: 0;
                    "><code>${sanitizedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>
            `;
            
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // AUTO-RENDER ALL PLACEHOLDERS
    // ═══════════════════════════════════════════════════════════════════════════
    
    async function renderAll() {
        const placeholders = document.querySelectorAll('.mermaid-placeholder:not(.mermaid-rendered), .mermaid:not(.mermaid-rendered)');
        
        console.log(`[FixAIR Diagrams] Found ${placeholders.length} diagrams to render`);
        
        for (const placeholder of placeholders) {
            await render(placeholder);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RE-STYLE EXISTING DIAGRAMS (for diagrams already rendered)
    // ═══════════════════════════════════════════════════════════════════════════
    
    function restyleAll() {
        const rendered = document.querySelectorAll('.mermaid-rendered, .mermaid-placeholder');
        
        console.log(`[FixAIR Diagrams] Restyling ${rendered.length} diagrams`);
        
        rendered.forEach(container => {
            applyStyles(container);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZE
    // ═══════════════════════════════════════════════════════════════════════════
    
    // Initialize Mermaid when this script loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMermaid);
    } else {
        initMermaid();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════
    
    window.FixAIRDiagrams = {
        version: '2.2.0',
        init: initMermaid,
        render: render,
        renderAll: renderAll,
        sanitize: sanitize,
        applyStyles: applyStyles,
        restyleAll: restyleAll,
        STYLES: STYLES  // Expose for customization
    };

    console.log('[FixAIR Diagrams] Module loaded v2.2.0');

})();
