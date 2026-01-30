import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - List all users
export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only superadmin can view users
  if (auth.ruolo !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Solo i superadmin possono gestire gli utenti' },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.users.findMany({
      orderBy: [
        { ruolo: 'asc' },
        { nome: 'asc' },
      ],
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        ruolo: true,
        attivo: true,
        ultimoAccesso: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('[DASHBOARD USERS GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only superadmin can create users
  if (auth.ruolo !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Solo i superadmin possono creare utenti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, nome, cognome, ruolo } = body;

    // Validate required fields
    if (!email || !password || !nome || !cognome || !ruolo) {
      return NextResponse.json(
        { success: false, message: 'Tutti i campi sono obbligatori' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'manager', 'staff'];
    if (!validRoles.includes(ruolo)) {
      return NextResponse.json(
        { success: false, message: 'Ruolo non valido' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'La password deve avere almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email già registrata' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nome,
        cognome,
        ruolo,
        attivo: true,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        ruolo: true,
        attivo: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Utente creato',
      data: user,
    });
  } catch (error) {
    console.error('[DASHBOARD USERS POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione dell\'utente' },
      { status: 500 }
    );
  }
}

// PUT - Update a user
export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only superadmin can update users
  if (auth.ruolo !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Solo i superadmin possono modificare utenti' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, email, password, nome, cognome, ruolo, attivo } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID utente obbligatorio' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Prevent self-deactivation
    if (id === auth.userId && attivo === false) {
      return NextResponse.json(
        { success: false, message: 'Non puoi disattivare il tuo stesso account' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (email !== undefined) {
      // Check if new email is taken by another user
      const emailTaken = await prisma.users.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: id },
        },
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: 'Email già utilizzata da un altro utente' },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, message: 'La password deve avere almeno 8 caratteri' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (nome !== undefined) updateData.nome = nome;
    if (cognome !== undefined) updateData.cognome = cognome;
    if (ruolo !== undefined) {
      const validRoles = ['superadmin', 'admin', 'manager', 'staff'];
      if (!validRoles.includes(ruolo)) {
        return NextResponse.json(
          { success: false, message: 'Ruolo non valido' },
          { status: 400 }
        );
      }
      updateData.ruolo = ruolo;
    }
    if (attivo !== undefined) updateData.attivo = attivo;

    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        ruolo: true,
        attivo: true,
        ultimoAccesso: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Utente aggiornato',
      data: updatedUser,
    });
  } catch (error) {
    console.error('[DASHBOARD USERS PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento dell\'utente' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  // Only superadmin can delete users
  if (auth.ruolo !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Solo i superadmin possono eliminare utenti' },
      { status: 403 }
    );
  }

  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '');

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID utente non valido' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (id === auth.userId) {
      return NextResponse.json(
        { success: false, message: 'Non puoi eliminare il tuo stesso account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Instead of hard delete, deactivate
    await prisma.users.update({
      where: { id },
      data: { attivo: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Utente disattivato',
    });
  } catch (error) {
    console.error('[DASHBOARD USERS DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'eliminazione dell\'utente' },
      { status: 500 }
    );
  }
}
