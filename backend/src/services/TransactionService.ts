import { TransactionModel } from '../models/TransactionModel';
import { CustomerModel } from '../models/CustomerModel';
import { ServiceModel } from '../models/ServiceModel';
import { DocumentTrackingModel } from '../models/DocumentTrackingModel';
import { PriceCalculation } from '../utils/calculations';
import { Transaction } from '../types';

export class TransactionService {
  static async createTransaction(
    bureauId: string,
    customerId: string | null,
    customerData: { name: string; phone: string; email?: string; vehicle_number?: string } | null,
    serviceId: string,
    paymentMethod: string = 'CASH',
  ): Promise<{ transaction: any; trackingToken: string }> {
    const service = await ServiceModel.findById(serviceId, bureauId);
    if (!service) {
      throw new Error('Service not found');
    }

    let customer = null;

    if (customerId) {
      customer = await CustomerModel.findById(customerId, bureauId);
      if (!customer) {
        throw new Error('Customer not found');
      }
    } else if (customerData) {
      const existingCustomer = await CustomerModel.findByPhone(bureauId, customerData.phone);
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        customer = await CustomerModel.create(
          bureauId,
          customerData.name,
          customerData.phone,
          customerData.email,
          customerData.vehicle_number,
        );
      }
    }

    if (!customer) {
      throw new Error('Customer information required');
    }

    const pricing = PriceCalculation.calculateFinalPrice(service.base_price, service.margin_percentage);

    const transaction = await TransactionModel.create(
      bureauId,
      customer.id,
      serviceId,
      pricing.basePrice,
      pricing.marginAmount,
      pricing.finalPrice,
      paymentMethod,
    );

    if (!transaction) {
      throw new Error('Failed to create transaction');
    }

    const tracking = await DocumentTrackingModel.create(transaction.id, bureauId, customer.id);
    const trackingToken = tracking?.tracking_token || '';

    return {
      transaction: await TransactionModel.findById(transaction.id, bureauId),
      trackingToken,
    };
  }

  static async getTransaction(id: string, bureauId: string): Promise<any> {
    const transaction = await TransactionModel.findById(id, bureauId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction;
  }

  static async listTransactions(
    bureauId: string,
    limit: number = 20,
    offset: number = 0,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const transactions = await TransactionModel.list(bureauId, limit, offset, status, startDate, endDate);
    const totalCount = await TransactionModel.count(bureauId);

    return {
      data: transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async updateStatus(id: string, bureauId: string, status: string): Promise<Transaction> {
    const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const transaction = await TransactionModel.updateStatus(id, bureauId, status);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  static async getDailyRevenue(bureauId: string, date: Date): Promise<any> {
    const revenue = await TransactionModel.dailyTotal(bureauId, date);
    return {
      date,
      transaction_count: revenue.transaction_count || 0,
      total_revenue: revenue.total_revenue || 0,
      total_margin: revenue.total_margin || 0,
    };
  }
}
