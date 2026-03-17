import api from '@/lib/api'
import type {
  AdminContract,
  AdminLead,
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

  async listSalesReps(): Promise<SalesRep[]> {
    const response = await api.get<{ success: boolean; data: SalesRep[] }>('/admin/sales-reps')
    return response.data.data
  }
}

export const adminService = new AdminService()
