import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, Info, Calendar, Shield, Plus, X, FileText } from 'lucide-react';
import { Transaction, TransactionStatus, ContractType, Milestone, RefundPolicyType, RefundPolicy, FeeConfig } from '../types';
import { useSensitiveInfo } from '../hooks/useSensitiveInfo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import { apiClient } from '../utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { transactionKeys } from '../hooks/queries/useTransactions';

interface EditTransactionForm {
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

const EditTransaction: React.FC = () => {
  const [formData, setFormData] = useState<EditTransactionForm>({
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { maskAmount } = useSensitiveInfo();
  const queryClient = useQueryClient();

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const editingTransaction = (location.state as any)?.editingTransaction;
    if (editingTransaction) {
      setTransaction(editingTransaction);
      setFormData({
        title: editingTransaction.title,
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        contract_type: editingTransaction.contract_type || ContractType.TIME_BASED,
        time_based_config: editingTransaction.time_based_config || {
          completion_date: '',
          completion_time: '',
          auto_completion_buffer_hours: 24
        },
        refund_policy: editingTransaction.refund_policy || {
          type: RefundPolicyType.FULL_REFUND
        },
        fee_config: editingTransaction.fee_config || {
          refund_processing_fee_percentage: 5,
          refund_fee_payer: 'split',
          cancellation_fee_percentage: 10
        }
      });
      if (editingTransaction.milestones) {
        // Ensure each milestone has a unique id
        setMilestones(
          editingTransaction.milestones.map((m, idx) => ({
            ...m,
            id: m.id || `${Date.now()}-${idx}`
          }))
        );
      }
    } else {
      navigate('/transactions');
    }
  }, [location.state, navigate]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!transaction) {
      setError('Transaction not found');
      return;
    }

    if (!formData.title.trim()) {
      setError('Transaction title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

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

    setLoading(true);

    try {
      const response = await apiClient.put(`/transactions/${transaction.transaction_id}`, {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        contract_type: formData.contract_type,
        time_based_config: formData.contract_type === ContractType.TIME_BASED ? formData.time_based_config : undefined,
        milestones: formData.contract_type === ContractType.MILESTONE_BASED
          ? milestones.map(m => {
            const isExisting = transaction.milestones?.some(old => old.id === m.id);
            return isExisting ? m : { ...m, id: undefined };
          })
          : undefined,
        refund_policy: formData.refund_policy,
        fee_config: formData.fee_config
      });

      if (response.data) {
        setSuccess('Transaction updated successfully');

        // Update the query cache
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });

        // Navigate back to transaction details after a brief delay
        setTimeout(() => {
          navigate(`/transactions/${transaction.transaction_id}`, { state: { transaction: response.data } });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(`/transactions/${transaction.transaction_id}`)}
        >
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-neutral-900">Edit Transaction</h1>
          <p className="text-neutral-600 mt-1">Update your transaction details</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 animate-slide-down">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-slide-down">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Success</h3>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Title Section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Product Details</h2>
              <p className="text-sm text-neutral-600">Update what is being transacted</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Product Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Laptop, Design Services, etc."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide details about the transaction..."
                rows={4}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Transaction Amount</h2>
              <p className="text-sm text-neutral-600">Set the payment amount</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount (GHS) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-700 font-medium">
                  ₵
                </span>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8"
                />
              </div>
              <p className="text-xs text-neutral-600 mt-2">
                Current amount: ₵{maskAmount(transaction.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contract Details Section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Contract Details</h2>
              <p className="text-sm text-neutral-600">Define how the work will be delivered</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contract Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.TIME_BASED }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.contract_type === ContractType.TIME_BASED
                    ? 'border-[#04805B] bg-[rgba(4,128,91,0.08)]'
                    : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <div className="font-semibold text-neutral-900 mb-1">Time Based</div>
                  <div className="text-xs text-neutral-500">Single delivery by a specific date</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.MILESTONE_BASED }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${formData.contract_type === ContractType.MILESTONE_BASED
                    ? 'border-[#04805B] bg-[rgba(4,128,91,0.08)]'
                    : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <div className="font-semibold text-neutral-900 mb-1">Milestone Based</div>
                  <div className="text-xs text-neutral-500">Multiple deliveries in stages</div>
                </button>
              </div>
            </div>

            {formData.contract_type === ContractType.TIME_BASED && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Completion Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="date"
                      required
                      value={formData.time_based_config?.completion_date}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        time_based_config: { ...prev.time_based_config!, completion_date: e.target.value }
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Completion Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time_based_config?.completion_time}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      time_based_config: { ...prev.time_based_config!, completion_time: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Auto-completion Buffer (Hours)
                  </label>
                  <select
                    value={formData.time_based_config?.auto_completion_buffer_hours}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      time_based_config: { ...prev.time_based_config!, auto_completion_buffer_hours: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  >
                    <option value={24}>24 Hours</option>
                    <option value={48}>48 Hours</option>
                    <option value={72}>72 Hours</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">Time after completion before funds are automatically released if no dispute is raised.</p>
                </div>
              </div>
            )}

            {formData.contract_type === ContractType.MILESTONE_BASED && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-700">Milestones</label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="text-sm text-[#04805B] font-medium hover:text-[#059268] flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </button>
                </div>

                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-neutral-200 text-neutral-700 text-xs font-bold px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Milestone Description"
                          value={milestone.description}
                          onChange={e => updateMilestone(milestone.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Percentage"
                            value={milestone.amount_percentage || ''}
                            onChange={e => updateMilestone(milestone.id, 'amount_percentage', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">%</span>
                        </div>
                      </div>
                      <div>
                        <input
                          type="date"
                          value={milestone.due_date}
                          onChange={e => updateMilestone(milestone.id, 'due_date', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Completion Condition (e.g. GitHub PR merged)"
                          value={milestone.completion_condition}
                          onChange={e => updateMilestone(milestone.id, 'completion_condition', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {milestones.length > 0 && (
                  <div className="flex justify-between text-sm px-2">
                    <span className="text-neutral-600">Total Percentage:</span>
                    <span className={`font-bold ${milestones.reduce((sum, m) => sum + (m.amount_percentage || 0), 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {milestones.reduce((sum, m) => sum + (m.amount_percentage || 0), 0)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Protection & Fees Section */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Protection & Fees</h2>
              <p className="text-sm text-neutral-600">Configure refund policy and fee handling</p>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-neutral-200">
            {/* Refund Policy */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Refund Policy
              </label>
              <select
                value={formData.refund_policy.type}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  refund_policy: { ...prev.refund_policy, type: e.target.value as RefundPolicyType }
                }))}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                <option value={RefundPolicyType.FULL_REFUND}>Full Refund Protection (100% refundable)</option>
                <option value={RefundPolicyType.CONDITIONAL_REFUND}>Conditional Refund</option>
                <option value={RefundPolicyType.PARTIAL_FIXED}>Partial Fixed Refund</option>
                <option value={RefundPolicyType.NO_REFUND}>No Refund (Non-refundable)</option>
                <option value={RefundPolicyType.CUSTOM_TERMS}>Custom Terms</option>
              </select>

              {formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <p className="text-sm text-neutral-600 mb-2">Select conditions for refund:</p>
                  {[
                    'Service not delivered by deadline',
                    'Service does not match description',
                    'Incomplete delivery',
                    'Quality standards not met'
                  ].map((condition) => (
                    <label key={condition} className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.refund_policy.conditions?.includes(condition)}
                        onChange={(e) => {
                          const currentConditions = formData.refund_policy.conditions || [];
                          const newConditions = e.target.checked
                            ? [...currentConditions, condition]
                            : currentConditions.filter(c => c !== condition);
                          setFormData(prev => ({
                            ...prev,
                            refund_policy: { ...prev.refund_policy, conditions: newConditions }
                          }));
                        }}
                        className="h-4 w-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                      />
                      <span className="text-sm text-neutral-700">{condition}</span>
                    </label>
                  ))}
                </div>
              )}

              {formData.refund_policy.type === RefundPolicyType.PARTIAL_FIXED && (
                <div className="mt-3 animate-fade-in">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Refund Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.refund_policy.refund_percentage || ''}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        refund_policy: { ...prev.refund_policy, refund_percentage: parseFloat(e.target.value) }
                      }))}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">%</span>
                  </div>
                </div>
              )}

              {formData.refund_policy.type === RefundPolicyType.CUSTOM_TERMS && (
                <div className="mt-3 animate-fade-in">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Custom Terms Description</label>
                  <textarea
                    value={formData.refund_policy.description || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      refund_policy: { ...prev.refund_policy, description: e.target.value }
                    }))}
                    placeholder="Describe the custom refund terms..."
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:border-neutral-900 focus:outline-none resize-none"
                  />
                </div>
              )}
            </div>

            {/* Fee Configuration */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Refund Processing Fee Payer
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'sender', label: 'Sender' },
                  { value: 'receiver', label: 'Receiver' },
                  { value: 'split', label: 'Split (50/50)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fee_config: { ...prev.fee_config, refund_fee_payer: option.value as any }
                    }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${formData.fee_config.refund_fee_payer === option.value
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Determines who pays the 5% processing fee if a refund occurs.
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> You can only edit the service details and amount for pending transactions. Participant information cannot be changed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/transactions/${transaction.transaction_id}`)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={
              !formData.title ||
              !formData.description ||
              formData.amount <= 0
            }
            className="flex-1"
          >
            Update Transaction
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTransaction;
