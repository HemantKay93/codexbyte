import { AppError } from '../../middlewares/error.js';

import { getAdminClient } from '../../config/supabase.js';

export class Customer360Service {
  async getCustomer360Profile(tenantId: string, customerId: string) {
    const admin = await getAdminClient();

    // 1. Fetch Core Customer Details
    const { data: customerData, error: customerErr } = await admin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('tenant_id', tenantId)
      .single();
    if (customerErr || !customerData) throw new AppError('Customer not found', 404);

    // 2. Fetch Customer Metrics (Health, LTV)
    const { data: metricsData } = await admin
      .from('customer_metrics')
      .select('*')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId)
      .single();
    const metrics = metricsData || { health_score: 100, lifetime_value: 0, open_invoices_amount: 0, total_refunds: 0 };

    // 3. Fetch Timeline Events
    const { data: timelineData } = await admin
      .from('customer_timeline_events')
      .select('*')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId)
      .order('occurred_at', { ascending: false })
      .limit(50);
    const timeline = timelineData || [];

    // 4. Fetch Support Summary (Tickets)
    const { data: supportData } = await admin
      .from('support_tickets')
      .select('status')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId);
    
    const supportSummary = (supportData || []).reduce((acc: any, row: any) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, {});

    // 5. Fetch Open Deals
    const { data: dealsData } = await admin
      .from('crm_deals')
      .select('id, title, value, crm_stages(name)')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    const openDeals = (dealsData || []).map((d: any) => ({
      ...d,
      stage_name: d.crm_stages?.name
    }));

    return {
      customer: customerData,
      metrics,
      supportSummary,
      timeline,
      openDeals
    };
  }
}
