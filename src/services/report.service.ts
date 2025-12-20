import api from '@/lib/api'

export interface ReportParams {
  // Location
  latitude: number
  longitude: number
  address: string
  postalCode?: string
  administrativeArea?: string

  // Customer (optional)
  customerName?: string
  customerEmail?: string
  customerPhone?: string

  // Configuration
  panelCount?: number
  panelCapacityWatts?: number
  annualConsumptionKwh?: number
  purchaseRateRp?: number
  feedInRateRp?: number

  // Report settings
  language?: 'de' | 'fr' | 'it' | 'en'
}

class ReportService {
  /**
   * Download solar report as PDF
   */
  async downloadSolarReport(params: ReportParams): Promise<void> {
    try {
      const response = await api.post('/reports/solar-report', params, {
        responseType: 'blob',
      })

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and click it
      const link = document.createElement('a')
      link.href = url
      
      // Extract filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition']
      let filename = 'Solar_Report.pdf'
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      } else {
        // Generate filename from address
        const sanitizedAddress = params.address
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 30)
        const timestamp = new Date().toISOString().split('T')[0]
        filename = `Solar_Report_${sanitizedAddress}_${timestamp}.pdf`
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download report:', error)
      throw new Error('Failed to download report. Please try again.')
    }
  }

  /**
   * Get report preview data
   */
  async getReportPreview(params: ReportParams) {
    const response = await api.post('/reports/preview', params)
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to generate preview')
    }
    
    return response.data.data
  }
}

export const reportService = new ReportService()

