import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentDock } from "@/components/StudentDock";
import { StudentMobileNav } from "@/components/StudentMobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useComplaints } from "@/hooks/useComplaints";
import { useProfile } from "@/hooks/useProfile";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
  const { complaints, isLoading } = useComplaints();
  const { profile } = useProfile();

  const stats = useMemo(() => {
    if (!complaints) {
      return [
        { label: "Total Complaints", value: "0", icon: AlertCircle, color: "text-blue-500" },
        { label: "Pending", value: "0", icon: Clock, color: "text-yellow-500" },
        { label: "Resolved", value: "0", icon: CheckCircle, color: "text-green-500" },
        { label: "Avg. Response Time", value: "N/A", icon: Clock, color: "text-purple-500" },
      ];
    }

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === "pending").length;
    const resolved = complaints.filter(c => c.status === "resolved").length;

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
      { label: "Total Complaints", value: total.toString(), icon: AlertCircle, color: "text-blue-500" },
      { label: "Pending", value: pending.toString(), icon: Clock, color: "text-yellow-500" },
      { label: "Resolved", value: resolved.toString(), icon: CheckCircle, color: "text-green-500" },
      { label: "Avg. Response Time", value: resolvedWithTime.length > 0 ? `${avgResponseTime.toFixed(1)} days` : "N/A", icon: Clock, color: "text-purple-500" },
    ];
  }, [complaints]);

  const recentComplaints = useMemo(() => {
    if (!complaints) return [];
    return complaints.slice(0, 5);
  }, [complaints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <StudentSidebar />
        <StudentMobileNav />
        <StudentDock />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <StudentSidebar />
      <StudentMobileNav />
      <StudentDock />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome Back, {profile?.first_name || "Student"}!
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">Here's your complaint overview</p>
            </div>
            <Button asChild className="hero-gradient hidden md:flex">
              <Link to="/student/submit">
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Link>
            </Button>
          </div>

          {/* Mobile New Complaint Button */}
          <Button asChild className="hero-gradient w-full mb-6 md:hidden">
            <Link to="/student/submit">
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Link>
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
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
            <h2 className="text-xl font-bold mb-4">Recent Complaints</h2>
            <div className="space-y-4">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          complaint.status === "pending"
                            ? "bg-yellow-500"
                            : complaint.status === "in_progress"
                            ? "bg-blue-500"
                            : complaint.status === "resolved"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{complaint.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className={getStatusColor(complaint.status)}>
                            {getStatusLabel(complaint.status)}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/student/complaints/${complaint.id}`}>View</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You haven't submitted any complaints yet</p>
                  <Button asChild className="hero-gradient">
                    <Link to="/student/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Complaint
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
