import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Building, DollarSign, Clock, CheckCircle, AlertCircle, Package, Phone, Mail, MapPin } from 'lucide-react';
import { Transaction, TransactionStatus } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';
import { apiClient } from '../utils/api';

const statusSteps = [
	{ key: 'joined', label: 'Both Parties Joined', icon: User },
	{ key: 'paid', label: 'Payment Made', icon: DollarSign },
	{ key: 'in_transit', label: 'Transaction In Transit', icon: Clock },
	{ key: 'delivered', label: 'Transaction Delivered', icon: Package },
	{ key: 'completed', label: 'Transaction Completed', icon: CheckCircle },
	{ key: 'disputed', label: 'Transaction Disputed', icon: AlertCircle },
	{ key: 'cancelled', label: 'Transaction Cancelled', icon: AlertCircle },
];

const getStageDetails = (transaction: Transaction, stepKey: string) => {
	switch (stepKey) {
		case 'joined':
			return `Customer and seller have both joined.`;
		case 'paid':
			return `Payment of GHS ${transaction.amount.toLocaleString("us")} received.`;
		case 'in_transit':
			return `Transaction is now in transit.`;
		case 'delivered':
			return `Client Transaction Delivered`;
		case 'completed':
			return `Transaction has been completed successfully.`;
		case 'disputed':
			return `There is a dispute regarding this transaction.`;
		case 'cancelled':
			return `Transaction has been cancelled.`;
		default:
			return '';
	}
};

const TransactionStatusTrackerPage: React.FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [transaction, setTransaction] = React.useState<Transaction | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchTransaction = async () => {
			try {
				const response = await apiClient.get<Transaction>(`/transactions/${id}`);
				setTransaction(response.data);
			} catch (error) {
				setTransaction(null);
			} finally {
				setLoading(false);
			}
		};
		fetchTransaction();
	}, [id]);

	if (loading || !transaction) {
		return (
			<div className="flex items-center justify-center h-96">
				<LoadingSpinner size="lg" text="Loading transaction tracker..." />
			</div>
		);
	}

	const currentStatus = statusSteps.find(step => step.key === transaction.status)?.label || 'Pending';
	const lastUpdated = new Date(transaction.updated_at).toLocaleString();

	return (
		<div className="max-w-5xl mx-auto py-4 sm:py-6 lg:py-10 px-3 sm:px-4 animate-fade-in">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 border border-gray-100 mb-4 sm:mb-6 lg:mb-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
					<div className="flex items-center gap-2 sm:gap-4">
						<Button variant="ghost" leftIcon={<ArrowLeft className="h-4 w-4 sm:h-6 sm:w-4" />} onClick={() => navigate(`/transactions/${transaction.transaction_id}`)} className="text-xs sm:text-sm">
							Back
						</Button>
						<div>
							<h1 className="text-2xl font-bold text-neutral-900 mb-1">Transaction Status Tracker</h1>
							<p className="text-gray-600 text-sm">Track the progress of transaction #{transaction.transaction_id}</p>
						</div>
					</div>
					<div className="text-right">
						<div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Current Status</div>
						<div className="text-lg font-bold text-green-700">{currentStatus}</div>
						<div className="text-xs text-neutral-500 mt-1">Last updated: {new Date(transaction.updated_at).toLocaleDateString()}</div>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Left: Customer & Seller Info */}
				<Card className="h-fit">
					<CardContent className="p-8 space-y-6">
						<div>
							<h2 className="text-lg font-bold text-neutral-900 mb-2">Customer Name</h2>
							<p className="text-neutral-700">{transaction.sender?.name}</p>
						</div>
						<div>
							<h2 className="text-lg font-bold text-neutral-900 mb-2">Customer Contact</h2>
							<p className="text-neutral-700 flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> {transaction.sender?.contact}</p>
						</div>
						<div>
							<h2 className="text-lg font-bold text-neutral-900 mb-2">Delivery Address</h2>
							<p className="text-neutral-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-neutral-400" /> {transaction.sender?.location}</p>
						</div>
						<div>
							<h2 className="text-lg font-bold text-neutral-900 mb-2">Seller Name</h2>
							<p className="text-neutral-700">{transaction.receiver?.name}</p>
						</div>
						<div>
							<h2 className="text-lg font-bold text-neutral-900 mb-2">Seller Support</h2>
							<p className="text-neutral-700 flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> {transaction.receiver?.contact}</p>
							<p className="text-neutral-700 flex items-center gap-2"><Mail className="h-4 w-4 text-neutral-400" /> {transaction.receiver?.email}</p>
						</div>
					</CardContent>
				</Card>

				{/* Right: Status & Timeline */}
				<Card>
					<CardContent className="p-8">
						<div className="flex items-center justify-between mb-6">
							<div>
								<div className="text-xs font-semibold text-neutral-500">Tracking No.</div>
								<div className="text-lg font-bold text-primary-700">#{transaction.transaction_id}</div>
							</div>
						</div>
						<div className="mb-8">
							<div className="text-xs font-semibold text-neutral-500">Your transaction is</div>
							<div className="text-3xl font-bold text-green-700 mb-2">{currentStatus}</div>
							<div className="text-sm text-neutral-600">Last updated on {lastUpdated}</div>
						</div>
						<div className="mb-8">
							<div className="text-sm font-semibold text-neutral-700 mb-3">Transaction Progress</div>
							<div className="flex flex-col gap-0 relative">
								{statusSteps.map((step, idx) => {
									const Icon = step.icon;
									const isActive = (() => {
										if (step.key === 'joined') return true;
										if (step.key === 'paid') return transaction.status === 'paid' || transaction.status === 'intransit' || transaction.status === 'delivered' || transaction.status === 'completed';
										if (step.key === 'in_transit') return transaction.status === 'intransit' || transaction.status === 'delivered' || transaction.status === 'completed';
										if (step.key === 'delivered') return transaction.status === 'delivered' || transaction.status === 'completed';
										if (step.key === 'completed') return transaction.status === 'completed';
										if (step.key === 'disputed') return transaction.status === 'disputed';
										if (step.key === 'cancelled') return transaction.status === 'cancelled';
										return false;
									})();
									return (
										<div key={step.key} className="flex items-start gap-4 relative">
											<div className="flex flex-col items-center">
												<div className={`rounded-full p-2 ${isActive ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'} shadow-lg`}>
													<Icon className="h-6 w-6" />
												</div>
												{idx < statusSteps.length - 1 && (
													<div className={`w-1 h-12 ${isActive ? 'bg-primary-400' : 'bg-neutral-200'} mx-auto`} />
												)}
											</div>
											<div className="py-2">
												<div className={`font-semibold text-lg ${isActive ? 'text-primary-700' : 'text-neutral-500'}`}>{step.label}</div>
												<div className="text-sm text-neutral-700 mt-1 max-w-md">
													{getStageDetails(transaction, step.key)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default TransactionStatusTrackerPage;
