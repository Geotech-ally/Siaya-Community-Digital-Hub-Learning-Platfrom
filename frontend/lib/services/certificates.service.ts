import api from '@/lib/api';
import type { Certificate } from '@/types';

export const certificatesService = {
  myCertificates: () => api.get<Certificate[]>('/certificates/me').then((r) => r.data),

  allCertificates: (params?: { page?: number; pageSize?: number }) =>
    api.get<Certificate[]>('/certificates', { params }).then((r) => r.data),

  // Trigger a completion check; auto-issues the certificate if all requirements are met.
  checkAndIssue: (learnerId: string, courseId: string) =>
    api
      .post<{ issued: boolean; certificate?: Certificate; status?: unknown }>(
        `/certificates/check/learner/${learnerId}/course/${courseId}`,
      )
      .then((r) => r.data),

  // Direct URL to the generated PDF stream (opens/downloads in browser).
  fileUrl: (certificateId: string) => `/api/v1/certificates/${certificateId}/file`,

  verify: (certificateNo: string) =>
    api.get<{ valid: boolean; courseTitle: string; learnerName: string; issuedAt: string }>(
      `/certificates/verify/${certificateNo}`,
    ).then((r) => r.data),

  shareEmail: (certificateId: string, recipientEmail: string, message?: string) =>
    api
      .post<{ sent: boolean; verifyUrl: string }>(`/certificates/${certificateId}/share/email`, {
        recipientEmail,
        message,
      })
      .then((r) => r.data),

  shareLinkedIn: (certificateId: string) =>
    api
      .get<{ url: string; verifyUrl: string }>(`/certificates/${certificateId}/share/linkedin`)
      .then((r) => r.data),
};
