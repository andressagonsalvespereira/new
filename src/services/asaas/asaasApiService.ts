
import axios from 'axios';
import { getAsaasConfig } from './asaasDatabase';
import { 
  AsaasCustomer, 
  AsaasPayment, 
  AsaasPaymentResponse, 
  AsaasPixQrCodeResponse 
} from '@/types/asaas';

class AsaasApiService {
  private getSandboxUrl() {
    return 'https://sandbox.asaas.com/api/v3';
  }

  private getProductionUrl() {
    return 'https://www.asaas.com/api/v3';
  }

  private async getApiKey(isSandbox: boolean) {
    const config = await getAsaasConfig();
    return isSandbox 
      ? config.sandboxApiKey || '' 
      : config.productionApiKey || '';
  }

  private getBaseUrl(isSandbox: boolean) {
    return isSandbox ? this.getSandboxUrl() : this.getProductionUrl();
  }

  private async getHeaders(isSandbox: boolean) {
    const apiKey = await this.getApiKey(isSandbox);
    return {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    };
  }

  /**
   * Creates a customer in Asaas
   */
  async createCustomer(customer: AsaasCustomer, isSandbox: boolean): Promise<any> {
    try {
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/customers`,
        customer,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Creates a payment in Asaas
   */
  async createPayment(payment: AsaasPayment, isSandbox: boolean): Promise<AsaasPaymentResponse> {
    try {
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.post(
        `${this.getBaseUrl(isSandbox)}/payments`,
        payment,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Gets the PIX QR code for a payment
   */
  async getPixQrCode(paymentId: string, isSandbox: boolean): Promise<AsaasPixQrCodeResponse> {
    try {
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}/pixQrCode`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting PIX QR code:', error);
      throw error;
    }
  }

  /**
   * Checks the payment status
   */
  async checkPaymentStatus(paymentId: string, isSandbox: boolean): Promise<AsaasPaymentResponse> {
    try {
      const headers = await this.getHeaders(isSandbox);
      const response = await axios.get(
        `${this.getBaseUrl(isSandbox)}/payments/${paymentId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}

export default new AsaasApiService();
