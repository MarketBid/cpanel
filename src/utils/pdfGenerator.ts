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

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');

        if (align === 'center') {
            doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
        } else if (align === 'right') {
            doc.text(text, pageWidth - margin, yPosition, { align: 'right' });
        } else {
            const lines = doc.splitTextToSize(text, contentWidth);
            doc.text(lines, margin, yPosition);
            yPosition += (lines.length - 1) * 5;
        }
        yPosition += fontSize / 2 + 2;
    };

    const addSpace = (space: number = 5) => {
        yPosition += space;
    };

    const addLine = () => {
        doc.setDrawColor(primary.r, primary.g, primary.b);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
    };

    const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Header
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CLARSIX ESCROW SERVICE AGREEMENT', pageWidth / 2, 25, { align: 'center' });

    yPosition = 50;
    doc.setTextColor(textColor.r, textColor.g, textColor.b);

    // Transaction ID and Date
    addText(`Transaction ID: ${transaction.transaction_id}`, 10, true);
    addText(`Date: ${new Date(transaction.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 10);
    addSpace(10);
    addLine();
    addSpace(10);

    // Parties Section
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('PARTIES TO THIS AGREEMENT', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);

    addText('Sender (Buyer):', 11, true);
    addText(`Name: ${transaction.sender?.name || 'N/A'}`, 10);
    addText(`Email: ${transaction.sender?.email || 'N/A'}`, 10);
    addSpace(5);

    addText('Receiver (Seller):', 11, true);
    addText(`Name: ${transaction.receiver?.name || 'N/A'}`, 10);
    addText(`Email: ${transaction.receiver?.email || 'N/A'}`, 10);
    addSpace(10);
    addLine();
    addSpace(10);

    checkPageBreak();

    // Service Details
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('SERVICE DETAILS', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);
    addText(`Title: ${transaction.title}`, 10, true);
    addText(`Description: ${transaction.description}`, 10);
    addSpace(5);
    addText(`Total Amount: GHS ${transaction.amount.toLocaleString()}`, 12, true);
    addSpace(10);
    addLine();
    addSpace(10);

    checkPageBreak();

    // Contract Terms
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('CONTRACT TERMS', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);

    if (transaction.contract_type === ContractType.TIME_BASED && transaction.time_based_config) {
        addText('Contract Type: Time-Based Completion', 11, true);
        addText(`Completion Date: ${transaction.time_based_config.completion_date}`, 10);
        addText(`Completion Time: ${transaction.time_based_config.completion_time}`, 10);
        addText(`Auto-Completion Buffer: ${transaction.time_based_config.auto_completion_buffer_hours} hours`, 10);
        addText('The funds will be automatically released if the buyer does not dispute within the buffer period after completion.', 9);
    } else if (transaction.contract_type === ContractType.MILESTONE_BASED && transaction.milestones) {
        addText('Contract Type: Milestone-Based Completion', 11, true);
        addSpace(3);
        transaction.milestones.forEach((milestone, index) => {
            checkPageBreak(30);
            addText(`Milestone ${index + 1}: ${milestone.description}`, 10, true);
            addText(`Payment: ${milestone.amount_percentage}% (GHS ${(transaction.amount * milestone.amount_percentage / 100).toFixed(2)})`, 9);
            addText(`Due Date: ${milestone.due_date}`, 9);
            addText(`Completion Condition: ${milestone.completion_condition}`, 9);
            addSpace(3);
        });
    }

    addSpace(10);
    addLine();
    addSpace(10);

    checkPageBreak();

    // Refund Policy
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('REFUND PROTECTION POLICY', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);

    const refundPolicyLabels: Record<RefundPolicyType, string> = {
        [RefundPolicyType.FULL_REFUND]: 'Full Refund Protection (100% refundable)',
        [RefundPolicyType.CONDITIONAL_REFUND]: 'Conditional Refund',
        [RefundPolicyType.PARTIAL_FIXED]: 'Partial Fixed Refund',
        [RefundPolicyType.NO_REFUND]: 'No Refund (Non-refundable)',
        [RefundPolicyType.CUSTOM_TERMS]: 'Custom Terms'
    };

    addText(`Policy Type: ${refundPolicyLabels[transaction.refund_policy?.type || RefundPolicyType.FULL_REFUND]}`, 10, true);

    if (transaction.refund_policy?.type === RefundPolicyType.CONDITIONAL_REFUND && transaction.refund_policy.conditions) {
        addText('Applicable Conditions:', 10, true);
        transaction.refund_policy.conditions.forEach(condition => {
            addText(`  • ${condition}`, 9);
        });
    }

    if (transaction.refund_policy?.type === RefundPolicyType.PARTIAL_FIXED && transaction.refund_policy.refund_percentage) {
        addText(`Refund Percentage: ${transaction.refund_policy.refund_percentage}%`, 10);
    }

    if (transaction.refund_policy?.type === RefundPolicyType.CUSTOM_TERMS && transaction.refund_policy.description) {
        addText(`Custom Terms: ${transaction.refund_policy.description}`, 10);
    }

    addSpace(10);
    addLine();
    addSpace(10);

    checkPageBreak();

    // Fee Structure
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('FEE STRUCTURE', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);

    const refundFee = transaction.amount * 0.05;
    const cancellationFee = transaction.amount * 0.10;

    addText(`Refund Processing Fee: 5% (GHS ${refundFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`, 10);
    if (transaction.fee_config?.refund_fee_payer) {
        const payerLabel = transaction.fee_config.refund_fee_payer === 'split'
            ? 'Split (50/50)'
            : transaction.fee_config.refund_fee_payer === 'sender'
                ? 'Payment Sender'
                : 'Payment Receiver';
        addText(`Paid by: ${payerLabel}`, 10);
    }
    addSpace(3);
    addText(`Cancellation Fee: 10% (GHS ${cancellationFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`, 10);
    addText('(Applicable if payment sender cancels after work begins)', 9);
    addSpace(10);
    addLine();
    addSpace(10);

    checkPageBreak(60);

    // Terms and Conditions
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('TERMS AND CONDITIONS', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(5);
    addText('1. The funds will be held in secure escrow until the service is completed and confirmed.', 9);
    addText('2. Both parties agree to communicate in good faith to resolve any disputes.', 9);
    addText('3. The escrow service provider (Clarsix) acts as a neutral third party.', 9);
    addText('4. Any disputes must be raised within the specified timeframe.', 9);
    addText('5. This agreement is governed by the laws of Ghana.', 9);
    addSpace(15);

    checkPageBreak(60);

    // Signatures
    doc.setTextColor(primary.r, primary.g, primary.b);
    addText('SIGNATURES', 14, true);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    addSpace(10);

    // Sender Signature
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPosition, margin + 70, yPosition);
    yPosition += 5;
    addText('Sender (Buyer)', 9, true);
    addText(`${transaction.sender?.email || 'N/A'}`, 8);
    addText(`Date: ${new Date(transaction.created_at).toLocaleDateString()}`, 8);
    addSpace(15);

    // Receiver Signature
    doc.line(margin, yPosition, margin + 70, yPosition);
    yPosition += 5;
    addText('Receiver (Seller)', 9, true);
    addText(`${transaction.receiver?.email || 'N/A'}`, 8);
    addText(`Date: ${new Date(transaction.created_at).toLocaleDateString()}`, 8);
    addSpace(20);

    // Footer on last page
    yPosition = pageHeight - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(muted.r, muted.g, muted.b);
    doc.text('This is a legally binding agreement generated by Clarsix Escrow Service', pageWidth / 2, yPosition, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

    // Open PDF in new tab instead of downloading
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
};
