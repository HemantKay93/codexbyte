import React, { useEffect, useState } from 'react';
import { useUserStore } from '@byteevolvr/store';
import { UserService, OrderService } from '@byteevolvr/api-client';
import { Card, Badge, Button } from '@byteevolvr/ui';
import {
  Package,
  User,
  MapPin,
  LogOut,
  Edit2,
  Save,
  Plus,
  Trash2,
  Phone,
  X,
  Printer,
  Truck,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { printInvoice, formatPrice } from '@byteevolvr/ui';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  color: '#8B9BB8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export function DashboardPage() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    line_1: '',
    line_2: '',
    city: '',
    state: '',
    postal_code: '',
    address_type: 'home',
    is_default: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) fetchData();

    // Real-time updates: Poll for data every 10 seconds if page is visible
    const interval = setInterval(() => {
      if (user && document.visibilityState === 'visible') {
        fetchData(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, location.key]);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const results = await Promise.allSettled([
        UserService.getProfile(),
        OrderService.getOrders(),
        UserService.getAddresses(),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value) {
        setProfile(results[0].value);
        setFullName(results[0].value.full_name || '');
      }

      if (results[1].status === 'fulfilled' && results[1].value) {
        setOrders(results[1].value);
      }

      if (results[2].status === 'fulfilled' && results[2].value) {
        setAddresses(results[2].value);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (!isSilent) alert('Failed to connect to the server.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await UserService.updateProfile({ full_name: fullName });
      setProfile(updated);
      setEditingProfile(false);
    } catch (error) {
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const openAddressForm = (addr?: any) => {
    if (addr) {
      setEditingAddress(addr);
      setAddressForm({
        full_name: addr.full_name,
        phone: addr.phone,
        line_1: addr.line_1,
        line_2: addr.line_2 || '',
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        address_type: addr.address_type,
        is_default: addr.is_default,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        full_name: profile?.full_name || '',
        phone: '',
        line_1: '',
        line_2: '',
        city: '',
        state: '',
        postal_code: '',
        address_type: 'home',
        is_default: addresses.length === 0,
      });
    }
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      if (editingAddress) {
        await UserService.updateAddress(editingAddress.id, addressForm);
      } else {
        await UserService.addAddress(addressForm);
      }
      await fetchData();
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      alert('Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await UserService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (error) {
      alert('Failed to delete address.');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/shop');
  };

  const handlePrintInvoice = async (order: any) => {
    try {
      const items = await OrderService.getOrderItems(order.id);
      printInvoice(order, items);
    } catch (err) {
      console.error('Print failed:', err);
      alert('Could not generate invoice.');
    }
  };

  return (
    <div className="min-h-screen bg-[#04080F] text-white p-6 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">My Account</h1>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="border border-white/10 text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="bg-[#070D1A] border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent">
                  {(fullName || user?.email || 'C')[0].toUpperCase()}
                </div>
                <div>
                  {editingProfile ? (
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: 15, fontWeight: 600 }}
                      placeholder="Your full name"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-bold text-lg">{profile?.full_name || 'Customer'}</h3>
                  )}
                  <p className="text-sm text-brand-muted">{user?.email}</p>
                </div>
              </div>

              {editingProfile ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Save size={14} /> {savingProfile ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setFullName(profile?.full_name || '');
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingProfile(true)}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '8px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ccc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Edit2 size={14} /> Edit Name
                </button>
              )}
            </Card>

            {/* Addresses Card */}
            <Card className="bg-[#070D1A] border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-brand-muted" size={18} />
                  <h3 className="font-bold">Addresses</h3>
                </div>
                <button
                  onClick={() => openAddressForm()}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: 'rgba(59,123,248,0.15)',
                    color: '#3b7bf8',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              {loading ? (
                <p className="text-sm text-brand-muted">Loading...</p>
              ) : addresses.length === 0 ? (
                <p className="text-sm text-brand-muted italic">No addresses saved yet.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {addr.full_name}{' '}
                            {addr.is_default && (
                              <span
                                style={{
                                  fontSize: 10,
                                  background: 'rgba(59,123,248,0.2)',
                                  color: '#3b7bf8',
                                  padding: '1px 5px',
                                  borderRadius: 3,
                                }}
                              >
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-brand-muted">{addr.line_1}</p>
                          <p className="text-xs text-brand-muted">
                            {addr.city}, {addr.state} - {addr.postal_code}
                          </p>
                          <p className="text-xs text-brand-muted flex items-center gap-1 mt-1">
                            <Phone size={10} /> {addr.phone}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openAddressForm(addr)}
                            style={{
                              padding: 4,
                              borderRadius: 6,
                              background: 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: '#ccc',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            style={{
                              padding: 4,
                              borderRadius: 6,
                              background: 'rgba(255,75,75,0.1)',
                              border: 'none',
                              color: '#ff4b4b',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Orders Section */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Package /> Order History
            </h2>
            {loading ? (
              <p className="text-brand-muted">Loading orders...</p>
            ) : orders.length === 0 ? (
              <Card className="bg-[#070D1A] border border-white/10 p-8 text-center">
                <p className="text-brand-muted mb-4">You haven't placed any orders yet.</p>
                <Button variant="primary" onClick={() => navigate('/shop')}>
                  Start Shopping
                </Button>
              </Card>
            ) : (
              orders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-[#070D1A] border border-white/10 p-6 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
                    <div>
                      <p className="text-sm text-brand-muted">Order #{order.order_number}</p>
                      <p className="text-xs text-brand-muted">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'delivered' ? 'success' : 'primary'}>
                        {order.status.toUpperCase()}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePrintInvoice(order)}
                        className="flex items-center gap-2"
                      >
                        <Printer className="h-4 w-4" /> Invoice
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/shop/track/${order.tracking_number || order.id}`)}
                      >
                        Track
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span>{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center font-bold">
                    <span>Total Amount</span>
                    <span className="text-accent">{formatPrice(order.total_amount)}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifySelf: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#070D1A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: 36,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setShowAddressForm(false)}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: '#ccc',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleSaveAddress}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
            >
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.full_name}
                  onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                  placeholder="Recipient full name"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address Line 1 *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.line_1}
                  onChange={(e) => setAddressForm({ ...addressForm, line_1: e.target.value })}
                  placeholder="House/Flat no., Street name"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address Line 2</label>
                <input
                  style={inputStyle}
                  value={addressForm.line_2}
                  onChange={(e) => setAddressForm({ ...addressForm, line_2: e.target.value })}
                  placeholder="Landmark, Area (optional)"
                />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input
                  required
                  style={inputStyle}
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                  placeholder="400001"
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  style={{ ...inputStyle }}
                  value={addressForm.address_type}
                  onChange={(e) => setAddressForm({ ...addressForm, address_type: e.target.value })}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="default-addr"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                />
                <label
                  htmlFor="default-addr"
                  style={{ fontSize: 14, color: '#ccc', cursor: 'pointer' }}
                >
                  Set as default address
                </label>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={savingAddress}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 15,
                  }}
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 15,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
