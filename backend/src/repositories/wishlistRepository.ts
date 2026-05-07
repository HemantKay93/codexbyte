import { supabase } from '../config/supabase.js';

export class WishlistRepository {
  async findByUserId(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*, product:products(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async check(userId: string, productId: string) {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    
    return !!data;
  }

  async toggle(userId: string, productId: string) {
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id);
      return false; // Not wishlisted anymore
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId });
      return true; // Wishlisted
    }
  }
}
