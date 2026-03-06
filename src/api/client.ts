import type {
  Company,
  Template,
  RFQ,
  Quote,
  CreateRFQReq,
  CreateQuoteReq,
} from '../types/dto'
import { MOCK_ORDERS } from '../data/mockData'
import type { Order } from '../types/dto'

const BASE_URL = `${(import.meta.env.VITE_API_URL ?? '').trim()}/api/v1`

function getAuthHeaders(): Record<string, string> {
  const tenantCompanyId = localStorage.getItem('tenantCompanyId') || 'system'
  const userRole = localStorage.getItem('userRole') || 'company_admin'
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Company-Id': tenantCompanyId,
    'X-Mock-User-Role': userRole,
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// Health
export const getHealth = () => request<{ status: string }>('/health')

// Companies
export const listCompanies = (type?: string) =>
  request<Company[]>(`/companies${type ? `?type=${type}` : ''}`)

// Templates
export const listTemplates = () => request<Template[]>('/templates')
export const getTemplate = (categoryKey: string) =>
  request<Template>(`/templates/${categoryKey}`)

// RFQs
export const listRFQs = () => request<RFQ[]>('/rfqs')
export const getRFQ = (id: string) => request<RFQ>(`/rfqs/${id}`)
export const createRFQ = (body: CreateRFQReq) =>
  request<RFQ>('/rfqs', { method: 'POST', body: JSON.stringify(body) })
export const publishRFQ = (id: string) =>
  request<RFQ>(`/rfqs/${id}/publish`, { method: 'POST' })
export const closeRFQ = (id: string) =>
  request<RFQ>(`/rfqs/${id}/close`, { method: 'POST' })

// Quotes
export const listQuotesByRFQ = (rfqId: string) =>
  request<Quote[]>(`/rfqs/${rfqId}/quotes`)
export const createQuote = (rfqId: string, body: CreateQuoteReq) =>
  request<Quote>(`/rfqs/${rfqId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
export const getQuote = (id: string) => request<Quote>(`/quotes/${id}`)

// Company by ID
export const getCompany = (id: string) => request<Company>(`/companies/${id}`)

// Orders (frontend-only)
export function listOrders(buyerCompanyId?: string): Promise<Order[]> {
  const orders = buyerCompanyId
    ? MOCK_ORDERS.filter(o => o.buyerCompanyId === buyerCompanyId)
    : MOCK_ORDERS
  return Promise.resolve(orders)
}

export function getOrder(id: string): Promise<Order | null> {
  return Promise.resolve(MOCK_ORDERS.find(o => o.id === id) ?? null)
}
