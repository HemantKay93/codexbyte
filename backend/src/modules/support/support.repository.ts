import { getAdminClient } from '../../config/supabase.js';

export class SupportRepository {
  async findAll() {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('support_tickets')
      .select(
        `
        *,
        user:user_id (
          full_name
        )
      `
      )
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByUserId(userId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('support_tickets')
      .select(
        `
        *,
        user:user_id (
          full_name
        ),
        messages:support_messages (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data: ticket, error } = await admin
      .from('support_tickets')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  // eslint-disable-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any) {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = await getAdminClient();
    const { data: ticket, error } = await admin
      .from('support_tickets')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }
}
