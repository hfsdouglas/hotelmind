import { api } from '@/lib/axios'

export interface SuporteUsuario {
  id: string
  nome_completo: string
  email: string
}

export const suporteService = {
  listarUsuarios: (hotelId: string) =>
    api.get<SuporteUsuario[]>(`/admin/hoteis/${hotelId}/usuarios`).then(r => r.data),
  buildAcessoUrl: (hotelId: string, usuarioId: string) =>
    `${api.defaults.baseURL}/admin/hoteis/${hotelId}/suporte-acesso?usuario_id=${usuarioId}`,
}
