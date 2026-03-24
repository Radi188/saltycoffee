const BASE = '/api'

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  let data
  try { data = await res.json() } catch { data = null }
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`)
  return data
}

export const api = {
  // Auth
  login: (dto) => req('POST', '/users/login', dto),

  // Products
  getProducts: (categoryId) =>
    req('GET', `/products${categoryId ? `?categoryId=${categoryId}` : ''}`),
  createProduct: (dto) => req('POST', '/products', dto),
  updateProduct: (id, dto) => req('PUT', `/products/${id}`, dto),
  deleteProduct: (id) => req('DELETE', `/products/${id}`),
  uploadProductImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${BASE}/products/upload-image`, { method: 'POST', body: form, cache: 'no-store' })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.message || `HTTP ${r.status}`); return d })
  },

  // Categories
  getCategories: () => req('GET', '/categories?activeOnly=true'),
  getAllCategories: () => req('GET', '/categories'),
  createCategory: (dto) => req('POST', '/categories', dto),
  updateCategory: (id, dto) => req('PUT', `/categories/${id}`, dto),
  deleteCategory: (id) => req('DELETE', `/categories/${id}`),

  // Customers
  searchCustomers: (name) => req('GET', `/customers${name ? `?name=${encodeURIComponent(name)}` : ''}`),
  getCustomers: () => req('GET', '/customers'),
  createCustomer: (dto) => req('POST', '/customers', dto),
  updateCustomer: (id, dto) => req('PUT', `/customers/${id}`, dto),
  deleteCustomer: (id) => req('DELETE', `/customers/${id}`),

  // Users / Staff
  getUsers: () => req('GET', '/users'),
  createUser: (dto) => req('POST', '/users', dto),
  updateUser: (id, dto) => req('PUT', `/users/${id}`, dto),
  deleteUser: (id) => req('DELETE', `/users/${id}`),

  // Shifts
  getOpenShift: (userId) => req('GET', `/staff-shifts/open/${userId}`),
  getOpenShiftByBranch: (branchId) => req('GET', `/staff-shifts/open/branch/${branchId}`),
  openShift: (dto) => req('POST', '/staff-shifts/open', dto),
  closeShift: (id, dto) => req('POST', `/staff-shifts/${id}/close`, dto),
  getShiftSummary: (id) => req('GET', `/staff-shifts/${id}/summary`),

  // Sale Orders
  createOrder: (dto) => req('POST', '/sale-orders', dto),
  confirmOrder: (id) => req('POST', `/sale-orders/${id}/confirm`),

  // Sale Invoices
  createInvoice: (dto) => req('POST', '/sale-invoices', dto),
  autoApplyDiscounts: (id) => req('POST', `/sale-invoices/${id}/auto-apply-discounts`),
  applyDiscount: (id, dto) => req('POST', `/sale-invoices/${id}/apply-discount`, dto),
  applyManualDiscount: (id, dto) => req('POST', `/sale-invoices/${id}/apply-manual-discount`, dto),
  confirmInvoice: (id) => req('POST', `/sale-invoices/${id}/confirm`),
  getInvoice: (id) => req('GET', `/sale-invoices/${id}`),

  // Receipts
  createReceipt: (dto) => req('POST', '/sale-receipts', dto),
  getReceipt: (id) => req('GET', `/sale-receipts/${id}`),

  // Toppings
  getToppings: () => req('GET', '/toppings?activeOnly=true'),
  getAllToppings: () => req('GET', '/toppings'),
  createTopping: (dto) => req('POST', '/toppings', dto),
  updateTopping: (id, dto) => req('PUT', `/toppings/${id}`, dto),
  deleteTopping: (id) => req('DELETE', `/toppings/${id}`),

  // Events
  getEvents: () => req('GET', '/events'),
  getActiveEvents: () => req('GET', '/events/active-now'),
  createEvent: (dto) => req('POST', '/events', dto),
  updateEvent: (id, dto) => req('PUT', `/events/${id}`, dto),
  deleteEvent: (id) => req('DELETE', `/events/${id}`),

  // Discounts
  getDiscounts: () => req('GET', '/discounts'),
  getDiscountsByEvent: (eventId) => req('GET', `/discounts?type=event`),
  createDiscount: (dto) => req('POST', '/discounts', dto),
  updateDiscount: (id, dto) => req('PUT', `/discounts/${id}`, dto),
  deleteDiscount: (id) => req('DELETE', `/discounts/${id}`),

  // Exchange rates
  getLatestRate: (from, to) =>
    req('GET', `/exchange-rates/latest?from=${from}&to=${to}`),
  convert: (from, to, amount) =>
    req('GET', `/exchange-rates/convert?from=${from}&to=${to}&amount=${amount}`),
  createExchangeRate: (dto) => req('POST', '/exchange-rates', dto),

  // Product Sizes
  getProductSizes: (productId) => req('GET', `/product-sizes?productId=${productId}`),
  createProductSize: (dto) => req('POST', '/product-sizes', dto),
  updateProductSize: (id, dto) => req('PUT', `/product-sizes/${id}`, dto),
  deleteProductSize: (id) => req('DELETE', `/product-sizes/${id}`),

  // Branches
  getBranches: () => req('GET', '/branches'),
  createBranch: (dto) => req('POST', '/branches', dto),
  updateBranch: (id, dto) => req('PUT', `/branches/${id}`, dto),
  deleteBranch: (id) => req('DELETE', `/branches/${id}`),

  // Reports
  getDailySummary: (date, branchId) => req('GET', `/reports/daily-summary?date=${date}${branchId ? `&branchId=${branchId}` : ''}`),
  getRevenueSummary: (startDate, endDate, branchId) =>
    req('GET', `/reports/revenue-summary?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
  getSalesByProduct: (startDate, endDate, branchId) =>
    req('GET', `/reports/sales-by-product?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
  getSalesByCategory: (startDate, endDate, branchId) =>
    req('GET', `/reports/sales-by-category?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
  getTopProducts: (startDate, endDate, branchId) =>
    req('GET', `/reports/top-products?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
  getPaymentBreakdown: (startDate, endDate, branchId) =>
    req('GET', `/reports/payment-breakdown?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
  getShiftHistory: (startDate, endDate, branchId) =>
    req('GET', `/reports/shift-history?startDate=${startDate}&endDate=${endDate}${branchId ? `&branchId=${branchId}` : ''}`),
}
