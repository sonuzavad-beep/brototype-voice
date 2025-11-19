import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useComplaints() {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["complaints", user?.id, userRole],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("complaints")
        .select(`
          *,
          category:categories(name, icon),
          user:profiles!complaints_user_id_fkey(first_name, last_name, email),
          admin:profiles!complaints_admin_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      // Students only see their own complaints
      if (userRole === "student") {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const createComplaint = useMutation({
    mutationFn: async (complaint: any) => {
      if (!user) throw new Error("No user");

      const { error } = await supabase
        .from("complaints")
        .insert({
          ...complaint,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit complaint");
    },
  });

  const updateComplaint = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("complaints")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint updated successfully");
    },
    onError: () => {
      toast.error("Failed to update complaint");
    },
  });

  return {
    complaints,
    isLoading,
    createComplaint: createComplaint.mutate,
    isCreating: createComplaint.isPending,
    updateComplaint: updateComplaint.mutate,
    isUpdating: updateComplaint.isPending,
  };
}

export function useComplaint(id: string) {
  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          categories(name, icon, description),
          profiles!inner(first_name, last_name, email, phone, student_id)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return { complaint, isLoading };
}
