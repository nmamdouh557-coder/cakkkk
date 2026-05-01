import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Offer, BRANDS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart3, 
  Trash2, 
  Edit, 
  Plus,
  TrendingUp,
  Store,
  Clock,
  CalendarCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

const BRANDS_LIST = [
  'Shakir', 'Yelo', 'BBT', 'Slice', 'Pattie', 'Chili', 'Just C', 'Mishmash', 'Table'
];

const getOfferStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'expired';
  return 'active';
};

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/offers');
      setOffers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch offers', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await api.delete(`/offers/${id}`);
        setOffers(offers.filter(o => o.id !== id));
      } catch (error) {
        console.error('Failed to delete offer', error);
      }
    }
  };

  const activeCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'active').length;
  const upcomingCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'upcoming').length;
  const expiredCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'expired').length;

  // Group by brand
  const brandStats = BRANDS_LIST.map(brand => {
    const brandOffers = offers.filter(o => o.brand === brand);
    return {
      brand,
      total: brandOffers.length,
      active: brandOffers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'active').length
    };
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Overview and management for every promotional offer.</p>
        </div>
        <Link to="/add">
          <Button className="bg-[#F27D26] hover:bg-[#D96C1E] h-12 px-6 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-200">
            <Plus className="w-5 h-5" />
            Add new offer
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          { label: 'Total offers', value: offers.length, icon: BarChart3, color: 'text-gray-900' },
          { label: 'Active', value: activeCount, icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Upcoming', value: upcomingCount, icon: Clock, color: 'text-blue-600' },
          { label: 'Expired', value: expiredCount, icon: CalendarCheck, color: 'text-rose-600' },
          { label: 'Brands', value: BRANDS_LIST.length, icon: Store, color: 'text-[#F27D26]' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-premium bg-white">
            <CardHeader className="p-6 pb-2 space-y-0">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color} opacity-40`} />
              </div>
              <p className={`text-4xl font-black ${stat.color} mt-2`}>{stat.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Brand breakdown */}
        <Card className="lg:col-span-1 border-none shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Brand breakdown</CardTitle>
            <CardDescription>Offers grouped by brand</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Brand</TableHead>
                  <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Total</TableHead>
                  <TableHead className="py-4 px-6 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brandStats.map((stat) => (
                  <TableRow key={stat.brand} className="group hover:bg-orange-50/30 transition-colors">
                    <TableCell className="py-4 px-6 font-semibold text-gray-800">{stat.brand}</TableCell>
                    <TableCell className="py-4 px-6 text-center tabular-nums text-gray-500 font-medium">{stat.total}</TableCell>
                    <TableCell className="py-4 px-6 text-right tabular-nums">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stat.active > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {stat.active}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Offers Management */}
        <Card className="lg:col-span-2 border-none shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-bold">All offers</CardTitle>
            <CardDescription>Manage and edit every offer in the system</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Offer</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Brand</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Price</TableHead>
                  <TableHead className="py-4 px-6 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Dates</TableHead>
                  <TableHead className="py-4 px-6 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-gray-400 italic">No offers found.</TableCell>
                  </TableRow>
                ) : (
                  offers.map((offer) => {
                    const status = getOfferStatus(offer.startDate, offer.endDate);
                    return (
                      <TableRow key={offer.id} className="group hover:bg-orange-50/50 transition-colors">
                        <TableCell className="py-4 px-6">
                          <p className="font-semibold text-gray-900 line-clamp-1">{offer.title}</p>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                           <Badge variant="outline" className="bg-white border-gray-200 text-gray-600 font-medium">{offer.brand}</Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <p className="font-black text-gray-900 leading-none">
                            {(offer.productPrice !== undefined && offer.productPrice !== null) ? `${offer.productPrice} KD` : '—'}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Badge className={`
                            ${status === 'active' ? 'bg-emerald-50 text-emerald-600' : status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} 
                            border-0 px-2.5 py-0.5 rounded-full uppercase text-[9px] tracking-widest font-black whitespace-nowrap
                          `}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <p className="text-[10px] font-bold text-gray-400 tabular-nums">
                            {format(parseISO(offer.startDate), 'MM/dd')} - {format(parseISO(offer.endDate), 'MM/dd')}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/edit/${offer.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#F27D26] hover:bg-orange-100 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" onClick={() => offer.id && handleDelete(offer.id)} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
