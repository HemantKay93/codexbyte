import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button } from '@byteevolvr/ui';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  UploadCloud,
  X,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { ProductService } from '@byteevolvr/api-client';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    sku: '',
    stock_quantity: '0',
    category: 'Electronics',
    brand: '',
    status: 'active' as 'active' | 'draft' | 'out_of_stock',
    image_url: '',
    images: [] as string[],
    variants: [] as any[],
    // eslint-disable-line @typescript-eslint/no-explicit-any
    slug: '',
    tags: '',
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        // eslint-disable-line complexity
        setLoading(true);
        try {
          const product = await ProductService.getProduct(id);
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            original_price: product.original_price?.toString() || '',
            sku: product.sku || '',
            stock_quantity: product.stock_quantity?.toString() || '0',
            category: product.category || 'Electronics',
            brand: product.brand || '',
            status: product.status || 'active',
            image_url: product.image_url || '',
            images: (product as any).images || [],
            // eslint-disable-line @typescript-eslint/no-explicit-any
            variants: (product as any).variants || [],
            // eslint-disable-line @typescript-eslint/no-explicit-any
            slug: (product as any).slug || '',
            // eslint-disable-line @typescript-eslint/no-explicit-any
            tags: (product as any).tags?.join(', ') || '',
            // eslint-disable-line @typescript-eslint/no-explicit-any
          });
        } catch (err: any) {
          // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          setError('Failed to load product details.');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
      // eslint-disable-line @typescript-eslint/no-floating-promises
    }
  }, [id]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isPrimary: boolean,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await ProductService.uploadImage(file);
      if (isPrimary) {
        setFormData({ ...formData, image_url: url });
      } else if (index !== undefined) {
        const newImages = [...formData.images];
        newImages[index] = url;
        setFormData({ ...formData, images: newImages });
      }
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      setError('Product Name and Price are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        slug: formData.slug || undefined,
        tags: formData.tags
          ? formData.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (id) {
        await ProductService.updateProduct(id, payload as any);
        // eslint-disable-line @typescript-eslint/no-explicit-any
      } else {
        await ProductService.createProduct(payload as any);
        // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      setSuccess(true);
      setTimeout(() => navigate('/products'), 1500);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.customMessage || 'An error occurred while saving the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="sticky top-0 bg-[var(--color-bg)]/90 backdrop-blur-md z-30 py-4 border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-display-sm font-semibold text-on-background">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/products')}>
            Discard
          </Button>
          <Button className="gap-2 min-w-[140px]" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {success ? 'Saved!' : id ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error/10 border border-error text-error rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/10 border border-success text-success rounded-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Product successfully {id ? 'updated' : 'created'}! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">General Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Product Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Wireless Noise Cancelling Headphones"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  SEO Slug (Optional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. wireless-headphones-pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Description
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  placeholder="Write a detailed product description..."
                ></textarea>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-surface">Media</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-on-surface">
                  Primary Image URL
                </label>
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 border border-outline rounded-lg overflow-hidden bg-surface-container">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-on-surface-variant">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <input
                      type="file"
                      id="primary-image"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                    <label
                      htmlFor="primary-image"
                      className="flex items-center gap-2 px-4 h-10 border border-outline border-dashed rounded-md bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors text-sm font-medium text-primary"
                    >
                      <UploadCloud className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Upload Primary Image'}
                    </label>
                    <p className="text-xs text-on-surface-variant">
                      Recommended size: 800x800px. Max 2MB.
                    </p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-on-surface">
                        Or enter Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full h-8 px-2 rounded-md border border-outline bg-surface text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-on-surface">
                    Additional Images (Up to 5)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-primary"
                    onClick={() => {
                      if (formData.images.length < 5) {
                        setFormData({ ...formData, images: [...formData.images, ''] });
                      }
                    }}
                    disabled={formData.images.length >= 5}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Image
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="h-12 w-12 shrink-0 border border-outline rounded-md overflow-hidden bg-surface-container">
                        {url ? (
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-on-surface-variant">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="flex-1 h-9 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                        placeholder="Additional image URL..."
                      />
                      <button
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== index);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant text-sm">
                      No additional images added
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Inventory & Pricing</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="e.g. WH-1000XM4"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-lg font-semibold text-on-surface">Product Variants</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-primary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    variants: [
                      ...(formData.variants || []),
                      { name: '', value: '', price: '', stock_quantity: '', sku: '' },
                    ],
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Variant
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {formData.variants?.map((variant: any, index: number) => (
                // eslint-disable-line @typescript-eslint/no-explicit-any
                <div
                  key={index}
                  className="p-4 border border-outline rounded-lg space-y-4 bg-surface-container-low"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-on-surface">Variant #{index + 1}</h3>
                    <button
                      onClick={() => {
                        const newVariants = [...formData.variants];
                        newVariants.splice(index, 1);
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="text-on-surface-variant hover:text-error p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                        Type (e.g. Size)
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].name = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full h-9 px-3 rounded-md border border-outline bg-surface text-sm"
                        placeholder="Size"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                        Value (e.g. XL)
                      </label>
                      <input
                        type="text"
                        value={variant.value}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].value = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full h-9 px-3 rounded-md border border-outline bg-surface text-sm"
                        placeholder="XL"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                        Price (Optional)
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].price = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full h-9 px-3 rounded-md border border-outline bg-surface text-sm"
                        placeholder="Override price"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                        Stock (Optional)
                      </label>
                      <input
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].stock_quantity = e.target.value;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="w-full h-9 px-3 rounded-md border border-outline bg-surface text-sm"
                        placeholder="Override stock"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!formData.variants || formData.variants.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant italic text-sm">
                  No variants defined for this product.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Configuration */}
        <div className="space-y-6">
          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Status</h2>
            </div>
            <div className="p-6">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                // eslint-disable-line @typescript-eslint/no-explicit-any
                className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-outline-variant">
              <h2 className="text-lg font-semibold text-on-surface">Organization</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option>Laptops</option>
                  <option>Printers</option>
                  <option>Peripherals</option>
                  <option>Monitors</option>
                  <option>Components</option>
                  <option>Storage</option>
                  <option>Networking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. Sony"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="e.g. dod, clearance, new, trending"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {formData.tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
