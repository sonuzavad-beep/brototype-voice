import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User, Tag, Send } from "lucide-react";
import { useComplaint, useComplaints } from "@/hooks/useComplaints";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminComplaintDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { complaint, isLoading } = useComplaint(id || "");
  const { updateComplaint, isUpdating } = useComplaints();
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");

  const handleSendResponse = async () => {
    if (!response.trim() || !id) return;

    const updates: any = {
      admin_response: response,
    };

    if (status) {
      updates.status = status;
      if (status === "resolved") {
        updates.resolved_at = new Date().toISOString();
      }
    }

    updateComplaint(
      { id, updates },
      {
        onSuccess: () => {
          setResponse("");
          setStatus("");
          toast.success("Response sent successfully");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => navigate("/admin/complaints")} className="mb-4">
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
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/complaints")}
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

              {/* Current Response */}
              {complaint.admin_response && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Current Response</h2>
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

              {/* Response Form */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {complaint.admin_response ? "Update Response" : "Send Response"}
                </h2>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Update Status</label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Response</label>
                      <Textarea
                        placeholder="Type your response here..."
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button 
                      onClick={handleSendResponse} 
                      className="w-full" 
                      disabled={isUpdating || !response.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isUpdating ? "Sending..." : "Send Response"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
