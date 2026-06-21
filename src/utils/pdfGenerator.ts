import jsPDF from 'jspdf';
import { Transaction, ContractType, RefundPolicyType } from '../types';

export const generateContractPDF = (transaction: Transaction) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    const primary = { r: 4, g: 128, b: 91 };
    const textColor = { r: 33, g: 43, b: 54 };
    const muted = { r: 107, g: 114, b: 128 };

    // Standard styling helpers
    const setPrimaryFont = (size = 10, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.setTextColor(primary.r, primary.g, primary.b);
    };

    const setContentFont = (size = 10, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
    };

    const setMutedFont = (size = 9) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(size);
        doc.setTextColor(muted.r, muted.g, muted.b);
    }

    const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    const drawCard = (title: string, drawContent: () => void) => {
        // Check for space before starting card (heuristic: assume card needs at least 40 units)
        checkPageBreak(50);

        const startY = yPosition;

        // Card Header
        doc.setFillColor(248, 250, 252); // Very light gray bg for header
        doc.roundedRect(margin, startY, contentWidth, 12, 2, 2, 'F');

        setPrimaryFont(11, true);
        doc.text(title.toUpperCase(), margin + 5, startY + 8);

        yPosition += 18; // Content start
        setContentFont();

        drawContent();

        yPosition += 5; // Padding bottom

        // Draw Border
        doc.setDrawColor(226, 232, 240); // scalable border color
        doc.roundedRect(margin, startY, contentWidth, yPosition - startY, 2, 2);

        yPosition += 10; // Margin after card
    };

    // --- DOCUMENT HEADER ---
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CLARSIX TRANSACTION AGREEMENT', pageWidth / 2, 25, { align: 'center' });

    yPosition = 50;

    // Meta Info
    setContentFont(10, true);
    doc.text(`Transaction ID: ${transaction.transaction_id}`, margin, yPosition);
    doc.text(`Date: ${new Date(transaction.created_at).toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // --- SERVICE DETAILS CARD ---
    drawCard('Service Details', () => {
        // Title
        setMutedFont(8);
        doc.text('TITLE', margin + 5, yPosition);
        yPosition += 5;
        setContentFont(10, true);
        doc.text(transaction.title, margin + 5, yPosition);
        yPosition += 10;

        // Description
        setMutedFont(8);
        doc.text('DESCRIPTION', margin + 5, yPosition);
        yPosition += 5;
        setContentFont(10, false);
        const descLines = doc.splitTextToSize(transaction.description, contentWidth - 10);
        doc.text(descLines, margin + 5, yPosition);
        yPosition += (descLines.length * 5) + 5;

        // Type
        setMutedFont(8);
        doc.text('CATEGORY', margin + 5, yPosition);
        yPosition += 5;
        setContentFont(10, false);
        doc.text(transaction.type.replace(/_/g, ' '), margin + 5, yPosition);
        yPosition += 5;
    });

    // --- CONTRACT TERMS CARD ---
    drawCard('Contract Terms', () => {
        if (transaction.contract_type === ContractType.TIME_BASED && transaction.time_based_config) {
            setContentFont(10);
            doc.text(`Completion Date: ${transaction.time_based_config.completion_date}`, margin + 5, yPosition);
            yPosition += 6;
            doc.text(`Completion Time: ${transaction.time_based_config.completion_time}`, margin + 5, yPosition);
            yPosition += 6;
            doc.text(`Auto-Release Buffer: ${transaction.time_based_config.auto_completion_buffer_hours} hours after delivery`, margin + 5, yPosition);
            yPosition += 5;
        } else if (transaction.contract_type === ContractType.MILESTONE_BASED && transaction.milestones) {
            transaction.milestones.forEach((m, i) => {
                // Check internal break? simplifying for now
                setContentFont(10, true);
                doc.text(`${i + 1}. ${m.description}`, margin + 5, yPosition);
                yPosition += 5;
                setContentFont(9, false);
                doc.text(`Due: ${m.due_date} | ${m.amount_percentage}%`, margin + 10, yPosition);
                yPosition += 7;
            });
        }
    });

    // --- REFUND POLICY CARD ---
    drawCard('Refund Policy', () => {
        const policy = transaction.refund_policy;
        if (!policy) {
            doc.text('No refund policy specified.', margin + 5, yPosition);
            yPosition += 5;
            return;
        }

        const refundPolicyLabels: Record<RefundPolicyType, string> = {
            [RefundPolicyType.FULL_REFUND]: 'Full Refund Protection (100% refundable)',
            [RefundPolicyType.CONDITIONAL_REFUND]: 'Conditional Refund',
            [RefundPolicyType.PARTIAL_FIXED]: 'Partial Fixed Refund',
            [RefundPolicyType.NO_REFUND]: 'No Refund (Non-refundable)',
            [RefundPolicyType.CUSTOM_TERMS]: 'Custom Terms'
        };

        setContentFont(10, true);
        doc.text(`Policy Type: ${refundPolicyLabels[policy.type] || policy.type}`, margin + 5, yPosition);
        yPosition += 8;

        setContentFont(10, false);
        if (policy.type === RefundPolicyType.PARTIAL_FIXED && policy.refund_percentage) {
            doc.text(`Refund Percentage: ${policy.refund_percentage}% of total amount`, margin + 5, yPosition);
            yPosition += 5;
        } else if (policy.type === RefundPolicyType.CONDITIONAL_REFUND && policy.conditions) {
            doc.text('Conditions:', margin + 5, yPosition);
            yPosition += 5;
            policy.conditions.forEach(c => {
                doc.text(`• ${c}`, margin + 10, yPosition);
                yPosition += 5;
            });
        } else if (policy.type === RefundPolicyType.CUSTOM_TERMS && policy.description) {
            const lines = doc.splitTextToSize(`Terms: ${policy.description}`, contentWidth - 10);
            doc.text(lines, margin + 5, yPosition);
            yPosition += (lines.length * 5);
        }
    });

    // --- FINANCIALS CARD ---
    drawCard('Payment & Protection', () => {
        const amount = transaction.amount || 0;
        const feePercent = transaction.fee_config?.processing_fee_percentage || 3;
        const feePayer = transaction.fee_config?.fee_payer || 'split';

        // Total Amount Header
        setContentFont(10);
        doc.text('Total Transaction Amount:', margin + 5, yPosition);
        setPrimaryFont(14, true);
        doc.text(`GHS ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, yPosition, { align: 'right' });
        yPosition += 10;

        // Fee Config
        doc.setDrawColor(240, 240, 240);
        doc.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
        yPosition += 8;

        setPrimaryFont(10, true); // Section Header color
        doc.text('Fee Configuration', margin + 5, yPosition);
        yPosition += 6;

        setContentFont(9);
        doc.text(`Processing Fee: ${feePercent}%`, margin + 5, yPosition);
        yPosition += 5;
        doc.text(`Fee Payer: ${feePayer === 'split' ? 'Split (50/50)' : feePayer.charAt(0).toUpperCase() + feePayer.slice(1)}`, margin + 5, yPosition);
        yPosition += 10;

        // Payment Structure Breakdown
        setPrimaryFont(10, true);
        doc.text('Payment Structure', margin + 5, yPosition);
        yPosition += 6;

        const feeAmount = amount * (feePercent / 100);
        const splitFee = feeAmount / 2;

        const drawRow = (label: string, value: number, bold = false) => {
            setContentFont(9, bold);
            doc.text(label, margin + 5, yPosition);
            doc.text(`GHS ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - margin - 25, yPosition, { align: 'right' });
            yPosition += 5;
        };

        const drawHeader = (label: string) => {
            setMutedFont(8);
            doc.text(label.toUpperCase(), margin + 5, yPosition);
            yPosition += 5;
        }

        if (feePayer === 'sender') {
            drawHeader('Sender');
            drawRow('Amount:', amount);
            drawRow(`Fee (${feePercent}%):`, feeAmount);
            doc.setDrawColor(200, 200, 200); doc.line(margin + 5, yPosition, pageWidth - margin - 20, yPosition); yPosition += 4;
            drawRow('Total Pay:', amount + feeAmount, true);
            yPosition += 5;

            drawHeader('Receiver');
            drawRow('Receives:', amount);
        } else if (feePayer === 'receiver') {
            drawHeader('Sender');
            drawRow('Pays:', amount);
            yPosition += 5;

            drawHeader('Receiver');
            drawRow('Amount:', amount);
            drawRow(`Fee (${feePercent}%):`, feeAmount);
            doc.setDrawColor(200, 200, 200); doc.line(margin + 5, yPosition, pageWidth - margin - 20, yPosition); yPosition += 4;
            drawRow('Net Receivable:', amount - feeAmount, true);
        } else { // Split
            drawHeader('Sender');
            drawRow('Amount:', amount);
            drawRow(`Fee (${feePercent / 2}%):`, splitFee);
            doc.setDrawColor(200, 200, 200); doc.line(margin + 5, yPosition, pageWidth - margin - 20, yPosition); yPosition += 4;
            drawRow('Total Pay:', amount + splitFee, true);
            yPosition += 5;

            drawHeader('Receiver');
            drawRow(`Fee (${feePercent / 2}%):`, splitFee);
            // Optional: Net Receivable
            // drawRow('Net Receivable:', amount - splitFee);
        }
    });

    yPosition += 10; // Extra spacing before Terms

    checkPageBreak(80);

    // --- TERMS AND CONDITIONS ---
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primary.r, primary.g, primary.b);
    doc.text('TERMS AND CONDITIONS', margin, yPosition);
    yPosition += 10;

    setContentFont(9);
    const terms = [
        "1. Funds Availability: The Sender agrees to deposit the full transaction amount plus any applicable fees into the Clarsix escrow account prior to the commencement of services or shipment.",
        "2. Release of Funds: Clarsix will release funds to the Receiver only upon confirmation of service completion or delivery as per the contract terms defined in this agreement.",
        "3. Dispute Resolution: In the event of a disagreement, both parties agree to utilize the Clarsix dispute resolution center. Funds will remain frozen until a resolution is reached mutually or via arbitration.",
        "4. Platform Fees: Processing fees are non-refundable once the transaction has been initiated.",
        "5. Cancellation: Detailed cancellation policies apply as selected in the transaction creation. Cancellation fees may be deducted from the refund amount.",
        "6. Receiver Fees: Any applicable processing fees payable by the Receiver will be automatically deducted from the final payout amount."
    ];

    terms.forEach(term => {
        const lines = doc.splitTextToSize(term, contentWidth);
        doc.text(lines, margin, yPosition);
        yPosition += (lines.length * 4) + 3;
    });

    yPosition += 10;

    yPosition += 20; // Space before footer

    // Footer (Relative position)
    doc.setFontSize(8);
    doc.setTextColor(muted.r, muted.g, muted.b);
    doc.text('Generated by Clarsix Escrow Service - Secure Digital Transactions', pageWidth / 2, yPosition, { align: 'center' });

    // Open
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
};
