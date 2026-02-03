import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

/**
 * Generates a PDF from a specified HTML element.
 * @param elementId The ID of the HTML element to capture.
 * @param title The title for the PDF file.
 */
export const generateDashboardPDF = async (elementId: string, title: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error('Could not find dashboard content to export.');
    return;
  }

  const loadingToast = toast.loading('Generating PDF report...');

  try {
    // Adding a class to ensure it looks good while capturing (optional, e.g., forcing light mode)
    element.classList.add('pdf-capture-mode');

    // Wait a moment for any re-renders or image loads
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading cross-origin images
      logging: false,
      backgroundColor: '#ffffff', // Force white background
    });

    element.classList.remove('pdf-capture-mode');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 297; // A4 landscape width mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add header
    pdf.setFontSize(18);
    pdf.text(title, 14, 15);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Add image
    pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);

    // Save
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    toast.dismiss(loadingToast);
    toast.success('PDF Report downloaded successfully!');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    toast.dismiss(loadingToast);
    toast.error('Failed to generate PDF. Please try again.');
  }
};
