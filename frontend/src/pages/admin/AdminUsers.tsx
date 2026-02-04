import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Ban, Shield, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
  id: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
}

export default function AdminUsers() {
  const { profile, session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
        ...(search && { search })
      });

      const res = await fetch(`${API_URL}/api/admin/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.data);
      // Assuming API returns total count, calculate pages
      setTotalPages(Math.ceil((data.total || 0) / 20));

    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session, page]); // Reload when page changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on search
    fetchUsers();
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change user role to ${newRole}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      toast.success(`User role updated to ${newRole}`);
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    if (!confirm(`Are you sure you want to change user plan to ${newPlan}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (!res.ok) throw new Error("Failed to update plan");

      toast.success(`User plan updated to ${newPlan}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user plan");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-display font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage users, roles, and subscriptions.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </div>

          <div className="bg-card rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? "destructive" : user.role === 'banned' ? "outline" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.plan || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' ? (
                          <Badge variant="outline" className="border-primary text-primary">Super Admin</Badge>
                        ) : (
                          <>
                            {user.role !== 'banned' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Ban User"
                                onClick={() => updateUserRole(user.id, 'banned')}
                              >
                                <Ban className="h-4 w-4 text-red-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Unban User"
                                onClick={() => updateUserRole(user.id, 'user')}
                              >
                                <Shield className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            {user.plan !== 'business' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Upgrade to Business"
                                onClick={() => updateUserPlan(user.id, 'business')}
                              >
                                <ArrowUpCircle className="h-4 w-4 text-purple-500" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls could go here */}
        </div>
      </main>
    </div>
  );
}
