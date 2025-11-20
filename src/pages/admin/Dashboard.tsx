import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { useComplaints } from "@/hooks/useComplaints";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const { complaints, isLoading } = useComplaints();

  const stats = useMemo(() => {
    if (!complaints) return [];

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "pending").length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const inProgress = complaints.filter(c => c.status === "in_progress").length;

    // Calculate avg response time for resolved complaints
    const resolvedWithTime = complaints.filter(c => c.resolved_at);
    const avgResponseTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, c) => {
          const created = new Date(c.created_at).getTime();
          const resolved = new Date(c.resolved_at!).getTime();
          return acc + (resolved - created);
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return [
      { label: "Total Complaints", value: total.toString(), icon: AlertCircle, color: "text-blue-500", change: "+0%" },
      { label: "Pending", value: pending.toString(), icon: Clock, color: "text-yellow-500", change: "+0%" },
      { label: "Resolved", value: resolved.toString(), icon: CheckCircle, color: "text-green-500", change: "+0%" },
      { label: "Avg. Response Time", value: `${avgResponseTime.toFixed(1)} days`, icon: TrendingUp, color: "text-purple-500", change: "0%" },
    ];
  }, [complaints]);

  const recentActivity = useMemo(() => {
    if (!complaints) return [];
    
    return complaints
      .slice(0, 5)
      .map(complaint => {
        const user = complaint.user as any;
        const firstName = user?.first_name || "";
        const lastName = user?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim() || "Unknown";
        
        return {
          student: fullName,
          action: complaint.status === "resolved" ? "resolved" : complaint.status === "in_progress" ? "is working on" : "submitted",
          complaint: complaint.title,
          time: formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true }),
        };
      });
  }, [complaints]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-background">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      <span className="text-primary">{activity.student}</span> {activity.action}{" "}
                      <span className="text-muted-foreground">"{activity.complaint}"</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
