import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        nome: true,
        cognome: true,
        ruolo: true,
        attivo: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    if (!user.attivo) {
      return NextResponse.json(
        { success: false, message: 'Account disattivato' },
        { status: 403 }
      );
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Credenziali non valide' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        ruolo: user.ruolo,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { ultimoAccesso: new Date() },
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        ruolo: user.ruolo,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD AUTH LOGIN] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore durante il login' },
      { status: 500 }
    );
  }
}
