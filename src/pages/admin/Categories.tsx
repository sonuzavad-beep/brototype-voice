import { AdminSidebar } from "@/components/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, FolderKanban } from "lucide-react";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/useCategories";
import { useComplaints } from "@/hooks/useComplaints";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminCategories() {
  const isMobile = useIsMobile();
  const { categories, isLoading, createCategory, deleteCategory, isCreating, isDeleting } = useCategories();
  const { complaints } = useComplaints();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("FolderKanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const categoryStats = useMemo(() => {
    if (!categories || !complaints) return [];
    
    return categories.map(category => {
      const count = complaints.filter(c => c.category_id === category.id).length;
      return {
        ...category,
        count,
      };
    });
  }, [categories, complaints]);

  const filteredCategories = useMemo(() => {
    if (!categoryStats) return [];
    
    return categoryStats.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoryStats, searchQuery]);

  const totalComplaints = useMemo(() => {
    return complaints?.length || 0;
  }, [complaints]);

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    
    createCategory({
      name: categoryName.trim(),
      description: categoryDescription.trim() || null,
      icon: categoryIcon,
    });
    
    setIsDialogOpen(false);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryIcon("FolderKanban");
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Categories Management</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage complaint categories</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="hero-gradient w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5" />
                    Add New Category
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      placeholder="e.g., Infrastructure"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryDescription">Description (Optional)</Label>
                    <Textarea
                      id="categoryDescription"
                      placeholder="Brief description of this category"
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryIcon">Icon</Label>
                    <select
                      id="categoryIcon"
                      value={categoryIcon}
                      onChange={(e) => setCategoryIcon(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
                    >
                      <option value="FolderKanban">FolderKanban</option>
                      <option value="Settings">Settings</option>
                      <option value="Wrench">Wrench</option>
                      <option value="Users">Users</option>
                      <option value="BookOpen">BookOpen</option>
                    </select>
                  </div>
                  <Button 
                    onClick={handleAddCategory} 
                    className="w-full hero-gradient"
                    disabled={!categoryName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Category"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-4 md:p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                  <Card key={category.id} className="p-4 hover:border-primary transition-colors animate-fade-in">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base mb-2">{category.name}</h3>
                        <Badge className={`bg-${category.color}-500/10 text-${category.color}-500`}>
                          {category.count} complaints
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive flex-1">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="p-6 hover:border-primary transition-colors animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <Badge className={`bg-${category.color}-500/10 text-${category.color}-500`}>
                          {category.count} complaints
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 md:p-6 mt-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Category Statistics</h2>
            <div className="space-y-3 md:space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500 flex-shrink-0`}></div>
                    <span className="font-medium text-sm md:text-base">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 pl-6 sm:pl-0">
                    <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{category.count} complaints</span>
                    <div className="flex-1 sm:w-24 md:w-32 bg-muted rounded-full h-2">
                      <div
                        className={`bg-${category.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${(category.count / 48) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
