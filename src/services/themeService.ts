// ============================================================
// themeService.ts — logo enviada como base64 comprimido
// (ver compressImageToBase64 em src/utils) junto com o tema,
// sem endpoint separado de upload, sem multer
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
}
