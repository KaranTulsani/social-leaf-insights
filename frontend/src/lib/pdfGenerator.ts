import { ReportAnalysis } from "@/services/api";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface DashboardMetrics {
  totalImpressions: number;
  engagementRate: string | number;
  totalComments: number;
  totalShares: number;
  growthRate: number;
}

interface ChartElement {
  id: string;
  title: string;
}

/**
 * Generates a structured PDF report with selectable text and high-quality charts.
 * @param title The title for the PDF file.
 * @param metrics The metrics data to include in the report.
 * @param charts Array of chart element IDs to capture and include.
 * @param analysis The structured AI analysis object.
 */
export const generateDashboardPDF = async (
  title: string,
  metrics: DashboardMetrics,
  charts: ChartElement[],
  analysis?: ReportAnalysis
) => {
  const loadingToast = toast.loading('Generating PDF report...');

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let currentY = 15;

    // Brand Colors
    const colors = {
      primary: [99, 102, 241], // Indigo-500 (#6366f1)
      secondary: [168, 85, 247], // Purple-500 (#a855f7)
      darkText: [30, 41, 59], // Slate-800
      lightText: [100, 116, 139], // Slate-500
      cardBg: [248, 250, 252], // Slate-50
      insightBg: [238, 242, 255], // Indigo-50
      insightBorder: [199, 210, 254], // Indigo-200
    };

    // --- Helper: Draw Section Background ---
    const drawSectionBg = (y: number, height: number, color: number[]) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin - 2, y - 2, pageWidth - (margin * 2) + 4, height + 4, 3, 3, 'F');
    };

    // --- Helper: Render Markdown (with aesthetics) ---
    const renderMarkdown = (text: string, x: number, width: number, isCard = false) => {
      const lines = text.split('\n');
      const maxLineWidth = width - (x * 2);

      if (isCard) {
        // Calculate rough height first to draw background
        let estimatedHeight = 0;
        for (const line of lines) {
          if (!line.trim()) continue;
          const splitText = doc.splitTextToSize(line, maxLineWidth);
          estimatedHeight += (splitText.length * 5) + 2;
        }
        drawSectionBg(currentY, estimatedHeight + 5, colors.insightBg);
        currentY += 3; // Padding top inside card
      }

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Page Break
        if (currentY > 275) {
          doc.addPage();
          currentY = 20;
          if (isCard) {
            // Redraw bg for new page context (simplified)
            // In a real generic parser we'd handle split cards better, 
            // but here we just continue.
          }
        }

        // Header Check (## Title)
        if (line.startsWith('##')) {
          const sectionTitle = line.replace(/^##\s*/, '');
          currentY += 5;
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          doc.text(sectionTitle.toUpperCase(), x, currentY);
          currentY += 8;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
          continue;
        }

        // Bullet Check
        const isBullet = line.startsWith('-') || line.startsWith('* ') || line.match(/^\d+\./);
        let xOffset = x;

        if (isBullet) {
          xOffset = x + 5;
          const parts = line.split(/(\*\*.*?\*\*)/g);
          let currentX = xOffset;

          for (const part of parts) {
            if (currentX > width - margin) break;

            if (part.startsWith('**') && part.endsWith('**')) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]); // Highlight bold in primary
              const cleanText = part.replace(/\*\*/g, '');
              doc.text(cleanText, currentX, currentY);
              currentX += doc.getTextWidth(cleanText);
              doc.setFont("helvetica", "normal");
              doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]); // Reset
            } else {
              doc.text(part, currentX, currentY);
              currentX += doc.getTextWidth(part);
            }
          }
          currentY += 6;
          continue;
        }

        // Regular Text
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        doc.text(splitText, x, currentY);
        currentY += (splitText.length * 5) + 3;
      }

      if (isCard) currentY += 5; // Padding bottom
      else currentY += 5;
    };

    // --- Header Section ---
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, currentY, margin + 10, currentY); // Small accent line
    currentY += 5;

    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(title, margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.text(`DATE: ${new Date().toLocaleDateString().toUpperCase()}`, margin, currentY);
    currentY += 15;

    // --- Overview Metrics Table ---
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
    doc.text('PERFORMANCE SNAPSHOT', margin, currentY);
    currentY += 5;

    const metricsData = [
      ['Total Impressions', metrics.totalImpressions.toLocaleString()],
      ['Engagement Rate', `${metrics.engagementRate}%`],
      ['Total Comments', metrics.totalComments.toLocaleString()],
      ['Total Shares', metrics.totalShares.toLocaleString()],
      ['Growth Rate', `+${metrics.growthRate}%`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['METRIC', 'VALUE']],
      body: metricsData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 11,
        cellPadding: 6,
        textColor: colors.darkText,
        lineColor: [241, 245, 249], // Slate-100
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [250, 250, 255]
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- AI Executive Summary ---
    if (analysis && analysis.executive_summary) {
      if (currentY + 40 > 280) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      doc.text('EXECUTIVE AUDIT', margin, currentY);
      currentY += 10;

      doc.setFontSize(10);
      doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);

      // Render summary in a subtle generic container context (no color bg for main text to keep it clean, or maybe yes?)
      // Let's keep the summary clean white bg, but use the colorful headers logic
      renderMarkdown(analysis.executive_summary, margin, pageWidth);
      currentY += 10;
    }

    // --- Charts Section ---
    for (const chart of charts) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      const element = document.getElementById(chart.id);
      if (element) {
        // Chart Title
        doc.setFontSize(14);
        doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
        doc.setFont("helvetica", "bold");
        doc.text(chart.title.toUpperCase(), margin, currentY);
        currentY += 7;

        // Capture Chart Image
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > 280) {
          doc.addPage();
          currentY = 20;
          doc.text(chart.title.toUpperCase(), margin, currentY);
          currentY += 7;
        }

        // Drop shadow effect (simulated with rect)
        doc.setFillColor(240, 240, 240);
        doc.rect(margin + 1, currentY + 1, imgWidth, imgHeight, 'F');

        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        doc.setDrawColor(230, 230, 230);
        doc.rect(margin, currentY, imgWidth, imgHeight); // Border

        currentY += imgHeight + 10;

        // --- AI Graph-Specific Insight (Card Style) ---
        if (analysis) {
          let graphInsight = "";
          if (chart.id.includes('engagement')) graphInsight = analysis.engagement_graph_analysis;
          else if (chart.id.includes('content-type')) graphInsight = analysis.content_graph_analysis;
          else if (chart.id.includes('platform')) graphInsight = analysis.platform_graph_analysis;

          if (graphInsight) {
            // Title for Insight
            doc.setFontSize(9);
            doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            doc.setFont("helvetica", "bold");
            doc.text("AI ANALYSIS", margin, currentY);
            currentY += 4;

            // Render text inside color card
            renderMarkdown(graphInsight, margin, pageWidth, true); // true = draw background card
            currentY += 10;
          }
        }
      }
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Social Leaf Analytics • Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    toast.dismiss(loadingToast);
    toast.success('PDF Report downloaded successfully!');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    toast.dismiss(loadingToast);
    toast.error('Failed to generate PDF. Please try again.');
  }
};
