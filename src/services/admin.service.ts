import api from '@/lib/api'
import type {
  AdminBlogPost,
  AdminContactSubmission,
  AdminContract,
  AdminInquiry,
  AdminLead,
  AdminNewsletterSubscription,
  AdminUser,
  AdminUserDetail,
  DashboardStats,
  ListQuery,
  PaginatedResponse,
  SalesRep,
} from '@/types/admin'

class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard/stats')
    return response.data.data
  }

  async listUsers(query: ListQuery = {}): Promise<PaginatedResponse<AdminUser>> {
    const response = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params: query })
    return response.data
  }

  async getUserById(id: string): Promise<AdminUserDetail> {
    const response = await api.get<{ success: boolean; data: AdminUserDetail }>(`/admin/users/${id}`)
    return response.data.data
  }

  async updateUser(id: string, data: Partial<{ role: string; status: string; firstName: string; lastName: string; phone: string | null }>): Promise<AdminUser> {
    const response = await api.patch<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`, data)
    return response.data.data
  }

  async listLeads(query: ListQuery = {}): Promise<PaginatedResponse<AdminLead>> {
    const response = await api.get<PaginatedResponse<AdminLead>>('/admin/leads', { params: query })
    return response.data
  }

  async getLeadById(id: string): Promise<AdminLead> {
    const response = await api.get<{ success: boolean; data: AdminLead }>(`/admin/leads/${id}`)
    return response.data.data
  }

  async updateLead(id: string, data: Partial<{ status: string; assignedToId: string | null; notes: string | null; nextFollowUp: string | null }>): Promise<AdminLead> {
    const response = await api.patch<{ success: boolean; data: AdminLead }>(`/admin/leads/${id}`, data)
    return response.data.data
  }

  async listContracts(query: ListQuery = {}): Promise<PaginatedResponse<AdminContract>> {
    const response = await api.get<PaginatedResponse<AdminContract>>('/admin/contracts', { params: query })
    return response.data
  }

  async getContractById(id: string): Promise<AdminContract> {
    const response = await api.get<{ success: boolean; data: AdminContract }>(`/admin/contracts/${id}`)
    return response.data.data
  }

  async listInquiries(query: ListQuery = {}): Promise<PaginatedResponse<AdminInquiry>> {
    const response = await api.get<PaginatedResponse<AdminInquiry>>('/admin/inquiries', { params: query })
    return response.data
  }

  async getInquiryById(id: string): Promise<AdminInquiry> {
    const response = await api.get<{ success: boolean; data: AdminInquiry }>(`/admin/inquiries/${id}`)
    return response.data.data
  }

  async updateInquiry(id: string, data: Partial<{ status: string; adminNotes: string | null }>): Promise<AdminInquiry> {
    const response = await api.patch<{ success: boolean; data: AdminInquiry }>(`/admin/inquiries/${id}`, data)
    return response.data.data
  }

  async listContactSubmissions(query: ListQuery = {}): Promise<PaginatedResponse<AdminContactSubmission>> {
    const response = await api.get<PaginatedResponse<AdminContactSubmission>>('/admin/contact-submissions', { params: query })
    return response.data
  }

  async getContactSubmissionById(id: string): Promise<AdminContactSubmission> {
    const response = await api.get<{ success: boolean; data: AdminContactSubmission }>(`/admin/contact-submissions/${id}`)
    return response.data.data
  }

  async listNewsletterSubscriptions(query: ListQuery = {}): Promise<PaginatedResponse<AdminNewsletterSubscription>> {
    const response = await api.get<PaginatedResponse<AdminNewsletterSubscription>>('/admin/newsletter-subscriptions', { params: query })
    return response.data
  }

  async listBlogPosts(query: ListQuery = {}): Promise<PaginatedResponse<AdminBlogPost>> {
    const response = await api.get<PaginatedResponse<AdminBlogPost>>('/blog', { params: query })
    return response.data
  }

  async getBlogPostById(id: string): Promise<AdminBlogPost> {
    const response = await api.get<{ success: boolean; data: AdminBlogPost }>(`/blog/${id}`)
    return response.data.data
  }

  async createBlogPost(data: Record<string, unknown>): Promise<AdminBlogPost> {
    const response = await api.post<{ success: boolean; data: AdminBlogPost }>('/blog', data)
    return response.data.data
  }

  async updateBlogPost(id: string, data: Record<string, unknown>): Promise<AdminBlogPost> {
    const response = await api.patch<{ success: boolean; data: AdminBlogPost }>(`/blog/${id}`, data)
    return response.data.data
  }

  async deleteBlogPost(id: string): Promise<void> {
    await api.delete(`/blog/${id}`)
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<{ success: boolean; data: { url: string } }>('/admin/upload', formData)
    return response.data.data.url
  }

  async listSalesReps(): Promise<SalesRep[]> {
    const response = await api.get<{ success: boolean; data: SalesRep[] }>('/admin/sales-reps')
    return response.data.data
  }
}

export const adminService = new AdminService()
