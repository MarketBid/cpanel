import React from 'react';
import { Transaction, TransactionStatus } from '../types';
import { Users, Lock, Truck, CheckCircle, MoveRight } from 'lucide-react';

interface TransactionStatusTrackerProps {
  transaction: Transaction;
}

const TransactionStatusTracker: React.FC<TransactionStatusTrackerProps> = ({ transaction }) => {
  const steps = [
    {
      name: 'Both Parties Joined',
      icon: Users,
      isComplete: () => transaction.sender_id != null && transaction.receiver_id != null,
    },
    {
      name: 'Funds in Clarsix Hold',
      icon: Lock,
      isComplete: () => [
        TransactionStatus.PAID,
        TransactionStatus.IN_TRANSIT,
        TransactionStatus.DELIVERED,
        TransactionStatus.COMPLETED,
      ].includes(transaction.status),
    },
    {
      name: 'In Transit',
      icon: MoveRight,
      isComplete: () => [
        TransactionStatus.IN_TRANSIT,
        TransactionStatus.DELIVERED,
        TransactionStatus.COMPLETED,
      ].includes(transaction.status),
    },
    {
      name: 'Transaction Delivered',
      icon: Truck,
      isComplete: () => [TransactionStatus.DELIVERED, TransactionStatus.COMPLETED].includes(transaction.status),
    },
    {
      name: 'Funds Released',
      icon: CheckCircle,
      isComplete: () => transaction.status === TransactionStatus.COMPLETED,
    },
  ];

  const currentStepIndex = steps.findIndex(step => !step.isComplete());

  return (
    <div className="card p-6">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-start justify-between max-w-3xl mx-auto">
          {steps.map((step, stepIdx) => {
            const isComplete = step.isComplete();
            const isCurrent = stepIdx === currentStepIndex;

            return (
              <li key={step.name} className="relative flex flex-col items-center flex-1">
                {stepIdx !== 0 && (
                  <div
                    className={`absolute left-0 right-0 h-[2px] top-5 -translate-y-1/2 w-[calc(100%-2.5rem)] -translate-x-1/2 transition-colors ${
                      isComplete ? 'bg-[#04805B]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                )}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 flex items-center justify-center rounded-full transition-all mb-3
                    ${isComplete ? 'bg-[#04805B]' : isCurrent ? 'bg-white border-2 border-[#04805B]' : 'bg-[#F3F4F6]'}
                  `}>
                    <step.icon
                      className={`w-5 h-5 transition-colors ${
                        isComplete
                          ? 'text-white'
                          : isCurrent
                            ? 'text-[#04805B]'
                            : 'text-[#9CA3AF]'
                        }`}
                    />
                  </div>
                  <div className="h-12 flex items-start justify-center">
                    <p className={`
                      text-sm font-medium text-center max-w-[120px] transition-colors leading-tight
                      ${isComplete ? 'text-[#04805B]' :
                        isCurrent ? 'text-[#04805B]' :
                          'text-[#6B7280]'
                      }
                    `}>
                      {step.name}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default TransactionStatusTracker;