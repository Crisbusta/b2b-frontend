export type CompanyType = 'buyer' | 'supplier'
export type UserRole = 'company_admin' | 'buyer_user' | 'supplier_user'
export type RFQStatus = 'draft' | 'published' | 'closed' | 'awarded'
export type QuoteStatus = 'submitted' | 'withdrawn'
export type AttributeType = 'enum' | 'number' | 'string' | 'boolean'

export interface Company {
  id: string
  name: string
  type: CompanyType
  createdAt: string
}

export interface TemplateAttribute {
  key: string
  label: string
  type: AttributeType
  required: boolean
  unit?: string
  enumValues?: string[]
  min?: number
  max?: number
}

export interface Template {
  id: string
  categoryKey: string
  name: string
  attributes: TemplateAttribute[]
}

export interface RFQItem {
  id: string
  rfqId: string
  lineNumber: number
  quantity: number
  unit: string
  spec: Record<string, unknown>
}

export interface RFQ {
  id: string
  buyerCompanyId: string
  title: string
  categoryKey: string
  status: RFQStatus
  invitedSupplierCompanyIds: string[]
  items: RFQItem[]
  createdAt: string
}

export interface QuoteItem {
  id: string
  quoteId: string
  rfqItemId: string
  confirmedSpec: Record<string, unknown>
  unitPrice: number
  currency: string
  leadTimeDays: number
}

export interface Quote {
  id: string
  rfqId: string
  supplierCompanyId: string
  status: QuoteStatus
  items: QuoteItem[]
  createdAt: string
}

// Request bodies
export interface CreateRFQItemReq {
  lineNumber: number
  quantity: number
  unit: string
  spec: Record<string, unknown>
}

export interface CreateRFQReq {
  title: string
  categoryKey: string
  invitedSupplierCompanyIds: string[]
  items: CreateRFQItemReq[]
}

export interface CreateQuoteItemReq {
  rfqItemId: string
  confirmedSpec: Record<string, unknown>
  unitPrice: number
  currency: string
  leadTimeDays: number
}

export interface CreateQuoteReq {
  items: CreateQuoteItemReq[]
}

// Orders (frontend-only, derived from awarded RFQs)
export type OrderStatus = 'confirmed' | 'in_production' | 'quality_check' | 'export' | 'in_transit' | 'delivered'

export interface Order {
  id: string
  rfqId: string
  rfqTitle: string
  buyerCompanyId: string
  supplierCompanyId: string
  status: OrderStatus
  totalAmountCLP: number
  trackingNumber: string
  estimatedDeliveryDays: number
  incoterms: string
  carrier: string
  shippingOrigin: string
  items: Array<{ rfqItemId: string; quantity: number; unit: string; unitPriceCLP: number }>
  createdAt: string
}

// Supplier profile enrichment (merged with Company from API)
export interface SupplierProfile {
  id: string
  tagline: string
  description: string
  certifications: string[]
  yearsInBusiness: number
  location: string
  rating: number
  completedOrders: number
  avgResponseDays: number
  categories: string[]
  employeeCount: string
}
