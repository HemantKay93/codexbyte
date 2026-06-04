import axios from 'axios';

import logger from '../../../services/logger.js';

export class ShiprocketProvider {
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  private token: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private email: string,
    private password: string
  ) {}

  private async authenticate() {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.email,
        password: this.password,
      });
      this.token = response.data.token;
      // Tokens usually valid for 10 days, refresh after 9 days to be safe
      this.tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
      return this.token;
    } catch (error) {
      logger.error('Shiprocket authentication failed', error);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  async createShipment(orderData: any) {
    const token = await this.authenticate();

    // Transform system order format to Shiprocket format
    const payload = {
      order_id: orderData.order_number,
      order_date: new Date(orderData.created_at).toISOString().split('T')[0],
      pickup_location: orderData.warehouse_name || 'Primary Warehouse',
      channel_id: '',
      comment: 'Standard Shipping',
      billing_customer_name: orderData.customer.first_name,
      billing_last_name: orderData.customer.last_name,
      billing_address: orderData.shipping_address.street,
      billing_city: orderData.shipping_address.city,
      billing_pincode: orderData.shipping_address.zip,
      billing_state: orderData.shipping_address.state,
      billing_country: orderData.shipping_address.country,
      billing_email: orderData.customer.email,
      billing_phone: orderData.customer.phone,
      shipping_is_billing: true,
      order_items: orderData.items.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: orderData.payment_method === 'cod' ? 'COD' : 'Prepaid',
      sub_total: orderData.total_amount,
      length: orderData.package_length || 10,
      breadth: orderData.package_breadth || 10,
      height: orderData.package_height || 10,
      weight: orderData.package_weight || 1,
    };

    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        provider_order_id: response.data.order_id,
        shipment_id: response.data.shipment_id,
        status: response.data.status,
      };
    } catch (error: any) {
      logger.error('Failed to create Shiprocket order', error.response?.data || error);
      throw new Error('Shipping provider integration failed');
    }
  }

  async trackShipment(shipmentId: string) {
    const token = await this.authenticate();
    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/shipment/${shipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const trackingData = response.data.tracking_data;

      // Map provider status to system status
      return this.mapStatus(trackingData.track_status);
    } catch (error) {
      logger.error(`Failed to track shipment ${shipmentId}`, error);
      return null;
    }
  }

  private mapStatus(providerStatus: number): string {
    // 0: NA, 1: AWBAssigned, 2: InTransit, 3: OutForDelivery, 4: Delivered, 5: Cancelled, 6: RTO
    switch (providerStatus) {
      case 1:
        return 'shipped';
      case 2:
        return 'in_transit';
      case 3:
        return 'out_for_delivery';
      case 4:
        return 'delivered';
      case 5:
        return 'cancelled';
      case 6:
        return 'rto_initiated';
      default:
        return 'pending';
    }
  }
}
