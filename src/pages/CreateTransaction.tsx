import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, DollarSign, User, FileText, ArrowLeft, Shield, Info, Plus, X, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

import { ContractType, Milestone, RefundPolicyType, RefundPolicy, FeeConfig, TransactionType } from '../types';

import { useCreateTransaction } from '../hooks/queries/useTransactions';
import { useUsers } from '../hooks/queries/useUsers';
import { apiClient } from '../utils/api';

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
  type: TransactionType;
}




const STEPS = [
  { id: 1, title: 'Role & Counterparty', description: 'Define your role and who you\'re transacting with' },
  { id: 2, title: 'Service Details', description: 'What is being provided?' },
  { id: 3, title: 'Terms & Milestones', description: 'Set deadlines and conditions' },
  { id: 4, title: 'Payment & Protection', description: 'Amounts and safety measures' },
  { id: 5, title: 'Review & Create', description: 'Review details and create transaction' },
];

const DRAFT_KEY = 'clarsix_transaction_draft';

const defaultFormData: CreateTransactionForm = {
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
    processing_fee_percentage: 3,
    fee_payer: 'split',
  },
  type: TransactionType.PHYSICAL_GOODS
};

const CreateTransaction: React.FC = () => {
  const [formData, setFormData] = useState<CreateTransactionForm>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsedFormData = JSON.parse(saved).formData;
        return {
          ...defaultFormData,
          ...parsedFormData,
          fee_config: {
            ...defaultFormData.fee_config,
            ...(parsedFormData?.fee_config || {})
          }
        };
      }
      return defaultFormData;
    } catch (e) {
      return defaultFormData;
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manualSenderEmail, setManualSenderEmail] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).manualSenderEmail : '';
    } catch (e) {
      return '';
    }
  });
  const [manualReceiverEmail, setManualReceiverEmail] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).manualReceiverEmail : '';
    } catch (e) {
      return '';
    }
  });
  const [role, setRole] = useState<'sender' | 'receiver'>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).role : 'receiver';
    } catch (e) {
      return 'receiver';
    }
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).milestones : [];
    } catch (e) {
      return [];
    }
  });
  const [furthestStep, setFurthestStep] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? (JSON.parse(saved).furthestStep || 1) : 1;
    } catch (e) {
      return 1;
    }
  });


  const [conversationId, setConversationId] = useState<string | null>(() => {
    const paramId = searchParams.get('conversation_id');
    if (paramId) return paramId;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved).conversationId : null;
    } catch (e) {
      return null;
    }
  });

  // Use React Query to fetch users with caching
  const { data: users = [] } = useUsers();
  const createTransactionMutation = useCreateTransaction();

  useEffect(() => {
    const senderId = searchParams.get('sender');
    const receiverId = searchParams.get('receiver');
    const senderEmail = searchParams.get('sender_email');
    const receiverEmail = searchParams.get('receiver_email');
    const paramConversationId = searchParams.get('conversation_id');

    if (paramConversationId) {
      setConversationId(paramConversationId);
    }

    if (senderId && users.length > 0) {
      const sender = users.find(u => u.id === parseInt(senderId));
      if (sender) {
        setManualSenderEmail(sender.email);
      }
    }
    if (senderEmail) {
      setManualSenderEmail(senderEmail);
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
    if (receiverEmail) {
      setRole('sender');
      setManualReceiverEmail(receiverEmail);
    }
  }, [searchParams, users]);

  // Save draft to localStorage whenever state changes
  useEffect(() => {
    const draft = {
      formData,
      role,
      milestones,
      manualSenderEmail,
      manualReceiverEmail,
      conversationId,
      furthestStep
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [formData, role, milestones, manualSenderEmail, manualReceiverEmail, conversationId, furthestStep]);

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
          fee_payer: formData.fee_config.fee_payer
        }
      };
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

      // Clear draft on success
      localStorage.removeItem(DRAFT_KEY);

      // Check if we need to link to a conversation
      if (conversationId && newTransactionId) {
        try {
          await apiClient.post(`/chat/conversations/${conversationId}/link-transaction`, {
            transaction_id: newTransactionId
          });
          navigate(`/chats?conversationId=${conversationId}`);
          return;
        } catch (linkError) {
          console.error('Failed to link transaction to conversation:', linkError);
          // Fallback to transaction page if linking fails, or maybe show a warning
        }
      }

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

  const validateStep = (step: number) => {
    setError('');
    switch (step) {
      case 1: return true;
      case 2:
        if (!formData.title?.trim()) { setError('Service title is required'); return false; }
        if (!formData.description?.trim()) { setError('Description is required'); return false; }
        return true;
      case 3:
        if (formData.contract_type === ContractType.TIME_BASED) {
          if (!formData.time_based_config?.completion_date || !formData.time_based_config?.completion_time) {
            setError('Completion date and time are required');
            return false;
          }
        } else {
          if (milestones.length === 0) { setError('At least one milestone is required'); return false; }
          const total = milestones.reduce((sum, m) => sum + m.amount_percentage, 0);
          if (total !== 100) { setError(`Total percentage must constitute 100% (Current: ${total}%)`); return false; }
        }
        return true;
      case 4:
        if (formData.amount <= 0) { setError('Amount must be greater than 0'); return false; }
        if (formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (!formData.refund_policy.conditions || formData.refund_policy.conditions.length === 0)) {
          setError('Please select at least one condition'); return false;
        }
        if (formData.refund_policy.type === RefundPolicyType.PARTIAL_FIXED && (!formData.refund_policy.refund_percentage || formData.refund_policy.refund_percentage <= 0 || formData.refund_policy.refund_percentage >= 100)) {
          setError('Please enter a valid refund percentage between 1 and 99'); return false;
        }
        return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(prev => {
          const next = prev + 1;
          setFurthestStep((f: number) => Math.max(f, next));
          return next;
        });
        window.scrollTo(0, 0);
      } else {
        handleSubmit({ preventDefault: () => { } } as any);
      }
    }
  };

  const handleStepClick = (targetStep: number) => {
    // Validate current step before allowing navigation
    if (validateStep(currentStep)) {
      setCurrentStep(targetStep);
      window.scrollTo(0, 0);
    }
    // If validation fails, error message will be displayed
  };


  return (
    <div className="flex bg-[var(--bg-secondary)] h-full overflow-hidden">
      {/* Sidebar - Stepper */}
      <div className="w-80 hidden lg:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-light)] overflow-y-auto">
        <div className="p-6 mb-6">
          {/* Branding or Back Button */}
          <div
            className="flex items-center gap-2 mb-6 cursor-pointer text-[var(--color-primary)] font-bold hover:opacity-80 transition-opacity"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </div>

          {/* Steps */}
          <div className="space-y-8 relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--border-light)] -z-10" />

            {STEPS.map((step) => {
              const isCompleted = furthestStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 ${isCompleted ? 'cursor-pointer' : ''}`}
                  onClick={() => isCompleted && handleStepClick(step.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10 ${isCompleted
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : isCurrent
                        ? 'bg-[var(--bg-card)] border-[var(--color-primary)] text-[var(--color-primary)]'
                        : 'bg-[var(--bg-card)] border-[var(--border-medium)] text-[var(--text-tertiary)]'
                      }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className={`transition-opacity duration-300 ${isCurrent || isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-[var(--color-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 pt-8 flex flex-col min-h-full">

          {/* Validation Error Display */}
          {error && (
            <div className="bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)] rounded-xl p-4 mb-6 flex items-center gap-3 animate-slide-down">
              <Info className="h-5 w-5 text-[var(--alert-error-text)] flex-shrink-0" />
              <p className="text-[var(--alert-error-text)] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{STEPS[currentStep - 1].title}</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-base">{STEPS[currentStep - 1].description}</p>

            <form className="space-y-6 animate-fade-in" onSubmit={(e) => e.preventDefault()}>

              {/* STEP 1: ROLE & COUNTERPARTY */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Role Selection */}
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('receiver')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 ${role === 'receiver'
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]'
                          : 'border-[var(--border-light)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]'
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-4 shadow-sm text-[var(--color-primary)]">
                          <DollarSign className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">I am Receiving Payment</h3>
                        <p className="text-sm text-[var(--text-secondary)]">You are the service provider or seller.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('sender')}
                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 ${role === 'sender'
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]'
                          : 'border-[var(--border-light)] bg-[var(--bg-card)] hover:border-[var(--border-medium)]'
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-4 shadow-sm text-[var(--color-primary)]">
                          <User className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">I am Sending Payment</h3>
                        <p className="text-sm text-[var(--text-secondary)]">You are purchasing a service or goods.</p>
                      </button>
                    </div>
                  </div>

                  {/* Counterparty Details */}
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-sm space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-light)]">
                      <div className="w-12 h-12 bg-[var(--bg-card)] rounded-full flex items-center justify-center text-xl font-bold text-[var(--color-primary)] shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Your Account</p>
                        <p className="text-base font-bold text-[var(--text-primary)]">{user?.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-light)]">
                      <h3 className="font-bold text-[var(--text-primary)] mb-4">Counterparty Details</h3>
                      {role === 'receiver' && (
                        <Input
                          label="Sender Email (Optional)"
                          name="manual_sender_email"
                          type="email"
                          value={manualSenderEmail}
                          onChange={e => setManualSenderEmail(e.target.value)}
                          placeholder="e.g. client@example.com"
                          helperText="Leave empty to generate a shareable link later."
                        />
                      )}

                      {role === 'sender' && (
                        <Input
                          label="Receiver Email (Optional)"
                          name="manual_receiver_email"
                          type="email"
                          value={manualReceiverEmail}
                          onChange={e => setManualReceiverEmail(e.target.value)}
                          placeholder="e.g. provider@example.com"
                          helperText="Leave empty to generate a shareable link later."
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SERVICE DETAILS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-sm space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Transaction Type</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: TransactionType.PHYSICAL_GOODS, label: 'Physical Goods', icon: <Package className="h-5 w-5" /> },
                          { id: TransactionType.DIGITAL_GOODS, label: 'Digital Goods', icon: <FileText className="h-5 w-5" /> },
                          { id: TransactionType.SERVICE, label: 'Service', icon: <User className="h-5 w-5" /> }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: t.id }))}
                            className={`p-4 rounded-xl font-medium transition-all duration-150 flex items-center gap-3 border ${formData.type === t.id
                              ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary)]'
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-transparent hover:bg-[var(--border-light)]'
                              }`}
                          >
                            {t.icon}
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Web Development Project"
                    />

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Description <span className="text-[var(--alert-error-text)]">*</span>
                      </label>
                      <textarea
                        name="description"
                        required
                        rows={6}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="input-field resize-none w-full"
                        placeholder="Provide a detailed description of the agreement..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: TERMS & MILESTONES */}
              {currentStep === 3 && (
                <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-sm space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      Contract Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.TIME_BASED }))}
                        className={`p-4 rounded-xl font-medium transition-all duration-150 text-left border ${formData.contract_type === ContractType.TIME_BASED
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary)]'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-transparent'
                          }`}
                      >
                        <div className="font-bold mb-1">Time-Based</div>
                        <div className="text-xs opacity-80">Full completion by a specific date</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contract_type: ContractType.MILESTONE_BASED }))}
                        className={`p-4 rounded-xl font-medium transition-all duration-150 text-left border ${formData.contract_type === ContractType.MILESTONE_BASED
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] border-[var(--color-primary)]'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-transparent'
                          }`}
                      >
                        <div className="font-bold mb-1">Milestone-Based</div>
                        <div className="text-xs opacity-80">Split into stages with partial payments</div>
                      </button>
                    </div>

                    {formData.contract_type === ContractType.TIME_BASED && (
                      <div className="space-y-4 pt-4 border-t border-[var(--border-light)] animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          helperText="Funds released if no dispute is raised within this time after completion."
                        />
                      </div>
                    )}

                    {formData.contract_type === ContractType.MILESTONE_BASED && (
                      <div className="space-y-4 pt-4 border-t border-[var(--border-light)] animate-fade-in">
                        {milestones.map((milestone, index) => (
                          <div key={milestone.id} className="p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-default)] space-y-3 relative group">
                            <button
                              type="button"
                              onClick={() => removeMilestone(milestone.id)}
                              className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--alert-error-text)] opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <h5 className="text-sm font-bold text-[var(--text-secondary)] uppercase">Milestone {index + 1}</h5>
                            <Input
                              label="Description"
                              value={milestone.description}
                              onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                              placeholder="Measureable deliverable"
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <Input
                                label="Percentage (%)"
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
                              label="Condition"
                              value={milestone.completion_condition}
                              onChange={(e) => updateMilestone(milestone.id, 'completion_condition', e.target.value)}
                              placeholder="e.g. Files uploaded"
                            />
                          </div>
                        ))}

                        <div className="flex items-center justify-between pt-2">
                          <button
                            type="button"
                            onClick={addMilestone}
                            className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline"
                          >
                            <Plus className="h-4 w-4" /> Add Another Milestone
                          </button>

                          <div className="text-sm font-medium">
                            Total: <span className={milestones.reduce((sum, m) => sum + m.amount_percentage, 0) === 100 ? 'text-[var(--amount-positive)]' : 'text-[var(--amount-negative)]'}>
                              {milestones.reduce((sum, m) => sum + m.amount_percentage, 0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT & PROTECTION */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Amount */}
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-sm">
                    <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                      Total Amount
                    </label>
                    <Input
                      label="Transaction Value (₵)"
                      name="amount"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={handleInputChange}
                      leftIcon={<span className="text-neutral-500 font-bold">₵</span>}
                      placeholder="0.00"
                      className="text-lg font-bold"
                    />
                  </div>

                  {/* Protection Policy */}
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                      <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Protection Policy
                      </label>
                    </div>

                    <div className="space-y-4">
                      <select
                        value={formData.refund_policy.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          refund_policy: { ...prev.refund_policy, type: e.target.value as RefundPolicyType }
                        }))}
                        className="input-field"
                      >
                        <option value={RefundPolicyType.FULL_REFUND}>Full Refund Protection (Recommended)</option>
                        <option value={RefundPolicyType.CONDITIONAL_REFUND}>Conditional Refund</option>
                        <option value={RefundPolicyType.PARTIAL_FIXED}>Partial Fixed Refund</option>
                        <option value={RefundPolicyType.NO_REFUND}>No Refund (Caveat Emptor)</option>
                        <option value={RefundPolicyType.CUSTOM_TERMS}>Custom Terms</option>
                      </select>

                      {formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (
                        <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                          <p className="text-sm font-medium mb-3">Select valid reasons for refund:</p>
                          <div className="space-y-2">
                            {["Service not started", "Client delays", "Quality issues", "Not as described"].map((condition) => (
                              <label key={condition} className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-[var(--color-primary)] rounded border-[var(--border-medium)] focus:ring-[var(--color-primary)]"
                                  checked={formData.refund_policy.conditions?.includes(condition) || false}
                                  onChange={(e) => {
                                    const current = formData.refund_policy.conditions || [];
                                    const newConds = e.target.checked ? [...current, condition] : current.filter(c => c !== condition);
                                    setFormData(p => ({ ...p, refund_policy: { ...p.refund_policy, conditions: newConds } }));
                                  }}
                                />
                                <span className="text-sm">{condition}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.refund_policy.type === RefundPolicyType.PARTIAL_FIXED && (
                        <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-xl animate-fade-in">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            Refund Percentage (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={formData.refund_policy.refund_percentage || ''}
                              onChange={e => setFormData(prev => ({
                                ...prev,
                                refund_policy: { ...prev.refund_policy, refund_percentage: parseFloat(e.target.value) }
                              }))}
                              placeholder="e.g. 50"
                              className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none bg-[var(--bg-card)] text-[var(--text-primary)] pr-8"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] font-medium">%</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-2">
                            Percentage of total amount returned to sender if cancelled/disputed.
                          </p>
                        </div>
                      )}

                      {/* Fee Payer Selection */}
                      <div className="pt-4 border-t border-[var(--border-light)] animate-fade-in">
                        <label className="block text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                          Fee Payer
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
                                fee_config: { ...prev.fee_config, fee_payer: option.value as any }
                              }))}
                              className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${formData.fee_config.fee_payer === option.value
                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-transparent hover:bg-[var(--border-light)]'
                                }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fee summary could go here */}
                      <div className="mt-4 pt-4 border-t border-[var(--border-light)] text-xs text-[var(--text-secondary)]">
                        <div className="flex justify-between mb-1">
                          <span>Processing Fee</span>
                          <span className="font-medium">3%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* STEP 5: SUMMARY */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">

                  {/* Service Information */}
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-tertiary)] flex justify-between items-center">
                      <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Service Details
                      </h3>
                      <button type="button" onClick={() => handleStepClick(2)} className="text-xs text-[var(--color-primary)] font-medium hover:underline">Edit</button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Title</span>
                        <p className="font-semibold text-[var(--text-primary)]">{formData.title}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Description</span>
                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{formData.description}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Category</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
                          {formData.type.replace('_', ' ')}
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
                      <button type="button" onClick={() => handleStepClick(3)} className="text-xs text-[var(--color-primary)] font-medium hover:underline">Edit</button>
                    </div>
                    <div className="p-4">
                      {/* Time Based View */}
                      {formData.contract_type === ContractType.TIME_BASED && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Completion Date</span>
                            <p className="font-medium text-[var(--text-primary)]">{formData.time_based_config?.completion_date}</p>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Completion Time</span>
                            <p className="font-medium text-[var(--text-primary)]">{formData.time_based_config?.completion_time}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Auto-Release Buffer</span>
                            <p className="text-sm text-[var(--text-primary)]">{formData.time_based_config?.auto_completion_buffer_hours} Hours after delivery</p>
                          </div>
                        </div>
                      )}

                      {/* Milestone View */}
                      {formData.contract_type === ContractType.MILESTONE_BASED && (
                        <div className="space-y-3">
                          {milestones.map((m, i) => (
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
                      <button type="button" onClick={() => handleStepClick(4)} className="text-xs text-[var(--color-primary)] font-medium hover:underline">Edit</button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-[var(--border-light)]">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Total Amount</span>
                        <span className="text-2xl font-bold text-[var(--text-primary)]">₵{formData.amount?.toFixed(2)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Refund Policy</span>
                          <p className="font-medium text-[var(--text-primary)] capitalize">{formData.refund_policy.type.replace('_', ' ').toLowerCase()}</p>

                          {formData.refund_policy.type === RefundPolicyType.PARTIAL_FIXED && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{formData.refund_policy.refund_percentage}% Refund on cancellation/dispute</p>
                          )}

                          {formData.refund_policy.type === RefundPolicyType.CONDITIONAL_REFUND && (
                            <ul className="text-xs text-[var(--text-secondary)] list-disc ml-4 mt-1">
                              {formData.refund_policy.conditions?.map(c => <li key={c}>{c}</li>)}
                            </ul>
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Parties</span>
                          <div className="text-sm">
                            <p><span className="text-[var(--text-tertiary)]">Role:</span> {role === 'sender' ? 'Sender' : 'Receiver'}</p>
                            <p><span className="text-[var(--text-tertiary)]">Counterparty:</span> {role === 'sender' ? (manualReceiverEmail || 'Pending') : (manualSenderEmail || 'Pending')}</p>
                          </div>
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-[var(--border-light)] grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Fee Configuration</span>
                            <div className="text-sm space-y-1">
                              <p><span className="text-[var(--text-tertiary)]">Processing Fee:</span> {formData.fee_config.processing_fee_percentage}%</p>
                              <p><span className="text-[var(--text-tertiary)]">Fee Payer:</span> <span className="capitalize">{formData.fee_config.fee_payer}</span></p>
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Payment Structure</span>
                            <div className="text-sm space-y-1">
                              {formData.fee_config.fee_payer === 'sender' && (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Amount:</span> <span>₵{(formData.amount || 0).toFixed(2)}</span></div>
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({formData.fee_config.processing_fee_percentage}%):</span> <span>₵{((formData.amount || 0) * (formData.fee_config.processing_fee_percentage / 100)).toFixed(2)}</span></div>
                                      <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-light)] mt-1"><span className="text-[var(--text-primary)]">Total:</span> <span>₵{((formData.amount || 0) * (1 + formData.fee_config.processing_fee_percentage / 100)).toFixed(2)}</span></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {formData.fee_config.fee_payer === 'receiver' && (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Total Payment:</span> <span>₵{(formData.amount || 0).toFixed(2)}</span></div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Receiver</p>
                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({formData.fee_config.processing_fee_percentage}%):</span> <span>₵{((formData.amount || 0) * (formData.fee_config.processing_fee_percentage / 100)).toFixed(2)}</span></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {formData.fee_config.fee_payer === 'split' && (
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Sender</p>
                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Amount:</span> <span>₵{(formData.amount || 0).toFixed(2)}</span></div>
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({(formData.fee_config.processing_fee_percentage / 2).toFixed(2).replace(/[.,]00$/, "")}%):</span> <span>₵{((formData.amount || 0) * ((formData.fee_config.processing_fee_percentage / 2) / 100)).toFixed(2)}</span></div>
                                      <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-light)] mt-1"><span className="text-[var(--text-primary)]">Total:</span> <span>₵{((formData.amount || 0) * (1 + (formData.fee_config.processing_fee_percentage / 2) / 100)).toFixed(2)}</span></div>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">Receiver</p>
                                    <div className="pl-2 border-l-2 border-[var(--border-default)]">
                                      <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Fee ({(formData.fee_config.processing_fee_percentage / 2).toFixed(2).replace(/[.,]00$/, "")}%):</span> <span>₵{((formData.amount || 0) * ((formData.fee_config.processing_fee_percentage / 2) / 100)).toFixed(2)}</span></div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[var(--border-light)]">
            {currentStep === 5 ? (
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    localStorage.removeItem(DRAFT_KEY);
                    navigate(-1);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  loading={loading}
                  className="flex-1"
                >
                  Create Transaction
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setError('');
                    setCurrentStep(p => p - 1);
                  }}
                  disabled={currentStep === 1 || loading}
                  className={currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}
                >
                  Previous Step
                </Button>

                <Button
                  onClick={handleNext}
                  loading={loading}
                  className="px-8"
                >
                  Next Step <ArrowLeft className="h-4 w-4 rotate-180 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default CreateTransaction;
