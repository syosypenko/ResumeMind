
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType,
  VerticalAlign,
  TabStopType,
  TabStopPosition
} from "docx";
import { ResumeData } from "../types";

// Professional Color Palette matching the UI
const COLORS = {
  SLATE_900: "0F172A",
  SLATE_800: "1E293B",
  SLATE_500: "64748B",
  SLATE_200: "E2E8F0",
  WHITE: "FFFFFF",
  INDIGO_400: "818CF8",
  INDIGO_600: "4F46E5",
  INDIGO_800: "3730A3",
  BORDER_DARK: "334155",
};

/**
 * Creates a horizontal line (border) for section headers
 */
const createSectionBorder = (color: string = COLORS.SLATE_900) => ({
  bottom: { color, space: 1, style: BorderStyle.SINGLE, size: 6 },
});

/**
 * Helper for date-aligned paragraphs (Title on left, Date on right)
 */
const createHeaderWithDate = (leftText: string, rightText: string, color: string = COLORS.SLATE_900, isAlpine: boolean = false) => {
  return new Paragraph({
    spacing: { before: isAlpine ? 240 : 200, after: 40 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [
      new TextRun({ text: leftText, bold: true, size: 24, color, font: "Calibri" }),
      new TextRun({ text: `\t${rightText}`, bold: true, size: 18, color: COLORS.SLATE_500, font: "Calibri" }),
    ],
  });
};

export const generateDocx = async (data: ResumeData): Promise<Blob> => {
  const isAlpine = data.template === 'alpine';
  const isBalanced = data.template === 'balanced';

  // --- COMMON COMPONENTS ---
  const createExperienceBlock = (exp: any, isAlpineLayout: boolean = false) => [
    createHeaderWithDate(exp.position, `${exp.startDate} – ${exp.current ? 'PRESENT' : exp.endDate}`, COLORS.SLATE_900, isAlpineLayout),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: exp.company, italics: true, size: 20, color: COLORS.INDIGO_600, font: "Calibri", bold: true })
      ],
    }),
    ...exp.description.split('\n').map((line: string) => 
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 240 },
        children: [
          new TextRun({ text: line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`, size: 21, font: "Calibri", color: COLORS.SLATE_800 })
        ],
      })
    ),
  ];

  const createEducationBlock = (edu: any) => [
    createHeaderWithDate(edu.institution, edu.gradDate),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: `${edu.degree} in ${edu.field}`, italics: true, size: 20, color: COLORS.INDIGO_600, font: "Calibri" })
      ],
    }),
  ];

  const createProjectBlock = (proj: any) => [
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({ text: proj.title, bold: true, size: 22, color: COLORS.SLATE_900, font: "Calibri" }),
      ],
    }),
    ...(proj.link ? [
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({ text: proj.link, size: 16, color: COLORS.INDIGO_600, font: "Calibri" }),
        ],
      })
    ] : []),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: proj.description, size: 20, font: "Calibri", color: COLORS.SLATE_500 })
      ],
    }),
  ];

  // --- TEMPLATE GENERATORS ---

  const generateModernLayout = () => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: (data.personal.fullName || "Your Name").toUpperCase(), bold: true, size: 52, color: COLORS.SLATE_900, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({ 
          text: [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean).join("  •  "),
          size: 18, color: COLORS.SLATE_500, font: "Calibri" 
        }),
      ],
    }),
    ...(data.personal.summary ? [
      new Paragraph({ spacing: { before: 200, after: 400 }, alignment: AlignmentType.BOTH, children: [
        new TextRun({ text: data.personal.summary, size: 22, font: "Calibri", italics: true })
      ]})
    ] : []),
    ...generateStandardSections()
  ];

  const generateBalancedLayout = () => [
    new Paragraph({
      border: { left: { color: COLORS.INDIGO_600, space: 10, style: BorderStyle.SINGLE, size: 40 } },
      indent: { left: 200 },
      children: [
        new TextRun({ text: data.personal.fullName.toUpperCase(), bold: true, size: 48, color: COLORS.SLATE_900, font: "Calibri" }),
      ],
    }),
    new Paragraph({
      spacing: { after: 300, before: 100 },
      indent: { left: 200 },
      children: [
        new TextRun({ 
          text: [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean).join("  |  "),
          size: 18, color: COLORS.INDIGO_600, font: "Calibri", bold: true
        }),
      ],
    }),
    // FIX: Added missing Professional Summary for Balanced layout
    ...(data.personal.summary ? [
      new Paragraph({ 
        spacing: { before: 200, after: 300 }, 
        alignment: AlignmentType.BOTH, 
        children: [
          new TextRun({ text: data.personal.summary, size: 21, font: "Calibri", italics: true, color: COLORS.SLATE_800 })
        ]
      })
    ] : []),
    ...generateStandardSections(true)
  ];

  const generateStandardSections = (isBalanced: boolean = false) => {
    const sections: any[] = [];
    const headerColor = isBalanced ? COLORS.INDIGO_600 : COLORS.SLATE_900;

    if (data.experiences.length > 0) {
      sections.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        border: createSectionBorder(headerColor),
        children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", bold: true, size: 20, color: headerColor, font: "Calibri" })]
      }));
      data.experiences.forEach(exp => sections.push(...createExperienceBlock(exp)));
    }

    if (data.projects && data.projects.length > 0) {
      sections.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
        border: createSectionBorder(headerColor),
        children: [new TextRun({ text: "FEATURED PROJECTS", bold: true, size: 20, color: headerColor, font: "Calibri" })]
      }));
      data.projects.forEach(proj => sections.push(...createProjectBlock(proj)));
    }

    if (data.education.length > 0) {
      sections.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
        border: createSectionBorder(headerColor),
        children: [new TextRun({ text: "EDUCATION", bold: true, size: 20, color: headerColor, font: "Calibri" })]
      }));
      data.education.forEach(edu => sections.push(...createEducationBlock(edu)));
    }

    if (data.skills.length > 0) {
      sections.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
        border: createSectionBorder(headerColor),
        children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 20, color: headerColor, font: "Calibri" })]
      }));
      sections.push(new Paragraph({
        spacing: { before: 120, after: 200 },
        children: [new TextRun({ text: data.skills.map(s => `${s.name} (${s.level})`).join("  •  "), size: 21, font: "Calibri" })]
      }));
    }

    if (data.languages && data.languages.length > 0) {
      sections.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
        border: createSectionBorder(headerColor),
        children: [new TextRun({ text: "LANGUAGES", bold: true, size: 20, color: headerColor, font: "Calibri" })]
      }));
      sections.push(new Paragraph({
        spacing: { before: 120, after: 200 },
        children: [new TextRun({ text: data.languages.map(l => `${l.name} (${l.proficiency})`).join("  •  "), size: 21, font: "Calibri" })]
      }));
    }

    return sections;
  };

  const generateAlpineLayout = () => {
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
        rows: [
          new TableRow({
            children: [
              // Sidebar Cell (Left) - Dark Slate
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                shading: { fill: COLORS.SLATE_900 },
                margins: { top: 400, bottom: 400, left: 300, right: 300 },
                children: [
                  new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [new TextRun({ text: data.personal.fullName, bold: true, size: 36, color: COLORS.WHITE, font: "Calibri" })]
                  }),
                  new Paragraph({
                    spacing: { after: 300 },
                    children: [new TextRun({ text: "PROFESSIONAL", bold: true, size: 14, color: COLORS.INDIGO_400, font: "Calibri", allCaps: true })]
                  }),

                  // Sidebar Headers Helper
                  ...[
                    { title: "CONTACT", content: [data.personal.email, data.personal.phone, data.personal.location, data.personal.website] },
                    { title: "EDUCATION", content: data.education.map(edu => `${edu.institution}\n${edu.degree}\n${edu.gradDate}`) },
                    { title: "EXPERTISE", content: data.skills.map(s => `${s.name} (${s.level})`) },
                    { title: "LANGUAGES", content: data.languages.map(l => `${l.name} (${l.proficiency})`) }
                  ].flatMap(section => {
                    if (!section.content || section.content.length === 0) return [];
                    return [
                      new Paragraph({
                        spacing: { before: 300, after: 150 },
                        border: { bottom: { color: COLORS.BORDER_DARK, style: BorderStyle.SINGLE, size: 2 } },
                        children: [new TextRun({ text: section.title, bold: true, size: 16, color: COLORS.SLATE_500, font: "Calibri", allCaps: true })]
                      }),
                      ...section.content.filter(Boolean).map(text => 
                        new Paragraph({
                          spacing: { after: 80 },
                          children: [new TextRun({ text: text, size: 17, color: COLORS.SLATE_200, font: "Calibri" })]
                        })
                      )
                    ];
                  })
                ],
              }),
              // Main Content Cell (Right) - White
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                margins: { top: 400, bottom: 400, left: 400, right: 400 },
                children: [
                   // Profile
                   ...(data.personal.summary ? [
                    new Paragraph({ 
                      spacing: { before: 100, after: 150 }, 
                      children: [
                        new TextRun({ text: "PROFILE", bold: true, size: 18, color: COLORS.INDIGO_600, font: "Calibri", allCaps: true }),
                        new TextRun({ text: "  ", size: 18 })
                      ] 
                    }),
                    new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: data.personal.summary, size: 21, font: "Calibri", italics: true, color: COLORS.SLATE_800 })] }),
                   ] : []),

                   // Career History
                   new Paragraph({ 
                     spacing: { after: 200 }, 
                     children: [new TextRun({ text: "CAREER HISTORY", bold: true, size: 18, color: COLORS.INDIGO_600, font: "Calibri", allCaps: true })] 
                   }),
                   ...data.experiences.flatMap(exp => createExperienceBlock(exp, true)),

                   // Projects
                   ...(data.projects && data.projects.length > 0 ? [
                    new Paragraph({ spacing: { before: 400, after: 200 }, children: [new TextRun({ text: "FEATURED PROJECTS", bold: true, size: 18, color: COLORS.INDIGO_600, font: "Calibri", allCaps: true })] }),
                    ...data.projects.flatMap(proj => createProjectBlock(proj))
                   ] : [])
                ],
              }),
            ],
          }),
        ],
      })
    ];
  };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        }
      },
      children: data.template === 'alpine' 
        ? generateAlpineLayout() 
        : (data.template === 'balanced' ? generateBalancedLayout() : generateModernLayout())
    }]
  });

  return await Packer.toBlob(doc);
};
