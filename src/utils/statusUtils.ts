import { TransactionType } from '../types';

export const getTransactionTypeStyles = (type: TransactionType | string | undefined) => {
    const typeStr = type || TransactionType.PHYSICAL_GOODS;

    switch (typeStr) {
        case TransactionType.PHYSICAL_GOODS:
            return {
                bg: 'bg-blue-50 dark:bg-blue-900/30',
                text: 'text-blue-600 dark:text-blue-400',
                border: 'border-blue-100 dark:border-blue-800',
                label: 'Physical Goods',
                shortLabel: 'PHYSICAL'
            };
        case TransactionType.DIGITAL_GOODS:
            return {
                bg: 'bg-purple-50 dark:bg-purple-900/30',
                text: 'text-purple-600 dark:text-purple-400',
                border: 'border-purple-100 dark:border-purple-800',
                label: 'Digital Goods',
                shortLabel: 'DIGITAL'
            };
        case TransactionType.SERVICE:
            return {
                bg: 'bg-amber-50 dark:bg-amber-900/30',
                text: 'text-amber-600 dark:text-amber-400',
                border: 'border-amber-100 dark:border-amber-800',
                label: 'Service',
                shortLabel: 'SERVICE'
            };
        default:
            return {
                bg: 'bg-gray-50 dark:bg-gray-800/30',
                text: 'text-gray-600 dark:text-gray-400',
                border: 'border-gray-100 dark:border-gray-700',
                label: typeof typeStr === 'string' ? typeStr.replace(/_/g, ' ') : 'Unknown',
                shortLabel: typeof typeStr === 'string' ? typeStr.split('_')[0] : 'UNKNOWN'
            };
    }
};
