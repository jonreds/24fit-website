import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

export interface AuthClient {
  clientId: number;
  email: string;
}

export interface AuthUser {
  userId: number;
  ruolo: string;
}

// Verify JWT token for mobile app (clients)
export async function verifyClientToken(request: NextRequest): Promise<AuthClient | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH CLIENT] No auth header');
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { clientId?: number; email?: string };

    if (!decoded.clientId) {
      console.log('[AUTH CLIENT] No clientId in token');
      return null;
    }

    // Verify client exists and is active
    const client = await prisma.clienti.findUnique({
      where: { id: decoded.clientId },
      select: {
        id: true,
        email: true,
        stato_account: true,
        abbonamento_attivo: true,
      },
    });

    if (!client) {
      console.log('[AUTH CLIENT] Client not found');
      return null;
    }

    if (client.stato_account !== 'attivo') {
      console.log('[AUTH CLIENT] Client account not active:', client.stato_account);
      return null;
    }

    return { clientId: client.id, email: client.email };
  } catch (error) {
    console.error('[AUTH CLIENT] Error:', error);
    return null;
  }
}

// Verify JWT token for dashboard (admins/staff)
export async function verifyAdminToken(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH ADMIN] No auth header');
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; ruolo?: string };

    if (!decoded.userId) {
      console.log('[AUTH ADMIN] No userId in token');
      return null;
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: { id: true, ruolo: true, attivo: true },
    });

    if (!user || !user.attivo) {
      console.log('[AUTH ADMIN] User not found or inactive');
      return null;
    }

    const validRoles = ['superadmin', 'admin', 'staff', 'manager'];
    if (!validRoles.includes(user.ruolo)) {
      console.log('[AUTH ADMIN] Invalid role:', user.ruolo);
      return null;
    }

    return { userId: user.id, ruolo: user.ruolo };
  } catch (error) {
    console.error('[AUTH ADMIN] Error:', error);
    return null;
  }
}

// Generate JWT token for client login
export function generateClientToken(clientId: number, email: string): string {
  return jwt.sign(
    { clientId, email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Generate JWT token for admin login
export function generateAdminToken(userId: number, ruolo: string): string {
  return jwt.sign(
    { userId, ruolo },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Role hierarchy for notes visibility
export const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

export function canViewNote(viewerRole: string, noteVisibility: string, authorRole: string): boolean {
  const viewerLevel = ROLE_HIERARCHY[viewerRole as keyof typeof ROLE_HIERARCHY] || 0;
  const authorLevel = ROLE_HIERARCHY[authorRole as keyof typeof ROLE_HIERARCHY] || 0;

  switch (noteVisibility) {
    case 'all':
      return true;
    case 'admin+':
      return viewerLevel >= ROLE_HIERARCHY.admin;
    case 'manager+':
      return viewerLevel >= ROLE_HIERARCHY.manager;
    case 'same_level':
      return viewerLevel >= authorLevel;
    default:
      return true;
  }
}

export function canEditNote(editorRole: string, authorRole: string): boolean {
  const editorLevel = ROLE_HIERARCHY[editorRole as keyof typeof ROLE_HIERARCHY] || 0;
  const authorLevel = ROLE_HIERARCHY[authorRole as keyof typeof ROLE_HIERARCHY] || 0;

  // Can only edit notes from same level or below
  return editorLevel >= authorLevel;
}
