import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Offer, OfferStatus, BRANDS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  ChevronRight,
  Plus,
  CircleDollarSign,
  Ticket
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

const getOfferStatus = (startDateStr: string, endDateStr: string) => {
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'expired';
  return 'active';
};

const OffersPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredOffers = offers.filter(offer => {
    const status = getOfferStatus(offer.startDate, offer.endDate);
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    const matchesBrand = selectedBrand === 'All' || offer.brand === selectedBrand;
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesBrand && matchesSearch;
  });

  const activeCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'active').length;
  const upcomingCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'upcoming').length;
  const expiredCount = offers.filter(o => getOfferStatus(o.startDate, o.endDate) === 'expired').length;

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { id: 'all', label: 'Total offers', value: offers.length, color: 'text-gray-900', bg: 'bg-white', activeBorder: 'border-[#F27D26]' },
          { id: 'active', label: 'Active', value: activeCount, color: 'text-emerald-600', bg: 'bg-emerald-50', activeBorder: 'border-emerald-500' },
          { id: 'upcoming', label: 'Upcoming', value: upcomingCount, color: 'text-blue-600', bg: 'bg-blue-50', activeBorder: 'border-blue-500' },
          { id: 'expired', label: 'Expired', value: expiredCount, color: 'text-rose-600', bg: 'bg-rose-50', activeBorder: 'border-rose-500' },
        ].map((stat, i) => (
          <Card 
            key={i} 
            onClick={() => setSelectedStatus(stat.id as any)}
            className={cn(
              `border shadow-sm cursor-pointer transition-all hover:shadow-md ${stat.bg}`,
              selectedStatus === stat.id ? `border-2 ${stat.activeBorder}` : 'border-gray-100'
            )}
          >
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider">{stat.label}</CardDescription>
              <CardTitle className={`text-2xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', ...BRANDS].map((brand) => (
            <Button
              key={brand}
              variant={selectedBrand === brand ? 'default' : 'outline'}
              onClick={() => setSelectedBrand(brand)}
              className={`rounded-full px-5 py-2 h-auto text-sm transition-all ${
                selectedBrand === brand 
                  ? 'bg-[#F27D26] text-white hover:bg-[#D96C1E] shadow-lg shadow-[#F27D26]/20' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              {brand === 'All' ? 'All brands' : brand}
            </Button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search offers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 focus:ring-[#F27D26]"
            />
          </div>
          {isAdmin && (
            <Link to="/add">
              <Button className="bg-[#F27D26] hover:bg-[#D96C1E] rounded-xl flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add new offer</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Ticket className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No offers found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer) => {
            const status = getOfferStatus(offer.startDate, offer.endDate);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={offer.id}
              >
                <Card className="group overflow-hidden rounded-[2rem] border-none shadow-premium transition-all hover:translate-y-[-4px]">
                  {/* Card Image/Header */}
                  <div className="aspect-[4/3] bg-[#F6E8DB] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm text-gray-900 font-bold px-3 py-1 rounded-full">
                        {offer.brand}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className={`
                        ${status === 'active' ? 'bg-emerald-500/90' : status === 'upcoming' ? 'bg-blue-500/90' : 'bg-rose-500/90'} 
                        text-white border-0 px-3 py-1 rounded-full uppercase text-[10px] tracking-widest font-black
                      `}>
                        {status}
                      </Badge>
                    </div>
                    
                    {offer.imageUrl ? (
                      <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="p-12 opacity-10">
                        <Ticket className="w-32 h-32 text-gray-900" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link to={`/edit/${offer.id}`} className="translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6">
                          Edit details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <CardContent className="p-8 pb-10 bg-white">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-1">
                      {offer.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {offer.description}
                    </p>

                    <div className="flex flex-col gap-4">
                      {/* Price Info */}
                      {(offer.productPrice !== undefined && offer.productPrice !== null) && (
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between group-hover:bg-orange-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-orange-100 text-[#F27D26]`}>
                              <CircleDollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Price</p>
                              <p className="text-xl font-black text-gray-900">
                                {offer.productPrice} <span className="text-sm font-bold opacity-60">KD</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mt-2 px-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{format(parseISO(offer.startDate), 'MMM d, yyyy')}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 opacity-30" />
                        <div className="flex items-center gap-2">
                          <span>{format(parseISO(offer.endDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
