import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { authenticate, requireRole } from './auth.ts';

export const certificatesRouter = Router();

// GET /api/certificates/verify/:id - Public certificate verification
certificatesRouter.get('/verify/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const certificates = db.get('certificates');
  const cert = certificates.find(c => c.id.toLowerCase() === id.toLowerCase().trim());

  if (!cert) {
    return res.status(404).json({
      status: 'not_found',
      message: 'Certificate not found in the official LingoPro verification registry.',
    });
  }

  return res.json({
    status: cert.status, // 'valid' or 'revoked'
    certificate: cert,
    revocationReason: cert.revocationReason || null,
  });
});

// GET /api/certificates/user - Authenticated user's certificates
certificatesRouter.get('/user', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const certificates = db.get('certificates');
  const userCerts = certificates.filter(c => c.userId === user.id);
  return res.json({ certificates: userCerts });
});

// GET /api/certificates/:id - Certificate details
certificatesRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const certificates = db.get('certificates');
  const cert = certificates.find(c => c.id.toLowerCase() === id.toLowerCase().trim());
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });
  return res.json({ certificate: cert });
});

// POST /api/certificates/revoke/:id - Admin revoke
certificatesRouter.post('/revoke/:id', authenticate, requireRole(['admin']), (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const certificates = db.get('certificates');
  const cert = certificates.find(c => c.id.toLowerCase() === id.toLowerCase().trim());
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });

  db.update('certificates', list =>
    list.map(c =>
      c.id.toLowerCase() === id.toLowerCase().trim()
        ? { ...c, status: 'revoked', revocationReason: reason || 'Administrative audit revocation' }
        : c
    )
  );

  return res.json({ message: 'Certificate revoked', certificateId: id });
});

// POST /api/certificates/restore/:id - Admin restore
certificatesRouter.post('/restore/:id', authenticate, requireRole(['admin']), (req: Request, res: Response) => {
  const { id } = req.params;

  const certificates = db.get('certificates');
  const cert = certificates.find(c => c.id.toLowerCase() === id.toLowerCase().trim());
  if (!cert) return res.status(404).json({ error: 'Certificate not found' });

  db.update('certificates', list =>
    list.map(c =>
      c.id.toLowerCase() === id.toLowerCase().trim()
        ? { ...c, status: 'valid', revocationReason: undefined }
        : c
    )
  );

  return res.json({ message: 'Certificate restored to valid status', certificateId: id });
});
