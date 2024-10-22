import { Transaction, TransactionsFilterValues } from '@/types/transaction';
import axiosInstance from './axiosInstance';
import { APIPaginatedResponse, APIResponse } from '@/types/api-response';
import { TransactionFormValues } from '@/components/forms/AddTransactionForm';
import { UpdateTransactionAmountFormValues } from '@/components/forms/UpdateTransactionAmountForm';

export const fetchTransactions = async (
	filters: TransactionsFilterValues,
	page: number = 1,
	pageSize: number = 50
): Promise<APIPaginatedResponse<Transaction[]> | undefined> => {
	try {
		let url = `/transaction?page=${page}&pageSize=${pageSize}`;
		// if (filters.search) url = url + `&search=${filters.search}`;
		if (filters.course) url += `&course=${filters.course}`;
		if (filters.date) url += `&date=${filters.date.toISOString()}`;
		if (filters.category) url += `&category=${filters.category}`;
		if (filters.status !== undefined) url += `&status=${filters.status}`;
		if (filters.period) url += `&period=${filters.period}`;

		const { data } = await axiosInstance.get<
			APIPaginatedResponse<Transaction[]>
		>(url);

		return data;
	} catch (err: any) {
		console.error('Failed to fetch transaction', err);
	}
};

export const submitTransactionForm = async (
	formData: TransactionFormValues
): Promise<APIResponse<Transaction> | undefined> => {
	try {
		const { data } = await axiosInstance.post('/transaction', formData);

		return data;
	} catch (err: any) {
		console.error('Failed to submit add transaction form', err);
	}
};

export const submitUpdateTransactionForm = async (
	transactionID: string,
	formData: TransactionFormValues
): Promise<APIResponse<Transaction> | undefined> => {
	try {
		const { data } = await axiosInstance.put(
			`/transaction/${transactionID}`,
			formData
		);

		return data;
	} catch (err: any) {
		console.error('Failed to submit update transaction form', err);
	}
};

export const fetchTransactionByID = async (
	transactionID: string | undefined
): Promise<Transaction | undefined> => {
	try {
		const { data } = await axiosInstance.get(`/transaction/${transactionID}`);

		return data.data;
	} catch (err: any) {
		console.error(`Failed to fetch transaction with ID ${transactionID}`, err);
	}
};

export const submitUpdateTransactionAmountForm = async (
	transactionID: string,
	formData: UpdateTransactionAmountFormValues
): Promise<APIResponse<Transaction> | undefined> => {
	try {
		const { data } = await axiosInstance.put(
			`/transaction/${transactionID}/amount`,
			formData
		);

		return data;
	} catch (err: any) {
		console.error(
			`Failed to submit transaction amount update with ID ${transactionID}`,
			err
		);
	}
};

export const requestDeleteTransaction = async (
	transactionID: string
): Promise<APIResponse<Transaction> | undefined> => {
	try {
		const { data } = await axiosInstance.delete(
			`/transaction/${transactionID}`
		);

		return data;
	} catch (err: any) {
		console.error('Failed to send request on delete transaction', err);
	}
};
