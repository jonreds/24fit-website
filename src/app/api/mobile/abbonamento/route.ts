import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyClientToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get subscription details
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
        abbonamento_attivo: true,
        abbonamento_tipo: true,
        abbonamento_scadenza: true,
        giorni_pausa_totali: true,
        giorni_pausa_usati: true,
        pausa_attiva: true,
        pausa_data_inizio: true,
        pausa_data_fine: true,
        piano: {
          select: {
            id: true,
            nome: true,
            durata_mesi: true,
            giorni_pausa_inclusi: true,
            pausa_minima_giorni: true,
          },
        },
        pause: {
          orderBy: { created_at: 'desc' },
          take: 10,
          select: {
            id: true,
            data_inizio: true,
            data_fine: true,
            giorni: true,
            tipo: true,
            motivo: true,
            created_at: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    // Calculate remaining pause days
    const giorniPausaRimanenti = client.giorni_pausa_totali - client.giorni_pausa_usati;

    // Calculate days until subscription ends
    let giorniRimanenti = null;
    if (client.abbonamento_scadenza) {
      const today = new Date();
      const endDate = new Date(client.abbonamento_scadenza);
      giorniRimanenti = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return NextResponse.json({
      success: true,
      data: {
        abbonamento: {
          attivo: client.abbonamento_attivo,
          tipo: client.abbonamento_tipo,
          scadenza: client.abbonamento_scadenza,
          giorni_rimanenti: giorniRimanenti,
        },
        pausa: {
          attiva: client.pausa_attiva,
          data_inizio: client.pausa_data_inizio,
          data_fine: client.pausa_data_fine,
          giorni_totali: client.giorni_pausa_totali,
          giorni_usati: client.giorni_pausa_usati,
          giorni_rimanenti: giorniPausaRimanenti,
          minimo_giorni: client.piano?.pausa_minima_giorni || 3,
        },
        piano: client.piano,
        storico_pause: client.pause,
      },
    });
  } catch (error) {
    console.error('[ABBONAMENTO GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero abbonamento' },
      { status: 500 }
    );
  }
}

// POST - Create/manage pause
export async function POST(request: NextRequest) {
  const auth = await verifyClientToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, giorni } = body;

    const client = await prisma.clienti.findUnique({
      where: { id: auth.clientId },
      select: {
        id: true,
        abbonamento_attivo: true,
        abbonamento_scadenza: true,
        giorni_pausa_totali: true,
        giorni_pausa_usati: true,
        pausa_attiva: true,
        pausa_data_inizio: true,
        piano: {
          select: {
            pausa_minima_giorni: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    if (!client.abbonamento_attivo) {
      return NextResponse.json(
        { success: false, message: 'Nessun abbonamento attivo' },
        { status: 400 }
      );
    }

    const giorniPausaRimanenti = client.giorni_pausa_totali - client.giorni_pausa_usati;
    const minimoGiorni = client.piano?.pausa_minima_giorni || 3;

    if (action === 'start') {
      // Start pause
      if (client.pausa_attiva) {
        return NextResponse.json(
          { success: false, message: 'Hai già una pausa attiva' },
          { status: 400 }
        );
      }

      if (!giorni || giorni < minimoGiorni) {
        return NextResponse.json(
          { success: false, message: `La pausa deve essere di almeno ${minimoGiorni} giorni` },
          { status: 400 }
        );
      }

      if (giorni > giorniPausaRimanenti) {
        return NextResponse.json(
          { success: false, message: `Hai solo ${giorniPausaRimanenti} giorni di pausa rimanenti` },
          { status: 400 }
        );
      }

      const dataInizio = new Date();
      const dataFine = new Date();
      dataFine.setDate(dataFine.getDate() + giorni);

      // Start the pause
      await prisma.$transaction([
        prisma.clienti.update({
          where: { id: client.id },
          data: {
            pausa_attiva: true,
            pausa_data_inizio: dataInizio,
            pausa_data_fine: dataFine,
            giorni_pausa_usati: client.giorni_pausa_usati + giorni,
            // Extend subscription end date
            abbonamento_scadenza: client.abbonamento_scadenza
              ? new Date(new Date(client.abbonamento_scadenza).getTime() + giorni * 24 * 60 * 60 * 1000)
              : null,
          },
        }),
        prisma.pause_abbonamento.create({
          data: {
            cliente_id: client.id,
            data_inizio: dataInizio,
            data_fine: dataFine,
            giorni,
            tipo: 'cliente',
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: `Pausa di ${giorni} giorni attivata`,
        data: {
          data_inizio: dataInizio,
          data_fine: dataFine,
          giorni_usati: client.giorni_pausa_usati + giorni,
          giorni_rimanenti: giorniPausaRimanenti - giorni,
        },
      });
    } else if (action === 'end') {
      // End pause early
      if (!client.pausa_attiva) {
        return NextResponse.json(
          { success: false, message: 'Nessuna pausa attiva' },
          { status: 400 }
        );
      }

      const dataOggi = new Date();
      const giorniUsati = Math.max(
        minimoGiorni,
        Math.ceil((dataOggi.getTime() - new Date(client.pausa_data_inizio!).getTime()) / (1000 * 60 * 60 * 24))
      );

      // Find the current pause record
      const currentPause = await prisma.pause_abbonamento.findFirst({
        where: {
          cliente_id: client.id,
          data_inizio: client.pausa_data_inizio!,
        },
        orderBy: { created_at: 'desc' },
      });

      const giorniRecuperati = currentPause ? currentPause.giorni - giorniUsati : 0;

      await prisma.$transaction([
        prisma.clienti.update({
          where: { id: client.id },
          data: {
            pausa_attiva: false,
            pausa_data_inizio: null,
            pausa_data_fine: null,
            // Adjust pause days used (minimum is enforced)
            giorni_pausa_usati: Math.max(0, client.giorni_pausa_usati - giorniRecuperati),
            // Adjust subscription end date back
            abbonamento_scadenza: client.abbonamento_scadenza
              ? new Date(new Date(client.abbonamento_scadenza).getTime() - giorniRecuperati * 24 * 60 * 60 * 1000)
              : null,
          },
        }),
        // Update the pause record
        currentPause ? prisma.pause_abbonamento.update({
          where: { id: currentPause.id },
          data: {
            data_fine: dataOggi,
            giorni: giorniUsati,
            motivo: 'Terminata in anticipo dal cliente',
          },
        }) : null,
      ].filter(Boolean) as any[]);

      return NextResponse.json({
        success: true,
        message: `Pausa terminata. ${giorniRecuperati} giorni recuperati.`,
        data: {
          giorni_usati: giorniUsati,
          giorni_recuperati: giorniRecuperati,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Azione non valida. Usa "start" o "end"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[ABBONAMENTO POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella gestione della pausa' },
      { status: 500 }
    );
  }
}
