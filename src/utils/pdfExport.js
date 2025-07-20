import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToPDF = async (results, loanData, reportType = 'summary') => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const footerHeight = 20;
    const headerHeight = 25;
    const contentHeight = pageHeight - headerHeight - footerHeight - 10;

    // Helper functions
    const addTitle = (text, y, size = 16, color = [0, 0, 0]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, pageWidth / 2, y, { align: 'center' });
      return y + (size * 0.8);
    };

    const addText = (text, x, y, size = 10, isBold = false, color = [0, 0, 0]) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y);
      return y + (size * 0.6);
    };

    const addParagraph = (text, x, y, maxWidth = pageWidth - (margin * 2), size = 9) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line, index) => {
        doc.text(line, x, y + (index * size * 0.6));
      });
      return y + (lines.length * size * 0.6) + 5;
    };

    const ensureContentFits = (y, neededHeight) => {
      if (y + neededHeight > contentHeight) {
        doc.addPage();
        addHeader(doc.internal.getNumberOfPages());
        return margin + headerHeight;
      }
      return y;
    };

    const formatCurrency = (amount) => `$${Math.round(amount).toLocaleString()}`;
    const formatPercent = (rate) => `${rate.toFixed(2)}%`;

    // Add header to each page
    const addHeader = (pageNumber) => {
      const headerColor = [59, 130, 246]; // Blue
      
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, 0, pageWidth, headerHeight - 5, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      
      let title = 'LOAN ANALYSIS REPORT';
      if (pageNumber > 1) {
        title = reportType === 'full' ? 'COMPLETE PAYMENT SCHEDULE' : 'PAYMENT SAMPLES';
      }
      
      doc.text(title, pageWidth / 2, headerHeight / 2, { align: 'center' });
    };

    // Add footer to all pages
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
        
        // Page number
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, margin, pageHeight - footerHeight + 10);
        
        // Disclaimer
        if (i === pageCount) {
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text('DISCLAIMER: This analysis is for informational purposes only. Consult with a qualified financial advisor.', margin, pageHeight - 7);
        }
      }
    };

    // Calculate key metrics
    const totalPaid = results.optimizedSchedule.reduce(
      (sum, payment) => sum + payment.principal + payment.interest + (payment.extraPayment || 0),
      0
    );
    const totalInterest = results.optimizedSchedule.reduce((sum, payment) => sum + payment.interest, 0);
    const totalExtraPayments = results.optimizedSchedule.reduce((sum, payment) => sum + (payment.extraPayment || 0), 0);
    const savings = results.totalInterestSaved;
    const timeSaved = results.monthsSaved;

    // PAGE 1: EXECUTIVE SUMMARY
    let y = margin + headerHeight;
    addHeader(1);

    // Date generated
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Executive Summary
    y = addTitle('LOAN SUMMARY', y, 14, [59, 130, 246]);
    y += 5;

    // Loan summary table
    const loanSummary = [
      ['Principal Amount', formatCurrency(loanData.amount)],
      ['Interest Rate', formatPercent(loanData.interestRate)],
      ['Term', `${loanData.termYears} years`],
      ['Monthly Payment', formatCurrency(results.monthlyPayment)],
      ['Extra Payment', loanData.extraPayment > 0 ? formatCurrency(loanData.extraPayment) : 'None'],
      ['Original Payoff', format(new Date(new Date(loanData.startDate).getTime() + (loanData.termYears * 365.25 * 24 * 60 * 60 * 1000)), 'MMM yyyy')],
      ['Optimized Payoff', format(new Date(results.payoffDate), 'MMM yyyy')]
    ];

    doc.autoTable({
      startY: y,
      body: loanSummary,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
        minCellHeight: 6
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80, textColor: [59, 130, 246] },
        1: { cellWidth: 70 }
      },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // Savings Summary
    y = addTitle('SAVINGS SUMMARY', y, 14, [34, 197, 94]);
    y += 5;
    
    const savingsSummary = [
      ['Total Interest Saved', formatCurrency(savings)],
      ['Time Saved', `${Math.floor(timeSaved/12)} years, ${timeSaved%12} months`],
      ['Original Total Interest', formatCurrency(results.originalTotalInterest)],
      ['Optimized Total Interest', formatCurrency(totalInterest)],
      ['Interest Reduction', `${((savings/results.originalTotalInterest)*100).toFixed(1)}%`]
    ];

    doc.autoTable({
      startY: y,
      body: savingsSummary,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [220, 220, 220],
        minCellHeight: 6
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80, textColor: [34, 197, 94] },
        1: { cellWidth: 70, fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    y = doc.lastAutoTable.finalY + 15;

    // KEY TERMS EXPLAINED
    y = ensureContentFits(y, 80);
    y = addTitle('KEY TERMS EXPLAINED', y, 14, [59, 130, 246]);
    y += 5;
    
    // Terms box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(230, 236, 241);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 75, 2, 2, 'F');
    
    // Term definitions
    let termY = y + 5;
    termY = addText('Base Payment:', margin + 5, termY, 9, true, [59, 130, 246]);
    termY = addParagraph(`Required monthly payment of ${formatCurrency(results.monthlyPayment)} covering principal and interest.`, 
                         margin + 10, termY, pageWidth - (margin * 2) - 20, 8);
    
    termY += 2;
    termY = addText('Interest Savings:', margin + 5, termY, 9, true, [34, 197, 94]);
    termY = addParagraph(`Your optimized payment strategy saves ${formatCurrency(savings)} in interest payments.`, 
                         margin + 10, termY, pageWidth - (margin * 2) - 20, 8);
    
    termY += 2;
    termY = addText('Time Savings:', margin + 5, termY, 9, true, [239, 68, 68]);
    termY = addParagraph(`You'll pay off your loan ${Math.floor(timeSaved/12)} years and ${timeSaved%12} months earlier than scheduled.`, 
                         margin + 10, termY, pageWidth - (margin * 2) - 20, 8);
    
    termY += 2;
    termY = addText('Extra Payments:', margin + 5, termY, 9, true, [168, 85, 247]);
    termY = addParagraph(`Additional ${loanData.extraPayment > 0 ? formatCurrency(loanData.extraPayment) + ' ' + loanData.extraPaymentFrequency : 'payments'} 
                         that reduce principal faster, saving both time and interest.`, 
                         margin + 10, termY, pageWidth - (margin * 2) - 20, 8);

    // Chart data representation
    y = termY + 15;
    y = ensureContentFits(y, 120);
    y = addTitle('PAYMENT BREAKDOWN', y, 14, [59, 130, 246]);
    y += 5;

    // First year payment breakdown
    const firstYearPayments = results.optimizedSchedule.slice(0, 12).map((payment, index) => [
      `Month ${index + 1}`,
      formatCurrency(payment.principal),
      formatCurrency(payment.interest),
      formatCurrency(payment.extraPayment || 0),
      formatCurrency(payment.balance)
    ]);

    doc.autoTable({
      startY: y,
      head: [['Month', 'Principal', 'Interest', 'Extra', 'Balance']],
      body: firstYearPayments,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [230, 230, 230],
        minCellHeight: 5
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30, halign: 'right', textColor: [59, 130, 246] },
        2: { cellWidth: 30, halign: 'right', textColor: [239, 68, 68] },
        3: { cellWidth: 30, halign: 'right', textColor: [34, 197, 94] },
        4: { cellWidth: 35, halign: 'right' }
      },
      margin: { left: margin, right: margin }
    });

    // Annual summary
    if (reportType === 'summary') {
      y = doc.lastAutoTable.finalY + 15;
      y = ensureContentFits(y, 100);
      y = addTitle('ANNUAL SUMMARY', y, 14, [168, 85, 247]);
      y += 5;

      // Group payments by year
      const yearlyData = {};
      results.optimizedSchedule.forEach(payment => {
        const year = new Date(payment.date).getFullYear();
        if (!yearlyData[year]) {
          yearlyData[year] = {
            principal: 0,
            interest: 0,
            extraPayments: 0,
            endingBalance: payment.balance
          };
        }
        yearlyData[year].principal += payment.principal;
        yearlyData[year].interest += payment.interest;
        yearlyData[year].extraPayments += (payment.extraPayment || 0);
        yearlyData[year].endingBalance = payment.balance;
      });

      const annualData = Object.keys(yearlyData)
        .sort()
        .slice(0, 10) // Show first 10 years for summary
        .map(year => [
          year,
          formatCurrency(yearlyData[year].principal),
          formatCurrency(yearlyData[year].interest),
          formatCurrency(yearlyData[year].extraPayments),
          formatCurrency(yearlyData[year].endingBalance)
        ]);

      doc.autoTable({
        startY: y,
        head: [['Year', 'Principal Paid', 'Interest Paid', 'Extra Payments', 'Year-End Balance']],
        body: annualData,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [230, 230, 230],
          minCellHeight: 5
        },
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 35, halign: 'right', textColor: [59, 130, 246] },
          2: { cellWidth: 35, halign: 'right', textColor: [239, 68, 68] },
          3: { cellWidth: 35, halign: 'right', textColor: [34, 197, 94] },
          4: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });
    }

    // PAGE 2+: PAYMENT SCHEDULE
    doc.addPage();
    y = margin + headerHeight;
    addHeader(2);

    y = addTitle(
      reportType === 'full' ? 'COMPLETE AMORTIZATION SCHEDULE' : 'PAYMENT SCHEDULE SAMPLES', 
      y, 
      14,
      reportType === 'full' ? [168, 85, 247] : [34, 197, 94]
    );
    y += 5;

    // Schedule description
    const scheduleDescription = reportType === 'full' 
      ? 'Complete payment schedule showing every payment for the entire loan term.'
      : 'Sample payments showing the beginning, middle and end of your loan term.';

    doc.setFillColor(250, 250, 250);
    doc.setLineWidth(0.1);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 12, 2, 2, 'F');
    y = addParagraph(scheduleDescription, margin + 5, y + 4, pageWidth - (margin * 2) - 10, 8);
    y += 5;

    // Payment schedule table
    const headers = ['#', 'Date', 'Principal', 'Interest', 'Extra', 'Balance'];

    if (reportType === 'full') {
      const scheduleData = results.optimizedSchedule.map(payment => [
        payment.paymentNumber.toString(),
        format(new Date(payment.date), 'MM/dd/yyyy'),
        formatCurrency(payment.principal),
        formatCurrency(payment.interest),
        formatCurrency(payment.extraPayment || 0),
        formatCurrency(payment.balance)
      ]);

      doc.autoTable({
        startY: y,
        head: [headers],
        body: scheduleData,
        theme: 'striped',
        styles: {
          fontSize: 7,
          cellPadding: 1.5,
          lineWidth: 0.1,
          lineColor: [230, 230, 230],
          minCellHeight: 4
        },
        headStyles: {
          fillColor: [168, 85, 247],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', textColor: [59, 130, 246], cellWidth: 30 },
          3: { halign: 'right', textColor: [239, 68, 68], cellWidth: 30 },
          4: { halign: 'right', textColor: [34, 197, 94], cellWidth: 25 },
          5: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader(data.pageNumber);
        }
      });
    } else {
      // Sample payments for summary report
      const samplePayments = [];
      
      // First 5 payments
      samplePayments.push(...results.optimizedSchedule.slice(0, 5).map(payment => [
        payment.paymentNumber.toString(),
        format(new Date(payment.date), 'MM/dd/yyyy'),
        formatCurrency(payment.principal),
        formatCurrency(payment.interest),
        formatCurrency(payment.extraPayment || 0),
        formatCurrency(payment.balance)
      ]));
      
      // Middle 5 payments
      const middleIndex = Math.floor(results.optimizedSchedule.length / 2);
      samplePayments.push(...results.optimizedSchedule.slice(middleIndex - 2, middleIndex + 3).map(payment => [
        payment.paymentNumber.toString(),
        format(new Date(payment.date), 'MM/dd/yyyy'),
        formatCurrency(payment.principal),
        formatCurrency(payment.interest),
        formatCurrency(payment.extraPayment || 0),
        formatCurrency(payment.balance)
      ]));
      
      // Last 5 payments
      const lastPayments = results.optimizedSchedule.slice(-5);
      samplePayments.push(...lastPayments.map(payment => [
        payment.paymentNumber.toString(),
        format(new Date(payment.date), 'MM/dd/yyyy'),
        formatCurrency(payment.principal),
        formatCurrency(payment.interest),
        formatCurrency(payment.extraPayment || 0),
        formatCurrency(payment.balance)
      ]));

      doc.autoTable({
        startY: y,
        head: [headers],
        body: samplePayments,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          lineWidth: 0.1,
          lineColor: [230, 230, 230],
          minCellHeight: 5
        },
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', textColor: [59, 130, 246], cellWidth: 30 },
          3: { halign: 'right', textColor: [239, 68, 68], cellWidth: 30 },
          4: { halign: 'right', textColor: [34, 197, 94], cellWidth: 25 },
          5: { halign: 'right', cellWidth: 35 }
        },
        margin: { left: margin, right: margin },
        didParseCell: (data) => {
          // Add visual separator between groups
          if (data.row.index === 5 || data.row.index === 10) {
            data.cell.styles.fillColor = [245, 245, 245];
            data.cell.styles.fontStyle = 'italic';
          }
        }
      });
    }

    // Add footer
    addFooter();

    // Save with descriptive name
    const reportTypeName = reportType === 'full' ? 'Complete' : 'Summary';
    doc.save(`LoanAnalysis_${reportTypeName}_${format(new Date(), 'yyyyMMdd')}.pdf`);

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};