// ============================================================
// themeService.ts — logo convertida para base64 no frontend
// Sem endpoint separado de upload, sem multer
// ============================================================
import api from './api'
import { StoreTheme } from '../types/theme'

export const themeService = {
  async getTheme(): Promise<StoreTheme> {
    const { data } = await api.get('/settings/theme')
    return data.data
  },

  async saveTheme(theme: Partial<StoreTheme>): Promise<StoreTheme> {
    const { data } = await api.put('/settings/theme', theme)
    return data.data
  },

  // Converte File → base64 localmente (sem upload separado)
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
      reader.readAsDataURL(file)
    })
  },
}
