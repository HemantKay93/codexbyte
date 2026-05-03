import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@byteevolvr/ui';
import { User, MapPin, Phone, Mail, Save, Plus, Trash2, Edit2 } from 'lucide-react';

export function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile edit state
  const [fullName, setFullName] = useState('');
  
  // Address modal/form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressFormData, setAddressFormData] = useState({
    full_name: '',
    phone: '',
    line_1: '',
    line_2: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'home',
    is_default: false
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
      }

      // Fetch addresses
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      setAddresses(addrData || []);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update({ ...addressFormData })
          .eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert([{ ...addressFormData, user_id: user.id }]);
        if (error) throw error;
      }
      
      await fetchProfileData();
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Error saving address:', err);
      alert('Failed to save address.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <div style={{ padding: 80, textAlign: 'center' }}>Please sign in to view your profile.</div>;

  return (
    <main style={{ padding: '80px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>Account Settings</h1>
        <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
          Member since {new Date(profile?.created_at).toLocaleDateString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40 }}>
        {/* Sidebar */}
        <aside>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, position: 'sticky', top: 120 }}>
            <div style={{ width: 80, height: 80, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>
              {fullName[0]?.toUpperCase() || <User size={40} />}
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 4 }}>{fullName || 'Customer'}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>{user.email}</p>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer' }}>Personal Info</button>
              <button style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 12, background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Orders History</button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Basic Info */}
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <User size={20} color="var(--color-primary)" /> Basic Information
            </h2>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--color-text-muted)' }}>Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--color-text-muted)' }}>Email Address</label>
                <input 
                  type="email" 
                  value={user.email}
                  disabled
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)', color: '#666', cursor: 'not-allowed' }}
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                disabled={saving}
                style={{ alignSelf: 'flex-start', padding: '12px 32px', borderRadius: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Addresses */}
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <MapPin size={20} color="var(--color-primary)" /> Saved Addresses
              </h2>
              <button 
                onClick={() => {
                  setEditingAddress(null);
                  setAddressFormData({
                    full_name: profile.full_name,
                    phone: '',
                    line_1: '',
                    line_2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    address_type: 'home',
                    is_default: addresses.length === 0
                  });
                  setShowAddressForm(true);
                }}
                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} /> Add New
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {addresses.map((addr) => (
                <div key={addr.id} style={{ padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{addr.full_name}</span>
                      {addr.is_default && <span style={{ fontSize: 10, background: 'rgba(59, 123, 248, 0.2)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Default</span>}
                      <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', color: '#999', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>{addr.address_type}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 2 }}>{addr.line_1}, {addr.line_2 && addr.line_2}</p>
                    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>{addr.city}, {addr.state} - {addr.postal_code}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-subtle)' }}>
                      <Phone size={14} /> {addr.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={() => {
                        setEditingAddress(addr);
                        setAddressFormData({
                          full_name: addr.full_name,
                          phone: addr.phone,
                          line_1: addr.line_1,
                          line_2: addr.line_2,
                          city: addr.city,
                          state: addr.state,
                          postal_code: addr.postal_code,
                          address_type: addr.address_type,
                          is_default: addr.is_default
                        });
                        setShowAddressForm(true);
                      }}
                      style={{ padding: 8, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}
                    ><Edit2 size={16} /></button>
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{ padding: 8, borderRadius: 8, border: 'none', background: 'rgba(255,75,75,0.1)', color: '#ff4b4b', cursor: 'pointer' }}
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No addresses saved yet.</div>}
            </div>
          </section>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#0A0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: 40, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 24, marginBottom: 32 }}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSaveAddress} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Full Name</label>
                <input required type="text" value={addressFormData.full_name} onChange={e => setAddressFormData({...addressFormData, full_name: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Phone Number</label>
                <input required type="text" value={addressFormData.phone} onChange={e => setAddressFormData({...addressFormData, phone: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Address Line 1</label>
                <input required type="text" value={addressFormData.line_1} onChange={e => setAddressFormData({...addressFormData, line_1: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Address Line 2 (Optional)</label>
                <input type="text" value={addressFormData.line_2} onChange={e => setAddressFormData({...addressFormData, line_2: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>City</label>
                <input required type="text" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>State</label>
                <input required type="text" value={addressFormData.state} onChange={e => setAddressFormData({...addressFormData, state: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Pincode</label>
                <input required type="text" value={addressFormData.postal_code} onChange={e => setAddressFormData({...addressFormData, postal_code: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#999' }}>Type</label>
                <select value={addressFormData.address_type} onChange={e => setAddressFormData({...addressFormData, address_type: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={addressFormData.is_default} onChange={e => setAddressFormData({...addressFormData, is_default: e.target.checked})} id="default-check" />
                <label htmlFor="default-check">Set as default address</label>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'var(--color-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Address'}</button>
                <button type="button" onClick={() => setShowAddressForm(false)} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
