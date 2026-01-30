import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyClientToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get profile details
export async function GET(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const client = await prisma.clienti.findUnique({
      where: { id: auth.clientId },
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        telefono: true,
        data_nascita: true,
        luogo_nascita: true,
        codice_fiscale: true,
        indirizzo: true,
        citta: true,
        cap: true,
        provincia: true,
        sesso: true,
        avatar: true,
        documento_tipo: true,
        documento_fronte: true,
        documento_retro: true,
        documento_verificato: true,
        onboarding_completato: true,
        created_at: true,
        ultimo_accesso: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error('[PROFILO GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero profilo' },
      { status: 500 }
    );
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      nome,
      cognome,
      telefono,
      indirizzo,
      citta,
      cap,
      provincia,
      avatar,
      currentPassword,
      newPassword,
    } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (nome) updateData.nome = nome;
    if (cognome) updateData.cognome = cognome;
    if (telefono) updateData.telefono = telefono;
    if (indirizzo) updateData.indirizzo = indirizzo;
    if (citta) updateData.citta = citta;
    if (cap) updateData.cap = cap;
    if (provincia) updateData.provincia = provincia?.toUpperCase();
    if (avatar) updateData.avatar = avatar;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: 'Inserisci la password attuale per cambiarla' },
          { status: 400 }
        );
      }

      const client = await prisma.clienti.findUnique({
        where: { id: auth.clientId },
        select: { password: true },
      });

      if (!client?.password) {
        return NextResponse.json(
          { success: false, message: 'Password non impostata' },
          { status: 400 }
        );
      }

      const validPassword = await bcrypt.compare(currentPassword, client.password);
      if (!validPassword) {
        return NextResponse.json(
          { success: false, message: 'Password attuale non corretta' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'La nuova password deve avere almeno 8 caratteri' },
          { status: 400 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update client
    const updatedClient = await prisma.clienti.update({
      where: { id: auth.clientId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nome: true,
        cognome: true,
        telefono: true,
        indirizzo: true,
        citta: true,
        cap: true,
        provincia: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato',
      data: updatedClient,
    });
  } catch (error) {
    console.error('[PROFILO PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento del profilo' },
      { status: 500 }
    );
  }
}
