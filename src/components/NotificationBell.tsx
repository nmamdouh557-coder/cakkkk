import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock,
  Ticket,
  RefreshCw
} from 'lucide-react';
import api from '@/lib/api';
import { Notification } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const NotificationBell: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const notifs: Notification[] = Array.isArray(response) ? response : [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!profile) return;
    try {
      await api.post(`/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile || notifications.length === 0) return;
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => api.post(`/notifications/${n.id}/read`)));
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger 
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "relative text-gray-500 hover:text-[#F27D26] hover:bg-orange-50 rounded-full h-10 w-10 transition-all"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-[#F27D26] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden" align="end">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F27D26]" /> 
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-[#F27D26] hover:bg-[#F27D26]/10"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-900">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No new activity to show</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((n) => {
                const isRead = n.read;
                return (
                  <div 
                    key={n.id} 
                    onClick={() => !isRead && markAsRead(n.id!)}
                    className={cn(
                      "p-4 transition-colors cursor-pointer group",
                      isRead ? "bg-white" : "bg-[#F27D26]/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "mt-1 p-2 rounded-xl shrink-0",
                        n.type === 'new_offer' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {n.type === 'new_offer' ? <Ticket className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm font-black text-gray-900 leading-tight",
                            !isRead && "pr-4"
                          )}>
                            {n.title}
                          </p>
                          {!isRead && (
                             <div className="w-2 h-2 bg-[#F27D26] rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 bg-gray-50 border-t text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Showing last 20 events</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
