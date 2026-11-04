import type {
  CreateLeadPayload,
  Lead,
  LeadListParams,
  LeadListResponse,
  UpdateLeadPayload,
} from '@hotelmind/contracts'
import { api } from '@/lib/axios'

export const leadsService = {
  list: (params?: LeadListParams) =>
    api.get<LeadListResponse>('/leads', { params }).then(r => r.data),

  get: (id: string) => api.get<Lead>(`/leads/${id}`).then(r => r.data),

  create: (data: CreateLeadPayload) =>
    api.post<Lead>('/leads', data).then(r => r.data),

  update: (id: string, data: UpdateLeadPayload) =>
    api.put<Lead>(`/leads/${id}`, data).then(r => r.data),
}
