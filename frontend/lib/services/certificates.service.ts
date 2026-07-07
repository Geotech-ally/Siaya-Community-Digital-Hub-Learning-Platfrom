import api from '@/lib/api';
import type { Certificate } from '@/types';

export const certificatesService = {
  myCertificates: () => api.get<Certificate[]>('/certificates/me').then((r) => r.data),

  allCertificates: (params?: { page?: number; pageSize?: number }) =>
    api.get<Certificate[]>('/certificates', { params }).then((r) => r.data),

  download: (certificateId: string) =>
    api.get<{ downloadUrl: string; certificate: Certificate }>(`/certificates/${certificateId}/download`).then((r) => r.data),
};
