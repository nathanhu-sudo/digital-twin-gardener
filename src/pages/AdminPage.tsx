import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityImpact } from "@/hooks/useCommunityImpact";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, Package, Leaf, Trash2, RefreshCw, Shield } from "lucide-react";

const AdminPage = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, adminLoading, users, usersLoading, refetchUsers } = useAdmin();
  const { data: community, loading: communityLoading } = useCommunityImpact();
  const navigate = useNavigate();

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking access…</div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/app" replace />;

  const co2Factor = 2.5;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground font-serif">Admin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Aggregate Stats */}
        <section>
          <h2 className="text-lg font-bold text-foreground font-serif mb-4">Community Overview</h2>
          {communityLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(n => <div key={n} className="h-24 rounded-xl bg-card border animate-pulse" />)}
            </div>
          ) : community && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Users className="h-6 w-6 text-primary mb-1" />
                  <p className="text-2xl font-bold text-foreground">{community.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Package className="h-6 w-6 text-primary mb-1" />
                  <p className="text-2xl font-bold text-foreground">{community.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Leaf className="h-6 w-6 text-success mb-1" />
                  <p className="text-2xl font-bold text-foreground">{community.totalSavedKg.toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground">Food Saved</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex flex-col items-center text-center">
                  <Trash2 className="h-6 w-6 text-destructive mb-1" />
                  <p className="text-2xl font-bold text-foreground">{community.totalWastedKg.toFixed(1)} kg</p>
                  <p className="text-xs text-muted-foreground">Food Wasted</p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Users Table */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-serif">All Users</h2>
            <Button variant="outline" size="sm" onClick={refetchUsers} disabled={usersLoading} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Active</TableHead>
                      <TableHead className="text-center">Consumed</TableHead>
                      <TableHead className="text-center">Tossed</TableHead>
                      <TableHead className="text-right">Saved (kg)</TableHead>
                      <TableHead className="text-right">Wasted (kg)</TableHead>
                      <TableHead className="text-right">CO₂ Saved</TableHead>
                      <TableHead>Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users yet</TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-medium text-sm">{u.email}</TableCell>
                          <TableCell className="text-center">{u.active_items}</TableCell>
                          <TableCell className="text-center text-success">{u.consumed_items}</TableCell>
                          <TableCell className="text-center text-destructive">{u.tossed_items}</TableCell>
                          <TableCell className="text-right">{u.total_saved_kg.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{u.total_wasted_kg.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{(u.total_saved_kg * co2Factor).toFixed(1)} kg</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_activity ? new Date(u.last_activity).toLocaleDateString() : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
