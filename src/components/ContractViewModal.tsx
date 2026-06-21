import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText, Shield } from 'lucide-react';
import Button from './ui/Button';
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-sm m-0 p-0"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Contract Summary</h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                Transaction ID: {transaction.transaction_id}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-[var(--text-secondary)]" />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Service Information */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-tertiary)] flex justify-between items-center">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Service Details
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Title</span>
                                    <p className="font-semibold text-[var(--text-primary)]">{transaction.title}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Description</span>
                                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{transaction.description}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Category</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
                                        {transaction.type.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contract Specifics */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-tertiary)] flex justify-between items-center">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Contract Terms
                                </h3>
                            </div>
                            <div className="p-4">
                                {/* Time Based View */}
                                {transaction.contract_type === ContractType.TIME_BASED && transaction.time_based_config && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Completion Date</span>
                                            <p className="font-medium text-[var(--text-primary)]">{transaction.time_based_config.completion_date}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Completion Time</span>
                                            <p className="font-medium text-[var(--text-primary)]">{transaction.time_based_config.completion_time}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Auto-Release Buffer</span>
                                            <p className="text-sm text-[var(--text-primary)]">{transaction.time_based_config.auto_completion_buffer_hours} Hours after delivery</p>
                                        </div>
                                    </div>
                                )}

                                {/* Milestone View */}
                                {transaction.contract_type === ContractType.MILESTONE_BASED && transaction.milestones && (
                                    <div className="space-y-3">
                                        {transaction.milestones.map((m, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg text-sm">
                                                <div>
                                                    <p className="font-bold text-[var(--text-primary)]">{m.description}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">Due: {m.due_date} • {m.completion_condition}</p>
                                                </div>
                                                <div className="font-bold text-[var(--text-primary)]">{m.amount_percentage}%</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial & Protection */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-tertiary)] flex justify-between items-center">
                                <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Shield className="h-4 w-4" /> Payment & Protection
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-[var(--border-light)]">
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">Total Amount</span>
                                    <span className="text-2xl font-bold text-[var(--text-primary)]">₵{transaction.amount?.toFixed(2)}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Refund Policy</span>
                                        <p className="font-medium text-[var(--text-primary)] capitalize">{transaction.refund_policy?.type.replace('_', ' ').toLowerCase()}</p>

                                        {transaction.refund_policy?.type === RefundPolicyType.PARTIAL_FIXED && transaction.refund_policy.refund_percentage && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">{transaction.refund_policy.refund_percentage}% Refund on cancellation/dispute</p>
                                        )}

                                        {transaction.refund_policy?.type === RefundPolicyType.CONDITIONAL_REFUND && transaction.refund_policy.conditions && (
                                            <ul className="text-xs text-[var(--text-secondary)] list-disc ml-4 mt-1">
                                                {transaction.refund_policy.conditions.map(c => <li key={c}>{c}</li>)}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Parties</span>
                                        <div className="text-sm">
                                            <p><span className="text-[var(--text-tertiary)]">Sender:</span> {transaction.sender?.name || 'Pending'}</p>
                                            <p><span className="text-[var(--text-tertiary)]">Receiver:</span> {transaction.receiver?.name || 'Pending'}</p>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Fee Configuration</span>
                                            <div className="text-sm space-y-1">
                                                <p><span className="text-[var(--text-tertiary)]">Processing Fee:</span> {transaction.fee_config?.processing_fee_percentage || 3}%</p>
                                                <p><span className="text-[var(--text-tertiary)]">Fee Payer:</span> <span className="capitalize">{transaction.fee_config?.fee_payer || 'split'}</span></p>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Payment Structure</span>
                                            <div className="text-sm space-y-1">
                                                {(() => {
                                                    const feePayer = transaction.fee_config?.fee_payer || 'split';
                                                    const feePercentage = transaction.fee_config?.processing_fee_percentage || 3;
                                                    const amount = transaction.amount || 0;

                                                    if (feePayer === 'sender') {
                                                        return (
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Amount:</span> <span>₵{amount.toFixed(2)}</span></div>
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({feePercentage}%):</span> <span>₵{(amount * (feePercentage / 100)).toFixed(2)}</span></div>
                                                                        <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-light)] mt-1"><span className="text-[var(--text-primary)]">Total:</span> <span>₵{(amount * (1 + feePercentage / 100)).toFixed(2)}</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else if (feePayer === 'receiver') {
                                                        return (
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Total Payment:</span> <span>₵{amount.toFixed(2)}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Receiver</p>
                                                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Total Receivable:</span> <span>₵{amount.toFixed(2)}</span></div>
                                                                        <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1"><span>Fee ({feePercentage}%):</span> <span>₵{(amount * (feePercentage / 100)).toFixed(2)} (Paid Upfront)</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    } else {
                                                        // Split
                                                        const splitFeePercentage = (feePercentage / 2).toFixed(2).replace(/[.,]00$/, "");
                                                        return (
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Amount:</span> <span>₵{amount.toFixed(2)}</span></div>
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({splitFeePercentage}%):</span> <span>₵{(amount * ((feePercentage / 2) / 100)).toFixed(2)}</span></div>
                                                                        <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-light)] mt-1"><span className="text-[var(--text-primary)]">Total:</span> <span>₵{(amount * (1 + (feePercentage / 2) / 100)).toFixed(2)}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Receiver</p>
                                                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                                                        <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Total Receivable:</span> <span>₵{amount.toFixed(2)}</span></div>
                                                                        <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1"><span>Fee ({splitFeePercentage}%):</span> <span>₵{(amount * ((feePercentage / 2) / 100)).toFixed(2)} (Paid Upfront)</span></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--border-default)] bg-[var(--bg-tertiary)]/50">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownloadPDF}
                            leftIcon={<Download className="h-4 w-4" />}
                        >
                            Download as PDF
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ContractViewModal;
