import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, DollarSign, User, FileText, ArrowLeft, Shield, Info, Plus, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import { ContractType, Milestone, RefundPolicyType, RefundPolicy, FeeConfig } from '../types';

import { useCreateTransaction } from '../hooks/queries/useTransactions';
import { useUsers } from '../hooks/queries/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface CreateTransactionForm {
  title: string;
  description: string;
  amount: number;
  contract_type: ContractType;
  time_based_config?: {
    completion_date: string;
    completion_time: string;
    auto_completion_buffer_hours: number;
  };
  refund_policy: RefundPolicy;
  fee_config: FeeConfig;
}



const CreateTransaction: React.FC = () => {
  const [formData, setFormData] = useState<CreateTransactionForm>({
    title: '',
    description: '',
    amount: 0,
    contract_type: ContractType.TIME_BASED,
    time_based_config: {
      completion_date: '',
      completion_time: '',
      auto_completion_buffer_hours: 24
    },
    refund_policy: {
      type: RefundPolicyType.FULL_REFUND
    },
    fee_config: {
      refund_processing_fee_percentage: 5,
      refund_fee_payer: 'split',
      cancellation_fee_percentage: 10
    }
  });
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manualSenderEmail, setManualSenderEmail] = useState('');
  const [manualReceiverEmail, setManualReceiverEmail] = useState('');
  const [role, setRole] = useState<'sender' | 'receiver'>('receiver');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { maskAmount } = useSensitiveInfo();

  // Use React Query to fetch users with caching
  const { data: users = [] } = useUsers();
  const createTransactionMutation = useCreateTransaction();

  useEffect(() => {
    const senderId = searchParams.get('sender');
    const receiverId = searchParams.get('receiver');

    if (senderId && users.length > 0) {
      const sender = users.find(u => u.id === parseInt(senderId));
      if (sender) {
        setManualSenderEmail(sender.email);
      }
    }

    if (receiverId) {
      setRole('sender');
      if (users.length > 0) {
        const receiver = users.find(u => u.id === parseInt(receiverId));
        if (receiver) {
          setManualReceiverEmail(receiver.email);
        }
      }
    }
  }, [searchParams, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }



    if (formData.contract_type === ContractType.MILESTONE_BASED) {
      const totalPercentage = milestones.reduce((sum, m) => sum + m.amount_percentage, 0);
      if (totalPercentage !== 100) {
        setError(`Total milestone percentage must equal 100% (Current: ${totalPercentage}%)`);
        return;
      }
      if (milestones.length === 0) {
        setError('At least one milestone is required');
        return;
      }
    }

    if (formData.contract_type === ContractType.TIME_BASED && (!formData.time_based_config?.completion_date || !formData.time_based_config?.completion_time)) {
      setError('Completion date and time are required for time-based contracts');
      return;
    }

    try {
      const transactionData = {
        ...formData,
        sender_email: role === 'sender' ? user?.email : manualSenderEmail,
        receiver_email: role === 'receiver' ? user?.email : manualReceiverEmail,
        owner: role,

        time_based_config: formData.contract_type === ContractType.TIME_BASED
          ? formData.time_based_config
          : undefined,

        milestones: formData.contract_type === ContractType.MILESTONE_BASED
          ? milestones.map(({ id, ...rest }) => rest)
          : undefined,
        fee_config: {
          refund_fee_payer: formData.fee_config.refund_fee_payer
        }
      };
      console.log(transactionData);
      const transaction = await createTransactionMutation.mutateAsync(transactionData);
      // The mutation returns the created transaction. Be defensive in case the
      // API returns a wrapped payload (e.g. { data: transaction }).
      const unwrap = (o: any) => {
        if (!o) return o;
        if (typeof o === 'object' && 'transaction_id' in o) return o;
        if (typeof o === 'object' && 'data' in o && typeof o.data === 'object' && 'transaction_id' in o.data) {
          return (o as any).data;
        }
        return o;
      };
      const createdTransaction: any = unwrap(transaction as any);
      const newTransactionId = createdTransaction?.transaction_id || createdTransaction?.id;
      navigate(`/transactions/${newTransactionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    }
  };

  const loading = createTransactionMutation.isPending;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addMilestone = () => {
    setMilestones(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      amount_percentage: 0,
      due_date: '',
      completion_condition: ''
    }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string | number) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };



  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Create New Transaction</h1>
          <p className="text-[var(--text-secondary)] mt-1">Set up a secure escrow payment for your transaction</p>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-2xl p-6 animate-slide-down">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[var(--alert-error-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="h-6 w-6 text-[var(--alert-error-text)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--alert-error-text)] mb-1">Error</h3>
              <p className="text-[var(--alert-error-text)]">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Your Role</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('receiver')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all duration-150 ${role === 'receiver'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-md'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-light)]'
                  }`}
              >
                I am the Payment Receiver
              </button>
              <button
                type="button"
                onClick={() => setRole('sender')}
                className={`py-4 px-4 rounded-xl font-semibold transition-all duration-150 ${role === 'sender'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                I am the Payment Sender
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-primary-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>{role === 'sender' ? 'Receiver' : 'Sender'} Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
                  <span className="text-[var(--color-primary-text)] font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">You are the {role === 'sender' ? 'Sender' : 'Receiver'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{user?.name} ({user?.email})</p>
                </div>
              </div>
            </div>

            {role === 'receiver' && (
              <Input
                label={`${role === 'receiver' ? 'Sender' : 'Receiver'} Email (Optional)`}
                name="manual_sender_email"
                type="email"
                value={manualSenderEmail}
                onChange={e => setManualSenderEmail(e.target.value)}
                placeholder="Enter sender Email"
                helperText="You can leave this empty if you don't know the sender email."
              />
            )}

            {role === 'sender' && (
              <Input
                label="Receiver Email (Optional)"
                name="manual_receiver_email"
                type="email"
                value={manualReceiverEmail}
                onChange={e => setManualReceiverEmail(e.target.value)}
                placeholder="Enter receiver Email"
                helperText="You can leave this empty if you don't know the receiver email."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <CardTitle>Service Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Service Title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleInputChange}
              leftIcon={<Package className="h-5 w-5" />}
              placeholder="Enter the service title"
            />



            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Description <span className="text-[var(--alert-error-text)]">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="input-field resize-none"
                placeholder="Provide detailed description of the service"
              />
            </div>

            {/* Contract Type Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Contract Type <span className="text-[var(--alert-error-text)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.TIME_BASED }))}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-150 text-sm ${formData.contract_type === ContractType.TIME_BASED
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-md border border-[var(--color-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-light)] border border-transparent'
                    }`}
                >
                  Time-Based Completion
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.MILESTONE_BASED }))}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-150 text-sm ${formData.contract_type === ContractType.MILESTONE_BASED
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-md border border-[var(--color-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-light)] border border-transparent'
                    }`}
                >
                  Milestone-Based Completion
                </button>
              </div>
            </div>

            {/* Time-Based Configuration */}
            {formData.contract_type === ContractType.TIME_BASED && (
              <div className="space-y-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] animate-fade-in">
                <h4 className="font-semibold text-[var(--text-primary)]">Time-Based Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Completion Date"
                    name="completion_date"
                    type="date"
                    required
                    value={formData.time_based_config?.completion_date || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      time_based_config: { ...prev.time_based_config!, completion_date: e.target.value }
                    }))}
                  />
                  <Input
                    label="Completion Time"
                    name="completion_time"
                    type="time"
                    required
                    value={formData.time_based_config?.completion_time || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      time_based_config: { ...prev.time_based_config!, completion_time: e.target.value }
                    }))}
                  />
                </div>
                <Input
                  label="Auto-Completion Buffer (Hours)"
                  name="auto_completion_buffer_hours"
                  type="number"
                  required
                  min="1"
                  value={formData.time_based_config?.auto_completion_buffer_hours || 24}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    time_based_config: { ...prev.time_based_config!, auto_completion_buffer_hours: parseInt(e.target.value) || 24 }
                  }))}
                  helperText="Funds will be automatically released if buyer doesn't dispute within this period after completion."
                />
              </div>
            )}

            {/* Milestone Configuration */}
            {formData.contract_type === ContractType.MILESTONE_BASED && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[var(--text-primary)]">Milestones</h4>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary-text)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-dark)] rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </button>
                </div>

                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--alert-error-text)] transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h5 className="text-sm font-medium text-[var(--text-primary)]">Milestone {index + 1}</h5>
                    <Input
                      label="Description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      placeholder="e.g., Initial Draft Delivery"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Payment Percentage (%)"
                        type="number"
                        min="1"
                        max="100"
                        value={milestone.amount_percentage}
                        onChange={(e) => updateMilestone(milestone.id, 'amount_percentage', parseFloat(e.target.value))}
                      />
                      <Input
                        label="Due Date"
                        type="date"
                        value={milestone.due_date}
                        onChange={(e) => updateMilestone(milestone.id, 'due_date', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Completion Condition"
                      value={milestone.completion_condition}
                      onChange={(e) => updateMilestone(milestone.id, 'completion_condition', e.target.value)}
                      placeholder="e.g., Client approval via email"
                    />
                  </div>
                ))}
                <div className="text-sm text-right font-medium">
                  Total Percentage: <span className={milestones.reduce((sum, m) => sum + m.amount_percentage, 0) === 100 ? 'text-[var(--amount-positive)]' : 'text-[var(--amount-negative)]'}>
                    {milestones.reduce((sum, m) => sum + m.amount_percentage, 0)}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-accent-600" />
              </div>
              <CardTitle>Payment Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              label="Amount (₵)"
              name="amount"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleInputChange}
              leftIcon={<span className="text-neutral-500 font-medium">₵</span>}
              placeholder="0.00"
              helperText="Enter the total amount to be paid by the sender"
            />
          </CardContent>
        </Card>

        {/* Refund & Fee Policy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle>Protection & Fees</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Refund Policy */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                Refund Protection Policy <span className="text-[var(--alert-error-text)]">*</span>
              </label>
              <select
                value={formData.refund_policy.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  refund_policy: { ...prev.refund_policy, type: e.target.value as RefundPolicyType }
                }))}
                className="input-field mb-3"
              >
                <option value={RefundPolicyType.FULL_REFUND}>Full Refund Protection (100% refundable)</option>
                <option value={RefundPolicyType.CONDITIONAL_REFUND}>Conditional Refund</option>
                <option value={RefundPolicyType.PARTIAL_FIXED}>Partial Fixed Refund</option>
                <option value={RefundPolicyType.NO_REFUND}>No Refund (Non-refundable)</option>
                <option value={RefundPolicyType.CUSTOM_TERMS}>Custom Terms</option>
              </select>

              {formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (
                <div className="p-4 bg-[var(--status-pending-bg)] rounded-xl border border-[var(--status-pending-border)] space-y-3">
                  <p className="text-sm font-medium text-[var(--status-pending-text)]">Select applicable conditions:</p>
                  <div className="space-y-2">
                    {[
                      "Service not started",
                      "Client delays beyond timeline",
                      "Verified quality issues",
                      "Service not as described"
                    ].map((condition) => (
                      <label key={condition} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-4 w-4 rounded border-[var(--status-pending-border)] text-[var(--status-pending-text)] focus:ring-[var(--status-pending-text)] cursor-pointer"
                            checked={formData.refund_policy.conditions?.includes(condition) || false}
                            onChange={(e) => {
                              const currentConditions = formData.refund_policy.conditions || [];
                              const newConditions = e.target.checked
                                ? [...currentConditions, condition]
                                : currentConditions.filter(c => c !== condition);

                              setFormData(prev => ({
                                ...prev,
                                refund_policy: {
                                  ...prev.refund_policy,
                                  conditions: newConditions
                                }
                              }));
                            }}
                          />
                        </div>
                        <span className="text-sm text-[var(--status-pending-text)] group-hover:opacity-80 transition-colors">
                          {condition}
                        </span>
                      </label>
                    ))}
                  </div>
                  {(!formData.refund_policy.conditions || formData.refund_policy.conditions.length === 0) && (
                    <p className="text-xs text-[var(--alert-error-text)] mt-2">Please select at least one condition.</p>
                  )}
                </div>
              )}

              {formData.refund_policy.type === RefundPolicyType.PARTIAL_FIXED && (
                <Input
                  label="Refund Percentage (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.refund_policy.refund_percentage || 0}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    refund_policy: { ...prev.refund_policy, refund_percentage: parseFloat(e.target.value) }
                  }))}
                />
              )}

              {formData.refund_policy.type === RefundPolicyType.CUSTOM_TERMS && (
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter custom refund terms..."
                  value={formData.refund_policy.description || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    refund_policy: { ...prev.refund_policy, description: e.target.value }
                  }))}
                />
              )}
            </div>

            {/* Fee Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-default)]">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Refund Processing Fee
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">5%</span>
                  <span className="text-sm text-[var(--text-secondary)]">of payment amount</span>
                </div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Who pays?</label>
                <select
                  value={formData.fee_config.refund_fee_payer}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fee_config: { ...prev.fee_config, refund_fee_payer: e.target.value as any }
                  }))}
                  className="input-field"
                >
                  <option value="sender">Payment Sender</option>
                  <option value="receiver">Payment Receiver</option>
                  <option value="split">Split (50/50)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Cancellation Fee
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">10%</span>
                  <span className="text-sm text-[var(--text-secondary)]">of payment amount</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Fee retained if payment sender cancels after work begins.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>





        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-neutral-600" />
              </div>
              <CardTitle>Transaction Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Agreement Header */}
              <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border-default)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">Agreement Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Service</span>
                    <span className="font-medium text-[var(--text-primary)]">{formData.title || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Contract Type</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {formData.contract_type === ContractType.TIME_BASED ? 'Time-Based Completion' : 'Milestone-Based Completion'}
                    </span>
                  </div>
                  {formData.contract_type === ContractType.TIME_BASED && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Completion Due</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {formData.time_based_config?.completion_date} at {formData.time_based_config?.completion_time}
                      </span>
                    </div>
                  )}
                  {formData.contract_type === ContractType.MILESTONE_BASED && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Milestones</span>
                      <span className="font-medium text-[var(--text-primary)]">{milestones.length} defined</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Protection & Fees Summary */}
              <div className="bg-[var(--bg-tertiary)] p-4 rounded-xl border border-[var(--border-default)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-3">Protection & Fees</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Refund Policy</span>
                    <span className="font-medium text-[var(--text-primary)] capitalize">
                      {formData.refund_policy.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Conditions</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {formData.refund_policy.conditions?.length || 0} selected
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Refund Fee (5%)</span>
                    <span className="font-medium text-[var(--text-primary)] capitalize">
                      Paid by {formData.fee_config.refund_fee_payer}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Cancellation Fee</span>
                    <span className="font-medium text-[var(--text-primary)]">10% (if cancelled by sender)</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Sender</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {role === 'sender'
                      ? `${user?.name} (You)`
                      : (manualSenderEmail
                        ? users.find(u => u.email === manualSenderEmail)?.name || manualSenderEmail
                        : 'To be assigned')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Receiver</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {role === 'receiver'
                      ? `${user?.name} (You)`
                      : (manualReceiverEmail
                        ? users.find(u => u.email === manualReceiverEmail)?.name || manualReceiverEmail
                        : 'To be assigned')}
                  </span>
                </div>

                <div className="pt-4 border-t-2 border-[var(--border-medium)]">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[var(--text-primary)]">Total Amount</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      ₵{maskAmount(formData.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 text-right">
                    Funds will be held in secure escrow until completion.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary)]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[var(--color-primary)]/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">Secure Escrow Protection</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Your payment will be held securely until delivery is confirmed. Both parties are protected throughout the transaction.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!formData.title || !formData.description || formData.amount <= 0}
            className="flex-1"
          >
            Create Transaction
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransaction;
