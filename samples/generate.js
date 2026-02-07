const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType, 
        TableLayoutType, VerticalAlign, PageBreak } = require('docx');
const fs = require('fs');

// FixAIR Logo base64 (orange flame)
const FIXAIR_LOGO = 'iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADKklEQVR4nO2ZS2gTURSGv0maptFWrY+qbdUuXLgQwYW4EBQXIojgQnDhQhcu3CiCG0VwIbhQEBe6ceVCxIULFy5EEFyIC3HlQkRBLPVRH7W2sa1JM3PHRZLWZJKZe2cmk2D/zZD7OOe/d+6cc+4FDw8PDw8PD4//DBHAF8A6wBG0qxnAJcCbALYB7kCrmhFcCuAJwK0Ae6FVzQiOAvgQwH0A+6FVzQguBPAFgEcA9kKrmhGcD+BzAPcB7INWNSOYDeA7ALcAdkOrmhHMBHAjgBsBdkGrmhGMB3AjgKsBtkOrmhGMA3ANgMsBNkGrmhEMBXA1gPMAGqFVzQgGAbgCwFkA9dCqZgT9AFwOYD2ADdCqZgS9AKwCsBJALbSqGUEJgBUAKgFUQ6uaEfQAUAGgHEAFtKoZQRGACgClAIqhVc0I8gGUAcgDkAutakbQFUAugCwAmdCqZgQZAKYDSAWQAq1qRtAJQDKABADx0KpmBPEAYgBEAoiCVjUjiAAQBiAUQAi0qhmBH0AwAD8AP7SqGYEXgA+AF4APWtWMwAPADcAFwA2takbgBOAA4ADggFY1I7ADsAKwAbBBq5oRWAGYAZgAmKBVzQhMAIwAjACM0KpmBEYAegB6AHpoVTMCPQAtAC0ALbSqGYEWgAaABoAGWtWMQAPACEANQA2takagBqACoASghFY1I1AC0ABQAFBAq5oRKADIAMgAyKBVzQhkAKQApACk0KpmBFIACgASAApoVTMCCQAxADEAMbSqGYEYgAiACIAIWtWMQARABEAIQAitakYgBCAEIAAggFY1IxAAEAAQABBAq5oRCAAIAfChVc0I+AD4APjQqmYEfAB8AHxoVTMCHgAeAB60qhkBD4ALgAutakbAAeAE4ESrmhFwATgAONCqZgQOAHYAdrSqGYEdgA2ADa1qRmADYAFgQauaEVgAmAGY0apmBGYARgBGtKoZgRGAHoAerWpGoAegBaBFq5oRaAFoAGjQqmYEGgAqACq0qhmBCoASgBKtakagBKAAoECrmhEoAEgBSNGqZgRSABIAErSqGYEEgBiAGK1qRiAGIAIgghYPDw8PD49/h18AYrQNVHwF6fIAAAAASUVORK5CYII=';

// Sample signature
const SAMPLE_SIG = 'iVBORw0KGgoAAAANSUhEUgAAAJYAAAA8CAYAAACEhkNqAAAACXBIWXMAAAsTAAALEwEAmpwYAAABqElEQVR4nO3csW3CQBSG4f+OhIyQDTJCRsgIGSEjZISMkBFogIaGhoaGJk1KGhoaGhqaNC5S0NAkTYoUKVKkSJEiRTJFip5wZPt8d+97JWTZlu1P5/N5fwchJIRwB+C49YZMxBbAI4C71hsy4i2ASwA9gNPWGzLiEcAlgK71hoywAfAEwLbekBE9gAsAHYBz6w0Z8QTgHMCx9YaMeAJwCuCo9YaMuAdwAOCg9YaMeARwAGC/9YaMuAOwB2C39YaMuAGwA2Cn9YaM6AHsANhuvSEjbgFsA9hqvSEjOgBbADZbb8iIGwCbADZab8iIawDrANZab8iIKwBrAFZbb8iISwArAJZbb8iIDoBlAEutN2TEBYAlAIutN2TEOYAFAAv/9EZrAFoArYbN3wE0AZo2wlNJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiRJkiT9N58BfGm9IUkf+AHw4HrBewZ4vwAAAABJRU5ErkJggg==';

const primaryColor = 'F97316';

function base64ToBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' };
const noBorder = { style: BorderStyle.NONE };

function sectionHeading(text) {
    return new Paragraph({
        children: [
            new TextRun({ text: '█ ', color: primaryColor, size: 24 }),
            new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: 'Calibri' })
        ],
        spacing: { before: 400, after: 150 }
    });
}

function infoBox(leftItems, rightItems) {
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
                    borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                    margins: { top: 120, bottom: 120, left: 160, right: 160 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: rightContent.length ? rightContent : [new Paragraph({})],
                    borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
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
                children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: '374151' })]
            })],
            shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
            borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
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
            shading: idx % 2 === 1 ? { fill: 'FAFAFA', type: ShadingType.CLEAR } : undefined
        }))
    }));
    
    return new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED
    });
}

async function generate() {
    const children = [];
    
    // Header with logos
    children.push(new Table({
        rows: [new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [
                            new ImageRun({ data: base64ToBuffer(FIXAIR_LOGO), transformation: { width: 40, height: 40 } }),
                            new TextRun({ text: '  FixAIR', bold: true, size: 36, font: 'Calibri', color: primaryColor })
                        ]
                    })],
                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: 'EQWATTEUR', size: 28, font: 'Calibri', color: '0066CC', bold: true })],
                        alignment: AlignmentType.RIGHT
                    })],
                    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.CENTER
                })
            ]
        })],
        width: { size: 100, type: WidthType.PERCENTAGE }
    }));
    
    // Title
    children.push(new Paragraph({
        children: [new TextRun({ text: "RAPPORT D'INTERVENTION", bold: true, size: 32, font: 'Calibri', color: '111827' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 }
    }));
    
    // Brand
    children.push(new Paragraph({
        children: [new TextRun({ text: 'Carrier', size: 24, font: 'Calibri', color: primaryColor })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
    }));
    
    // Ref info
    children.push(new Paragraph({
        children: [new TextRun({ text: 'Réf: FX-2026-00142   •   Date: 07/02/2026   •   SAV / Dépannage', size: 20, font: 'Calibri', color: '6B7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
    }));
    
    // Status badge
    children.push(new Paragraph({
        children: [new TextRun({ text: '  ✓ CONFORME  ', bold: true, size: 24, font: 'Calibri', color: '22C55E' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        shading: { fill: 'DCFCE7', type: ShadingType.CLEAR }
    }));
    
    // Résumé
    children.push(sectionHeading('Résumé'));
    children.push(new Paragraph({
        children: [new TextRun({ text: "Intervention suite à défaut de communication sur unité extérieure VRF. Diagnostic réalisé, câble bus défectueux identifié et remplacé. Système remis en service avec succès. Toutes les unités intérieures communiquent correctement.", size: 20, font: 'Calibri' })],
        spacing: { after: 200 },
        shading: { fill: 'F9FAFB', type: ShadingType.CLEAR }
    }));
    
    // Site & Client
    children.push(sectionHeading('Site & Client'));
    children.push(infoBox(
        [
            { label: 'N° Affaire', value: 'AFF-2026-0089' },
            { label: 'Adresse', value: '45 Avenue de la République' },
            { label: 'Ville', value: '94140 Alfortville' }
        ],
        [
            { label: 'Société', value: 'EQWATTEUR SAS' },
            { label: 'Contact', value: 'Badra Cisse' },
            { label: 'Téléphone', value: '07 49 33 21 08' },
            { label: 'Réf. Client', value: 'CLI-EQW-001' }
        ]
    ));
    
    // Dates
    children.push(sectionHeading('Dates Intervention'));
    children.push(infoBox(
        [{ label: 'Début', value: '07/02/2026 à 09:30' }],
        [{ label: 'Fin', value: '07/02/2026 à 14:45' }]
    ));
    
    // Équipement
    children.push(sectionHeading('Équipement'));
    children.push(infoBox(
        [
            { label: 'Type', value: 'VRF' },
            { label: 'Modèle', value: '38AH-024' },
            { label: 'N° Série', value: 'CR26A00142' },
            { label: 'Puissance', value: '24 kW' },
            { label: 'Garantie', value: 'Sous garantie' }
        ],
        [
            { label: 'Fluide', value: 'R410A' },
            { label: 'Charge initiale', value: '8.5 kg' },
            { label: 'Charge totale', value: '8.5 kg' },
            { label: 'Huile', value: 'POE' }
        ]
    ));
    
    // Codes défaut
    children.push(sectionHeading('Codes Défaut'));
    children.push(createTable(
        ['Code', 'Description', 'Résolution'],
        [
            ['7100', 'Défaut communication bus entre UE et UI', 'Câble bus remplacé'],
            ['7102', 'Timeout communication UI-03', 'Adressage vérifié et corrigé']
        ]
    ));
    
    // Mesures
    children.push(sectionHeading('Mesures'));
    children.push(createTable(
        ['Paramètre', 'Valeur', 'Observation'],
        [
            ['Haute Pression', '28.5 bar', ''],
            ['Basse Pression', '10.2 bar', ''],
            ['Surchauffe', '7 °C', ''],
            ['Sous-refroidissement', '5 °C', '']
        ]
    ));
    
    // Travaux effectués
    children.push(sectionHeading('Travaux Effectués'));
    const travaux = [
        'Diagnostic complet du système VRF',
        'Vérification du câblage bus de communication',
        'Remplacement câble bus défectueux (15m)',
        'Reprogrammation adresses unités intérieures',
        'Test de fonctionnement toutes UI',
        'Relevé des pressions et températures'
    ];
    travaux.forEach(t => {
        children.push(new Paragraph({
            children: [
                new TextRun({ text: '✓  ', color: '22C55E', size: 22, font: 'Calibri' }),
                new TextRun({ text: t, size: 20, font: 'Calibri' })
            ],
            spacing: { after: 80 },
            indent: { left: 200 }
        }));
    });
    
    // Travaux à prévoir
    children.push(sectionHeading('Travaux à Prévoir'));
    children.push(new Paragraph({
        children: [
            new TextRun({ text: '→  ', color: '6B7280', size: 20, font: 'Calibri' }),
            new TextRun({ text: 'Maintenance préventive recommandée dans 6 mois', size: 20, font: 'Calibri' }),
            new TextRun({ text: '  [Normal]', size: 18, font: 'Calibri', color: 'F59E0B' })
        ],
        spacing: { after: 80 },
        indent: { left: 200 }
    }));
    children.push(new Paragraph({
        children: [
            new TextRun({ text: '→  ', color: '6B7280', size: 20, font: 'Calibri' }),
            new TextRun({ text: 'Vérifier état des filtres UI bureau direction', size: 20, font: 'Calibri' }),
            new TextRun({ text: '  [Optionnel]', size: 18, font: 'Calibri', color: '6B7280' })
        ],
        spacing: { after: 80 },
        indent: { left: 200 }
    }));
    
    // Pièces
    children.push(sectionHeading('Pièces Utilisées'));
    children.push(createTable(
        ['Référence', 'Désignation', 'Qté'],
        [
            ['CBL-BUS-15M', 'Câble bus communication 2 paires blindé', '1'],
            ['CON-RJ45-2P', 'Connecteurs RJ45 blindés', '4']
        ]
    ));
    
    // Rapport technicien
    children.push(sectionHeading('Rapport Technicien'));
    children.push(new Paragraph({
        children: [new TextRun({ text: "À mon arrivée, le système affichait un défaut de communication généralisé. Après diagnostic approfondi, j'ai identifié un câble bus endommagé (probable passage de rongeur dans le faux-plafond). Le câble a été remplacé sur toute sa longueur entre le coffret de brassage et l'unité extérieure. Toutes les unités intérieures ont été ré-adressées et testées individuellement. Le système fonctionne maintenant parfaitement.", size: 20, font: 'Calibri' })],
        spacing: { after: 200 }
    }));
    
    // Réserves
    children.push(sectionHeading('Réserves / Alertes'));
    children.push(new Paragraph({
        children: [
            new TextRun({ text: '! ', size: 22, color: 'F59E0B', font: 'Calibri' }),
            new TextRun({ text: 'Passage câbles: ', bold: true, size: 20, font: 'Calibri', color: 'F59E0B' }),
            new TextRun({ text: 'Recommandation de protéger les passages de câbles dans le faux-plafond (gaines anti-rongeurs)', size: 20, font: 'Calibri' })
        ],
        spacing: { after: 100 },
        shading: { fill: 'FFFBEB', type: ShadingType.CLEAR }
    }));
    
    // Résultat
    children.push(sectionHeading('Résultat'));
    children.push(new Paragraph({
        children: [new TextRun({ text: '✓ PROBLÈME RÉSOLU', bold: true, size: 26, font: 'Calibri', color: '22C55E' })],
        spacing: { after: 100 },
        shading: { fill: 'DCFCE7', type: ShadingType.CLEAR }
    }));
    children.push(new Paragraph({
        children: [new TextRun({ text: 'Système remis en service. Communication rétablie entre toutes les unités. Client satisfait.', size: 20, font: 'Calibri' })],
        spacing: { after: 200 }
    }));
    
    // Technicien
    children.push(sectionHeading('Technicien'));
    children.push(infoBox(
        [
            { label: 'Nom', value: 'Mohamed AHMED' },
            { label: 'Entreprise', value: 'EQWATTEUR SAS' }
        ],
        [
            { label: 'Présence', value: '09:30 → 14:45' }
        ]
    ));
    
    // Signatures
    children.push(sectionHeading('Signatures'));
    children.push(new Table({
        rows: [new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: 'Client', bold: true, size: 18, font: 'Calibri', color: '6B7280' })],
                            alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                            children: [new ImageRun({ data: base64ToBuffer(SAMPLE_SIG), transformation: { width: 120, height: 40 } })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 100, after: 100 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: 'Badra Cisse', size: 18, font: 'Calibri' })],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: 'Technicien', bold: true, size: 18, font: 'Calibri', color: '6B7280' })],
                            alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                            children: [new ImageRun({ data: base64ToBuffer(SAMPLE_SIG), transformation: { width: 120, height: 40 } })],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 100, after: 100 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: 'Mohamed AHMED', size: 18, font: 'Calibri' })],
                            alignment: AlignmentType.CENTER
                        })
                    ],
                    borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                    margins: { top: 120, bottom: 120, left: 120, right: 120 },
                    width: { size: 50, type: WidthType.PERCENTAGE }
                })
            ]
        })],
        width: { size: 100, type: WidthType.PERCENTAGE }
    }));
    
    // Footer
    children.push(new Paragraph({
        children: [new TextRun({ text: '━'.repeat(50), color: 'E5E7EB' })],
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER
    }));
    
    children.push(new Paragraph({
        children: [
            new TextRun({ text: 'Document généré par ', size: 16, font: 'Calibri', color: '9CA3AF' }),
            new TextRun({ text: 'FixAIR', size: 16, font: 'Calibri', color: primaryColor, bold: true }),
            new TextRun({ text: ' — 07/02/2026 09:15', size: 16, font: 'Calibri', color: '9CA3AF' })
        ],
        alignment: AlignmentType.CENTER
    }));
    
    // Create document
    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
            children
        }]
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('SAMPLE_Rapport_EQWATTEUR_FX-2026-00142.docx', buffer);
    console.log('✅ Generated: SAMPLE_Rapport_EQWATTEUR_FX-2026-00142.docx');
}

generate().catch(console.error);
