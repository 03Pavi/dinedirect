export interface ApiResponse<T = any> {
  data?: T
  error?: string
  [key: string]: any
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    const response = await fetch(endpoint, config)

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData && errorData.error) {
          errorMessage = errorData.error
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // Fallback to text
        const text = await response.text()
        if (text) errorMessage = text
      }
      throw new Error(errorMessage)
    }

    // 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
