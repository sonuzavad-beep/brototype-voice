import { useState } from "react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StudentDock } from "@/components/StudentDock";
import { StudentMobileNav } from "@/components/StudentMobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/hooks/useComplaints";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { createComplaint, isCreating } = useComplaints();
  const { categories } = useCategories();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    createComplaint(
      {
        title,
        category_id: categoryId,
        description,
        priority,
        status: "pending",
      },
      {
        onSuccess: () => {
          toast.success("Complaint submitted successfully!");
          navigate("/student/complaints");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <StudentSidebar />
      <StudentMobileNav />
      <StudentDock />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Submit a Complaint</h1>
          <p className="text-muted-foreground mb-8">Fill out the form below to submit your complaint</p>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Complaint Title</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your complaint"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="hero-gradient flex-1" disabled={isCreating}>
                  {isCreating ? "Submitting..." : "Submit Complaint"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/student/dashboard")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
