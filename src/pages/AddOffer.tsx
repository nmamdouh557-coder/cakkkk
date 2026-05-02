import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { BRANDS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AddOffer: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    description: '',
    productPrice: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.title || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/offers', {
        ...formData,
        productPrice: formData.productPrice || null,
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error adding offer:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save offer.';
      const details = error.response?.data?.details ? `\n\nDetails: ${error.response.data.details}` : '';
      const code = error.response?.data?.prismaCode ? `\nCode: ${error.response.data.prismaCode}` : '';
      
      alert(`${errorMessage}${details}${code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/dashboard">
          <Button variant="outline" className="rounded-xl border-gray-200 h-10 px-4 group flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-premium-lg overflow-hidden">
        {/* Dynamic header accent based on progress/state */}
        <div className="h-2 bg-gradient-to-r from-orange-400 via-[#F27D26] to-emerald-400"></div>
        
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Add new offer</CardTitle>
          <CardDescription className="text-base">
            Enter the details for a new promotional offer to publish in the system.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-10 pt-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* Brand Selection */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Brand</Label>
                <Select onValueChange={(v: string) => setFormData({ ...formData, brand: v })}>
                  <SelectTrigger className="h-14 rounded-2xl border-gray-200 bg-gray-50/30 focus:ring-[#F27D26] transition-all">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-200 shadow-2xl">
                    {BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand} className="cursor-pointer py-3 font-semibold">{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Offer Title */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Offer title</Label>
                <Input 
                  required
                  placeholder="e.g. Special Weekend Deal" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-14 rounded-2xl border-gray-200 bg-gray-50/30 focus:ring-[#F27D26] font-semibold transition-all"
                />
              </div>

              {/* Product Price */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                  Product price <span className="opacity-40 text-[10px] font-medium lowercase italic">(optional)</span>
                </Label>
                <div className="relative group">
                  <Input 
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 3.800" 
                    value={formData.productPrice}
                    onChange={(e) => setFormData({ ...formData, productPrice: e.target.value })}
                    className="h-14 pr-16 rounded-2xl border-gray-200 bg-gray-50/30 focus:ring-[#F27D26] font-semibold transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-sm font-black text-gray-400 group-focus-within:text-[#F27D26] transition-colors">KD</span>
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="md:col-span-2 space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Description</Label>
                <Textarea 
                  placeholder="Describe the offer details and terms..." 
                  className="min-h-[140px] rounded-2xl border-gray-200 bg-gray-50/30 focus:ring-[#F27D26] p-5 resize-none font-medium leading-relaxed transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">Start date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "w-full h-14 justify-start text-left font-semibold rounded-2xl border border-gray-200 bg-gray-50/30 transition-all px-4 flex items-center hover:bg-gray-100/50",
                      !formData.startDate && "text-muted-foreground font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                    {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-gray-200 overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">End date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "w-full h-14 justify-start text-left font-semibold rounded-2xl border border-gray-200 bg-gray-50/30 transition-all px-4 flex items-center hover:bg-gray-100/50",
                      !formData.endDate && "text-muted-foreground font-normal"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                    {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-gray-200 overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Offer Image - Full Width */}
              <div className="md:col-span-2 space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  Offer image <span className="opacity-40 text-[10px] font-medium lowercase italic">(optional)</span>
                </Label>
                
                <input 
                  type="file" 
                  id="imageUpload"
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div 
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  className="group relative border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer overflow-hidden"
                >
                  {formData.imageUrl ? (
                    <div className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden group">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Button type="button" variant="secondary" className="rounded-full shadow-lg">Change Image</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-[1.25rem] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-[#F27D26]" />
                      </div>
                      <div>
                        <p className="text-base font-black text-gray-800">Upload Image</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium">PNG, JPG, WebP — Up to 1MB recommended</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <Input 
                      type="text" 
                      placeholder="Or paste an image URL directly..."
                      value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="bg-white rounded-xl border-gray-200 h-12 border-dashed font-medium text-center focus-visible:ring-[#F27D26]/20 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-12 rounded-xl font-bold text-gray-600 border-gray-200"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-[2] h-12 bg-[#F27D26] hover:bg-[#D96C1E] rounded-xl font-bold text-white shadow-xl shadow-orange-100"
              >
                {loading ? 'Saving...' : 'Save offer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddOffer;
