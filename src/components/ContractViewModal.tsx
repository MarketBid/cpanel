import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download } from 'lucide-react';
import { Transaction, ContractType, RefundPolicyType } from '../types';
import { generateContractPDF } from '../utils/pdfGenerator';

interface ContractViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
}

const ContractViewModal: React.FC<ContractViewModalProps> = ({
    isOpen,
    onClose,
    transaction,
}) => {
    const handleDownloadPDF = () => {
        generateContractPDF(transaction);
    };

    if (!isOpen) return null;

    const senderName = transaction.sender?.name || '[Sender]';
    const receiverName = transaction.receiver?.name || '[Receiver]';
    const amount = transaction.amount || 0;
    const feePercentage = transaction.fee_config?.processing_fee_percentage || 3;
    const feePayer = transaction.fee_config?.fee_payer || 'split';
    const feeAmount = amount * (feePercentage / 100);
    const senderTotal = feePayer === 'receiver' ? amount : feePayer === 'split' ? amount + feeAmount / 2 : amount + feeAmount;
    const receiverNet = feePayer === 'sender' ? amount : feePayer === 'split' ? amount - feeAmount / 2 : amount - feeAmount;
    const typeLabel = transaction.type.replace(/_/g, ' ').toLowerCase();
    const bufferHours = transaction.time_based_config?.auto_completion_buffer_hours ?? 24;

    const refundLabel = (() => {
        if (!transaction.refund_policy) return 'standard Clarsix refund policy';
        switch (transaction.refund_policy.type) {
            case RefundPolicyType.FULL_REFUND: return 'a full refund';
            case RefundPolicyType.NO_REFUND: return 'no refund';
            case RefundPolicyType.PARTIAL_FIXED: return `a ${transaction.refund_policy.refund_percentage ?? 0}% partial refund`;
            case RefundPolicyType.CONDITIONAL_REFUND: return 'a conditional refund';
            case RefundPolicyType.CUSTOM_TERMS: return transaction.refund_policy.description || 'custom refund terms';
            default: return 'standard Clarsix refund policy';
        }
    })();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(22,36,31,.55)' }}>
                <div className="fixed inset-0" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full flex flex-col"
                    style={{ background: '#fff', borderRadius: '18px', maxWidth: '640px', maxHeight: '82vh' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between" style={{ padding: '22px 26px', borderBottom: '1px solid #e6ebe8' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '17px' }}>Transaction Agreement</div>
                            <div style={{ fontSize: '12.5px', color: '#8a958f' }}>{transaction.transaction_id}</div>
                        </div>
                        <span
                            onClick={onClose}
                            style={{ cursor: 'pointer', fontSize: '20px', color: '#8a958f', lineHeight: 1 }}
                        >
                            ×
                        </span>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 space-y-3" style={{ padding: '26px', fontSize: '13.5px', lineHeight: 1.7, color: '#3a453f' }}>
                        <p>
                            <strong>1. Parties.</strong> This agreement is entered into between <strong>{senderName}</strong> (Sender) and <strong>{receiverName}</strong> (Receiver) for the {typeLabel} transaction titled <em>"{transaction.title}"</em>, facilitated and mediated by Clarsix.
                        </p>
                        <p>
                            <strong>2. Scope of Work.</strong> {transaction.description}
                            {transaction.contract_type === ContractType.MILESTONE_BASED && transaction.milestones && transaction.milestones.length > 0 && (
                                <> Delivery is structured across {transaction.milestones.length} milestone{transaction.milestones.length > 1 ? 's' : ''}: {transaction.milestones.map((m, i) => `(${i + 1}) ${m.description} — ${m.amount_percentage}% due by ${m.due_date}`).join('; ')}.</>
                            )}
                        </p>
                        <p>
                            <strong>3. Payment Terms.</strong> The agreed transaction amount is <strong>₵{amount.toFixed(2)}</strong>. A processing fee of {feePercentage}% is applied and borne by the {feePayer === 'split' ? 'both parties equally' : feePayer}. The Sender will deposit <strong>₵{senderTotal.toFixed(2)}</strong> into the Clarsix Trust Vault; upon successful delivery, the Receiver will receive <strong>₵{receiverNet.toFixed(2)}</strong>. Funds remain held in escrow until delivery is confirmed.
                        </p>
                        <p>
                            <strong>4. Delivery &amp; Acceptance.</strong>{' '}
                            {transaction.contract_type === ContractType.TIME_BASED && transaction.time_based_config ? (
                                <>Delivery is expected by <strong>{transaction.time_based_config.completion_date}</strong> at {transaction.time_based_config.completion_time}. The Sender has <strong>{bufferHours} hours</strong> after the Receiver marks delivery to raise a dispute; if no dispute is raised within this window, funds are automatically released.</>
                            ) : (
                                <>Upon each milestone delivery, the Sender has <strong>{bufferHours} hours</strong> to raise a dispute; if no dispute is raised, the corresponding milestone funds are automatically released.</>
                            )}
                        </p>
                        <p>
                            <strong>5. Dispute Resolution.</strong> Either party may open a dispute through Clarsix support, which will review evidence from both sides before releasing or refunding funds. In the event of a confirmed dispute, the applicable refund policy is <strong>{refundLabel}</strong>.
                            {transaction.refund_policy?.type === RefundPolicyType.CONDITIONAL_REFUND && transaction.refund_policy.conditions && transaction.refund_policy.conditions.length > 0 && (
                                <> Conditions for refund eligibility: {transaction.refund_policy.conditions.join('; ')}.</>
                            )}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end" style={{ padding: '20px 26px', borderTop: '1px solid #e6ebe8', gap: '12px' }}>
                        <button
                            onClick={onClose}
                            style={{ background: '#fff', border: '1px solid #e6ebe8', borderRadius: '10px', padding: '11px 20px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2"
                            style={{ background: '#318A6E', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 20px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContractViewModal;
