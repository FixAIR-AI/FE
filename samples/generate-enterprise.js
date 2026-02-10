const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType, 
        TableLayoutType, VerticalAlign, PageBreak, Header, Footer,
        PageNumber, NumberFormat } = require('docx');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════
// ENTERPRISE CONFIG - EQWATTEUR
// ═══════════════════════════════════════════════════════════════
const ENTERPRISE = {
    name: 'EQWATTEUR',
    address: '123 Rue de l\'Énergie, 94140 Alfortville',
    colors: {
        primary: '1B4D4D',      // Dark teal
        secondary: '2D6A6A',
        accent: '3D8A8A',
        light: 'E8F4F4'
    },
    // Placeholder logo - replace with actual EQWATTEUR logo
    logo: null  // Will use text placeholder if null
};

// Sample signature
const SAMPLE_SIG = 'iVBORw0KGgoAAAANSUhEUgAAAJYAAAA8CAYAAACEhkNqAAAACXBIWXMAAAsTAAALEwEAmpwYAAABqElEQVR4nO3csW3CQBSG4f+OhIyQDTJCRsgIGSEjZISMkBFogIaGhoaGJk1KGhoaGhqaNC5S0NAkTYoUKVKkSJEiRTJFip5wZPt8d+97JWTZlu1P5/N5fwchJIRwB+C49YZMxBbAI4C71hsy4i2ASwA9gNPWGzLiEcAlgK71hoywAfAEwLbekBE9gAsAHYBz6w0Z8QTgHMCx9YaMeAJwCuCo9YaMuAdwAOCg9YaMeARwAGC/9YaMuAOwB2C39YaMuAGwA2Cn9YaM6AHsANhuvSEjbgFsA9hqvSEjOgBbADZbb8iIGwCbADZab8iIawDrANZab8iIKwBrAFZbb8iISwArAJZbb8iIDsAygKXWGzLiAsASgMXWGzLiHMACgIV/eqM1AC2AVsPm7wCaAE0b4akkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZL+N58BfGm9IUkf+AHw4HrBewZ4vwAAAABJRU5ErkJggg==';

// Sample site photo placeholder (gray box)
const SITE_PHOTO_PLACEHOLDER = 'iVBORw0KGgoAAAANSUhEUgAAAZAAAADICAYAAADGFbfiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAECklEQVR4nO3VsQ3AIBDAQNj/aFiAESjO5YKS+wDLlmzLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ3vvfQAALmYNAMAXAgIAiIAAACIgAICICAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAD+5w8QAGCSNQAAXwgIACACAgCIgAAAIiIAgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAD+bw0AwBcCAgCIgAAAIiIAgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgD4vzUAAF8ICAAg3vuuAQC4mDUAAF8ICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAfQAALrYGAOALAQEAREAAABERAEBEBAARd/cRAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgA4P/WAAB8ISAAgAgIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIA+L81AABfCAgAIN77rgEAuJg1AABfCAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH0AAC62BgDgCwEBAERAAADRewUA7m4NAMAXAgIAiIAAACIiAICICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIA+L81AABfCAgAIAICAIiIACAiAoCICAAiIgCIiAAgIgKAiAgAIiIAiIgAICICgIgIACIiAIiIACAiAoCICAAiIgCIiAAgIgKAiAgA/m8NAMAXAgIAiPe+awAALmYNAMAXAgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4CdfZhPBwwJZ0AAAAABJRU5ErkJggg==';

const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' };
const noBorder = { style: BorderStyle.NONE };
const tealBorder = { style: BorderStyle.SINGLE, size: 1, color: ENTERPRISE.colors.primary };

function base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

function sectionHeading(text, color = ENTERPRISE.colors.primary) {
    return new Paragraph({
        children: [
            new TextRun({ text: '█ ', color, size: 24 }),
            new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Calibri', color: '1F2937' })
        ],
        spacing: { before: 400, after: 150 }
    });
}

function infoBox(leftItems, rightItems, color = ENTERPRISE.colors.primary) {
    const boxBorder = { style: BorderStyle.SINGLE, size: 1, color: ENTERPRISE.colors.light };
    
    const leftContent = leftItems.filter(Boolean).map(item => 
        new Paragraph({
            children: [
                new TextRun({ text: item.label + ': ', bold: true, size: 18, font: 'Calibri', color: '6B7280' }),
                new TextRun({ text: String(item.value || '—'), size: 18, font: 'Calibri' })
            ],
            spacing: { after: 60 }
        })
    );
    
    const rightContent = rightItems.filter(Boolean).map(item =>
        new Paragraph({
            children: [
                new TextRun({ text: item.label + ': ', bold: true, size: 18, font: 'Calibri', color: '6B7280' }),
                new TextRun({ text: String(item.value || '—'), size: 18, font: 'Calibri' })
            ],
            spacing: { after: 60 }
        })
    );
    
    return new Table({
        rows: [new TableRow({
            children: [
                new TableCell({
                    children: leftContent.length ? leftContent : [new Paragraph({})],
                    borders: { top: boxBorder, bottom: boxBorder, left: boxBorder, right: boxBorder },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: rightContent.length ? rightContent : [new Paragraph({})],
                    borders: { top: boxBorder, bottom: boxBorder, left: boxBorder, right: boxBorder },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                })
            ]
        })],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

function createTable(headers, rows) {
    const headerRow = new TableRow({
        children: headers.map(h => new TableCell({
            children: [new Paragraph({ 
                children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: 'FFFFFF' })]
            })],
            shading: { fill: ENTERPRISE.colors.primary, type: ShadingType.CLEAR },
            borders: { top: tealBorder, bottom: tealBorder, left: tealBorder, right: tealBorder },
            margins: { top: 80, bottom: 80, left: 120, right: 120 }
        })),
        tableHeader: true
    });
    
    const dataRows = rows.map((row, idx) => new TableRow({
        children: row.map(cell => new TableCell({
            children: [new Paragraph({ 
                children: [new TextRun({ text: String(cell || '—'), size: 18, font: 'Calibri' })]
            })],
            borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            shading: idx % 2 === 1 ? { fill: ENTERPRISE.colors.light, type: ShadingType.CLEAR } : undefined
        }))
    }));
    
    return new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED
    });
}

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA
// ═══════════════════════════════════════════════════════════════
const data = {
    site: {
        name: 'Résidence Berthier',
        address: '45 Avenue de la République',
        city: '94140 Alfortville',
        numero_affaire: 'AFF-2026-0089'
    },
    client: {
        societe: 'EQWATTEUR SAS',
        contact: 'Badra Cisse',
        telephone: '07 49 33 21 08',
        reference: 'CLI-EQW-001'
    },
    technicien: {
        nom: 'Mohamed AHMED',
        entreprise: 'EQWATTEUR SAS',
        heure_arrivee: '09:30',
        heure_depart: '14:45'
    },
    reference: 'FX-2026-00142',
    date: '07/02/2026',
    type_intervention: 'SAV / Dépannage',
    status: 'conforme',
    brand: 'Carrier',
    
    resume: "Intervention suite à défaut de communication sur unité extérieure VRF. Diagnostic réalisé, câble bus défectueux identifié et remplacé. Système remis en service avec succès. Toutes les unités intérieures communiquent correctement.",
    
    dates: {
        debut_date: '07/02/2026', debut_heure: '09:30',
        fin_date: '07/02/2026', fin_heure: '14:45'
    },
    
    systeme: {
        type: 'VRF', modele: '38AH-024', serie: 'CR26A00142',
        puissance: '24', garantie: 'Sous garantie'
    },
    fluide: { type: 'R410A', charge_initiale: '8.5', charge_totale: '8.5', type_huile: 'POE' },
    
    codes_defaut: [
        { code: '7100', description: 'Défaut communication bus entre UE et UI', resolution: 'Câble bus remplacé' },
        { code: '7102', description: 'Timeout communication UI-03', resolution: 'Adressage vérifié et corrigé' }
    ],
    
    mesures: [
        { label: 'Haute Pression', valeur: '28.5', unite: 'bar' },
        { label: 'Basse Pression', valeur: '10.2', unite: 'bar' },
        { label: 'Surchauffe', valeur: '7', unite: '°C' },
        { label: 'Sous-refroidissement', valeur: '5', unite: '°C' }
    ],
    
    travaux_effectues: [
        { texte: 'Diagnostic complet du système VRF', status: 'done' },
        { texte: 'Vérification du câblage bus de communication', status: 'done' },
        { texte: 'Remplacement câble bus défectueux (15m)', status: 'done' },
        { texte: 'Reprogrammation adresses unités intérieures', status: 'done' },
        { texte: 'Test de fonctionnement toutes UI', status: 'done' },
        { texte: 'Relevé des pressions et températures', status: 'done' }
    ],
    
    travaux_prevoir: [
        { texte: 'Maintenance préventive recommandée dans 6 mois', priorite: 'normal' },
        { texte: 'Vérifier état des filtres UI bureau direction', priorite: 'optionnel' }
    ],
    
    pieces: [
        { reference: 'CBL-BUS-15M', designation: 'Câble bus communication 2 paires blindé', quantite: '1' },
        { reference: 'CON-RJ45-2P', designation: 'Connecteurs RJ45 blindés', quantite: '4' }
    ],
    
    rapport_technicien: "À mon arrivée, le système affichait un défaut de communication généralisé. Après diagnostic approfondi, j'ai identifié un câble bus endommagé (probable passage de rongeur dans le faux-plafond). Le câble a été remplacé sur toute sa longueur entre le coffret de brassage et l'unité extérieure. Toutes les unités intérieures ont été ré-adressées et testées individuellement. Le système fonctionne maintenant parfaitement.",
    
    reserves: [{ type: 'warning', titre: 'Passage câbles', texte: 'Recommandation de protéger les passages de câbles dans le faux-plafond (gaines anti-rongeurs)' }],
    
    resultat: { status: 'resolu', description: 'Système remis en service. Communication rétablie entre toutes les unités. Client satisfait.' },
    
    signatures: { client: SAMPLE_SIG, nom_client: 'Badra Cisse', technicien: SAMPLE_SIG, nom_technicien: 'Mohamed AHMED' }
};

async function generateEnterprise() {
    // ═══ COVER PAGE ═══
    const coverPage = [
        // Logo placeholder (centered, large)
        new Paragraph({
            children: [new TextRun({ text: ENTERPRISE.name, bold: true, size: 72, font: 'Calibri', color: ENTERPRISE.colors.primary })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 400 }
        }),
        
        // Decorative line
        new Paragraph({
            children: [new TextRun({ text: '━'.repeat(30), color: ENTERPRISE.colors.primary })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
        }),
        
        // Site photo placeholder
        new Paragraph({
            children: [new ImageRun({ data: base64ToBuffer(SITE_PHOTO_PLACEHOLDER), transformation: { width: 400, height: 200 } })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({
            children: [new TextRun({ text: '[Photo du site]', size: 18, font: 'Calibri', color: '9CA3AF', italics: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
        
        // Site info
        new Paragraph({
            children: [new TextRun({ text: data.site.name, bold: true, size: 48, font: 'Calibri', color: '1F2937' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `${data.site.address}, ${data.site.city}`, size: 24, font: 'Calibri', color: '6B7280' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }),
        
        // Report title
        new Paragraph({
            children: [new TextRun({ text: "RAPPORT D'INTERVENTION", bold: true, size: 36, font: 'Calibri', color: ENTERPRISE.colors.primary })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
            children: [new TextRun({ text: `${data.type_intervention} — ${data.brand}`, size: 24, font: 'Calibri', color: '6B7280' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        
        // Reference & Date
        new Paragraph({
            children: [new TextRun({ text: `Réf: ${data.reference}`, size: 22, font: 'Calibri', color: '374151' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
        }),
        new Paragraph({
            children: [new TextRun({ text: data.date, size: 22, font: 'Calibri', color: '374151' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }),
        
        // Status badge
        new Paragraph({
            children: [new TextRun({ text: '  ✓ CONFORME  ', bold: true, size: 28, font: 'Calibri', color: '22C55E' })],
            alignment: AlignmentType.CENTER,
            shading: { fill: 'DCFCE7', type: ShadingType.CLEAR }
        }),
        
        // Page break
        new Paragraph({ children: [new PageBreak()] })
    ];
    
    // ═══ CONTENT PAGES ═══
    const content = [];
    
    // Résumé
    content.push(sectionHeading('Résumé'));
    content.push(new Paragraph({
        children: [new TextRun({ text: data.resume, size: 20, font: 'Calibri' })],
        spacing: { after: 200 },
        shading: { fill: ENTERPRISE.colors.light, type: ShadingType.CLEAR }
    }));
    
    // Site & Client
    content.push(sectionHeading('Site & Client'));
    content.push(infoBox(
        [
            { label: 'Site', value: data.site.name },
            { label: 'Adresse', value: data.site.address },
            { label: 'Ville', value: data.site.city },
            { label: 'N° Affaire', value: data.site.numero_affaire }
        ],
        [
            { label: 'Société', value: data.client.societe },
            { label: 'Contact', value: data.client.contact },
            { label: 'Téléphone', value: data.client.telephone },
            { label: 'Réf. Client', value: data.client.reference }
        ]
    ));
    
    // Dates
    content.push(sectionHeading('Dates Intervention'));
    content.push(infoBox(
        [{ label: 'Début', value: `${data.dates.debut_date} à ${data.dates.debut_heure}` }],
        [{ label: 'Fin', value: `${data.dates.fin_date} à ${data.dates.fin_heure}` }]
    ));
    
    // Équipement
    content.push(sectionHeading('Équipement'));
    content.push(infoBox(
        [
            { label: 'Type', value: data.systeme.type },
            { label: 'Modèle', value: data.systeme.modele },
            { label: 'N° Série', value: data.systeme.serie },
            { label: 'Puissance', value: data.systeme.puissance + ' kW' },
            { label: 'Garantie', value: data.systeme.garantie }
        ],
        [
            { label: 'Fluide', value: data.fluide.type },
            { label: 'Charge initiale', value: data.fluide.charge_initiale + ' kg' },
            { label: 'Charge totale', value: data.fluide.charge_totale + ' kg' },
            { label: 'Huile', value: data.fluide.type_huile }
        ]
    ));
    
    // Codes défaut
    content.push(sectionHeading('Codes Défaut'));
    content.push(createTable(
        ['Code', 'Description', 'Résolution'],
        data.codes_defaut.map(c => [c.code, c.description, c.resolution])
    ));
    
    // Mesures
    content.push(sectionHeading('Mesures'));
    content.push(createTable(
        ['Paramètre', 'Valeur', 'Observation'],
        data.mesures.map(m => [m.label, `${m.valeur} ${m.unite}`, ''])
    ));
    
    // Travaux effectués
    content.push(sectionHeading('Travaux Effectués'));
    data.travaux_effectues.forEach(t => {
        content.push(new Paragraph({
            children: [
                new TextRun({ text: '✓  ', color: '22C55E', size: 22, font: 'Calibri' }),
                new TextRun({ text: t.texte, size: 20, font: 'Calibri' })
            ],
            spacing: { after: 80 },
            indent: { left: 200 }
        }));
    });
    
    // Travaux à prévoir
    content.push(sectionHeading('Travaux à Prévoir'));
    data.travaux_prevoir.forEach(t => {
        const prioColors = { urgent: 'EF4444', normal: 'F59E0B', optionnel: '6B7280' };
        const prioLabels = { urgent: 'URGENT', normal: 'Normal', optionnel: 'Optionnel' };
        content.push(new Paragraph({
            children: [
                new TextRun({ text: '→  ', color: '6B7280', size: 20, font: 'Calibri' }),
                new TextRun({ text: t.texte, size: 20, font: 'Calibri' }),
                new TextRun({ text: `  [${prioLabels[t.priorite]}]`, size: 18, font: 'Calibri', color: prioColors[t.priorite] })
            ],
            spacing: { after: 80 },
            indent: { left: 200 }
        }));
    });
    
    // Pièces
    content.push(sectionHeading('Pièces Utilisées'));
    content.push(createTable(
        ['Référence', 'Désignation', 'Qté'],
        data.pieces.map(p => [p.reference, p.designation, p.quantite])
    ));
    
    // Rapport technicien
    content.push(sectionHeading('Rapport Technicien'));
    content.push(new Paragraph({
        children: [new TextRun({ text: data.rapport_technicien, size: 20, font: 'Calibri' })],
        spacing: { after: 200 }
    }));
    
    // Réserves
    content.push(sectionHeading('Réserves / Alertes'));
    data.reserves.forEach(r => {
        content.push(new Paragraph({
            children: [
                new TextRun({ text: '! ', size: 22, color: 'F59E0B', font: 'Calibri' }),
                new TextRun({ text: r.titre + ': ', bold: true, size: 20, font: 'Calibri', color: 'F59E0B' }),
                new TextRun({ text: r.texte, size: 20, font: 'Calibri' })
            ],
            spacing: { after: 100 },
            shading: { fill: 'FFFBEB', type: ShadingType.CLEAR }
        }));
    });
    
    // Résultat
    content.push(sectionHeading('Résultat'));
    content.push(new Paragraph({
        children: [new TextRun({ text: '✓ PROBLÈME RÉSOLU', bold: true, size: 26, font: 'Calibri', color: '22C55E' })],
        spacing: { after: 100 },
        shading: { fill: 'DCFCE7', type: ShadingType.CLEAR }
    }));
    content.push(new Paragraph({
        children: [new TextRun({ text: data.resultat.description, size: 20, font: 'Calibri' })],
        spacing: { after: 300 }
    }));
    
    // Signatures
    content.push(sectionHeading('Signatures'));
    content.push(new Table({
        rows: [new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({ children: [new TextRun({ text: 'Client', bold: true, size: 18, font: 'Calibri', color: '6B7280' })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new ImageRun({ data: base64ToBuffer(data.signatures.client), transformation: { width: 120, height: 40 } })], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }),
                        new Paragraph({ children: [new TextRun({ text: data.signatures.nom_client, size: 18, font: 'Calibri' })], alignment: AlignmentType.CENTER })
                    ],
                    borders: { top: tealBorder, bottom: tealBorder, left: tealBorder, right: tealBorder },
                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [
                        new Paragraph({ children: [new TextRun({ text: 'Technicien', bold: true, size: 18, font: 'Calibri', color: '6B7280' })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new ImageRun({ data: base64ToBuffer(data.signatures.technicien), transformation: { width: 120, height: 40 } })], alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 } }),
                        new Paragraph({ children: [new TextRun({ text: data.signatures.nom_technicien, size: 18, font: 'Calibri' })], alignment: AlignmentType.CENTER })
                    ],
                    borders: { top: tealBorder, bottom: tealBorder, left: tealBorder, right: tealBorder },
                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                })
            ]
        })],
        width: { size: 100, type: WidthType.PERCENTAGE }
    }));
    
    // ═══ CREATE DOCUMENT ═══
    const doc = new Document({
        sections: [
            // Cover page (no footer)
            {
                properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
                children: coverPage
            },
            // Content pages (with footer)
            {
                properties: { 
                    page: { margin: { top: 720, right: 720, bottom: 1000, left: 720 } }
                },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: ENTERPRISE.name, bold: true, size: 18, font: 'Calibri', color: ENTERPRISE.colors.primary }),
                                    new TextRun({ text: `  |  Réf: ${data.reference}  |  ${data.date}`, size: 16, font: 'Calibri', color: '9CA3AF' })
                                ],
                                alignment: AlignmentType.RIGHT
                            })
                        ]
                    })
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({ text: `Auteur: ${data.technicien.nom}`, size: 16, font: 'Calibri', color: '6B7280' }),
                                    new TextRun({ text: `  |  ${ENTERPRISE.name}`, size: 16, font: 'Calibri', color: ENTERPRISE.colors.primary }),
                                    new TextRun({ text: `  |  ${ENTERPRISE.address}`, size: 16, font: 'Calibri', color: '6B7280' }),
                                    new TextRun({ text: '  |  Page ', size: 16, font: 'Calibri', color: '6B7280' }),
                                    new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Calibri', color: '6B7280' }),
                                    new TextRun({ text: `  |  ${data.date}`, size: 16, font: 'Calibri', color: '6B7280' })
                                ],
                                alignment: AlignmentType.CENTER
                            })
                        ]
                    })
                },
                children: content
            }
        ]
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('SAMPLE_Enterprise_EQWATTEUR_FX-2026-00142.docx', buffer);
    console.log('✅ Generated: SAMPLE_Enterprise_EQWATTEUR_FX-2026-00142.docx');
}

generateEnterprise().catch(console.error);
