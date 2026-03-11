import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  Upload,
  Filter,
  Search,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MediaPicker } from "@/components/admin/MediaPicker";

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

const blogFormSchema = insertBlogPostSchema.extend({
  tags: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Category is required"),
}).omit({ authorId: true, createdAt: true, updatedAt: true, publishedAt: true });

type BlogFormData = z.infer<typeof blogFormSchema>;

export default function BlogManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
      tags: "",
      featuredImage: "",
      categoryId: undefined as any,
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await apiRequest("/api/cms/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response as { categories: any[] };
    },
  });

  const categories = categoriesData?.categories || [];

  const { data: blogPostsData, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const response = await apiRequest("/api/cms/posts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response as { posts: any[] };
    },
  });
  const blogPosts = blogPostsData?.posts || [];

  const createPostMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const postData = {
        ...data,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: data.tags ? JSON.stringify(data.tags.split(',').map(tag => tag.trim())) : null,
      };
      
      return await apiRequest(editingPost ? `/api/cms/posts/${editingPost.id}` : "/api/cms/posts", {
        method: editingPost ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BlogFormData> }) => {
      const postData = {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags.split(',').map((tag: string) => tag.trim())) : null,
      };
      
      return await apiRequest(`/api/cms/posts/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      form.reset();
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update blog post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/cms/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blog post",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/cms/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        form.setValue("featuredImage", data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: BlogFormData) => {
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data });
    } else {
      createPostMutation.mutate(data);
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    const tags = post.tags ? JSON.parse(post.tags).join(', ') : '';
    form.reset({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      status: post.status,
      tags,
      featuredImage: post.featuredImage || "",
      categoryId: post.categoryId,
    });
    setIsDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handlePublish = (post: any) => {
    const action = post.status === 'published' ? 'draft' : 'published';
    updatePostMutation.mutate({ 
      id: post.id, 
      data: { 
        status: action,
      } as any
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = blogPosts.filter((post: any) => {
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const adminRoles = ['super_admin', 'admin', 'editor', 'author'];
  if (!user || !adminRoles.includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts for the platform</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewPost} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
              </DialogTitle>
              <DialogDescription>
                {editingPost 
                  ? "Update the blog post information below."
                  : "Create a new blog post for the platform."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <FormControl>
                            <Input placeholder="Image URL or upload" {...field} value={field.value || ""} />
                          </FormControl>
                          <div className="mt-2">
                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer">
                                <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload Image</span>
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={handleImageUpload}
                                />
                              </label>
                              <div className="text-gray-300">|</div>
                              <MediaPicker 
                                onSelect={(url) => form.setValue("featuredImage", url)} 
                              />
                            </div>
                          </div>
                        </div>
                        {field.value && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center">
                            {field.value.startsWith("http") || field.value.startsWith("/") ? (
                                <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">{field.value}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post title" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter post slug (e.g., getting-started)" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the post"
                          className="min-h-[60px]"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="quill-editor-container">
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <ReactQuill 
                          theme="snow"
                          value={field.value || ""}
                          onChange={field.onChange}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Write your blog post content here..."
                          className="bg-white rounded-md border text-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="tax, filing, tips" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending || updatePostMutation.isPending}
                  >
                    {editingPost ? "Update" : "Create"} Post
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post: any) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <Badge className={getStatusColor(post.status)}>
                      {post.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>Published {new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPost(post)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(post)}
                    className={post.status === 'published' ? "text-yellow-600" : "text-green-600"}
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {blogPosts.length === 0 ? "No blog posts yet" : "No posts match your filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {blogPosts.length === 0 
                ? "Create your first blog post to share tax insights with users"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {blogPosts.length === 0 && (
              <Button onClick={handleNewPost} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}