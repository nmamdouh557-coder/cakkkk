import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { User, Role } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserManagement: React.FC = () => {
  const { profile: currentUserProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !displayName) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', {
        username,
        password,
        displayName,
        role,
        email: `${username}@swish.local`
      });
      
      // Reset form
      setUsername('');
      setPassword('');
      setDisplayName('');
      setRole('employee');
      fetchUsers();
      alert('User created successfully');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Warning: Deleting a user will revoke their system access. Continue?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Team & Users</h1>
        <p className="text-gray-500 mt-2 text-lg">Create employee accounts and manage who can access the system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Invitation/Add User Form */}
        <Card className="border-none shadow-premium bg-white sticky top-24">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
              <UserPlus className="text-[#F27D26] w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold">Add new user</CardTitle>
            <CardDescription>
              Employees have read-only access. Admins can manage offers and users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. jane.doe" 
                  className="rounded-xl border-gray-200 h-11 focus:ring-[#F27D26]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Password</Label>
                <Input 
                  id="pass" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters" 
                  className="rounded-xl border-gray-200 h-11 focus:ring-[#F27D26]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Display Name</Label>
                <Input 
                  id="name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Jane" 
                  className="rounded-xl border-gray-200 h-11 focus:ring-[#F27D26]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role</Label>
                <Select value={role} onValueChange={(v: Role) => setRole(v)}>
                  <SelectTrigger className="rounded-xl border-gray-200 h-11 focus:ring-[#F27D26]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 shadow-xl overflow-hidden">
                    <SelectItem value="employee" className="py-3 px-4 focus:bg-orange-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">Employee &mdash; <span className="font-normal text-gray-400">read-only</span></p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="py-3 px-4 focus:bg-orange-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#F27D26]" />
                         <div>
                          <p className="font-semibold text-gray-900">Admin &mdash; <span className="font-normal text-gray-400">full access</span></p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#F27D26] hover:bg-[#D96C1E] rounded-xl flex items-center gap-2 shadow-lg shadow-orange-100 mt-4 group"
              >
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {isSubmitting ? 'Creating...' : 'Create user'}
              </Button>
            </form>
            
            <p className="text-[10px] text-center text-gray-400 leading-relaxed pt-6">
              Authorized personnel only. Access logs are recorded.
            </p>
          </CardContent>
        </Card>

        {/* User List */}
        <Card className="lg:col-span-2 border-none shadow-premium bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">All users</CardTitle>
              <CardDescription>{users.length} users in total</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0">
             <div className="space-y-1">
               {users.map((user) => (
                 <div 
                   key={user.id} 
                   className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors border-b last:border-none group"
                 >
                   <div className="flex items-center gap-4">
                     <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                       <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                       <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div>
                       <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{user.displayName}</p>
                        {user.id === currentUserProfile?.id && (
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">(you)</span>
                        )}
                       </div>
                       <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <Badge className={`
                          ${user.role === 'admin' ? 'bg-orange-50 text-[#F27D26]' : 'bg-gray-100 text-gray-600'} 
                          border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5
                        `}>
                          {user.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                          {user.role}
                        </Badge>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={user.id === currentUserProfile?.id}
                        onClick={() => handleDeleteUser(user.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
