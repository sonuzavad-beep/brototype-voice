import { useNavigate, useParams } from "react-router-dom";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentDock } from "@/components/StudentDock";
import { StudentMobileNav } from "@/components/StudentMobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { useComplaint } from "@/hooks/useComplaints";
import { format } from "date-fns";

export default function StudentComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { complaint, isLoading } = useComplaint(id || "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <StudentSidebar />
        <StudentMobileNav />
        <StudentDock />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen w-full">
        <StudentSidebar />
        <StudentMobileNav />
        <StudentDock />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-24">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/student/complaints")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complaints
            </Button>
            <Card className="p-6">
              <p className="text-muted-foreground">Complaint not found</p>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted/50 text-muted-foreground border-muted/20";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", "-");
  };

  return (
    <div className="flex min-h-screen w-full">
      <StudentSidebar />
      <StudentMobileNav />
      <StudentDock />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-24">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/student/complaints")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Button>

          <Card className="p-4 md:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{complaint.title}</h1>
                  </div>
                  <Badge className={`${getStatusColor(complaint.status)} border w-fit`}>
                    {getStatusLabel(complaint.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(complaint.created_at), "MMM dd, yyyy")}</span>
                  </div>
                  {complaint.categories && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>{complaint.categories.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Admin Response */}
              {complaint.admin_response && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Admin Response</h2>
                  <Card className="p-4 bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-primary">A</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold">Admin</span>
                          <span className="text-xs text-muted-foreground">
                            {complaint.resolved_at 
                              ? format(new Date(complaint.resolved_at), "MMM dd, yyyy HH:mm")
                              : format(new Date(complaint.updated_at), "MMM dd, yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{complaint.admin_response}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
