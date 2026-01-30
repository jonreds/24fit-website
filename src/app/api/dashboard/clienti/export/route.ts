import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Export clients as CSV
export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Non autorizzato' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all';

    // Build where clause based on filter
    interface WhereClause {
      stato_account?: string;
      abbonamento_attivo?: boolean;
      pausa_attiva?: boolean;
      abbonamento_scadenza?: {
        gte: Date;
        lte: Date;
      };
    }

    const where: WhereClause = {};

    switch (filter) {
      case 'active':
        where.abbonamento_attivo = true;
        where.pausa_attiva = false;
        break;
      case 'paused':
        where.pausa_attiva = true;
        break;
      case 'expired':
        where.abbonamento_attivo = false;
        break;
      case 'banned':
        where.stato_account = 'bannato';
        break;
      case 'expiring': {
        const now = new Date();
        const in7Days = new Date(now);
        in7Days.setDate(in7Days.getDate() + 7);
        where.abbonamento_attivo = true;
        where.abbonamento_scadenza = {
          gte: now,
          lte: in7Days,
        };
        break;
      }
      // 'all' - no filter
    }

    const clients = await prisma.clienti.findMany({
      where,
      include: {
        piano: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: [{ cognome: 'asc' }, { nome: 'asc' }],
    });

    // Build CSV content
    const headers = [
      'ID',
      'Nome',
      'Cognome',
      'Email',
      'Telefono',
      'Data Nascita',
      'Codice Fiscale',
      'Indirizzo',
      'Citta',
      'CAP',
      'Piano',
      'Abbonamento Attivo',
      'Data Scadenza',
      'In Pausa',
      'Pausa Inizio',
      'Pausa Fine',
      'Giorni Pausa Usati',
      'Giorni Pausa Totali',
      'Stato Account',
      'Data Registrazione',
      'Ultimo Accesso',
    ];

    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('it-IT');
    };

    const escapeCSV = (value: string | null | undefined | boolean | number) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = clients.map((client) => [
      client.id,
      escapeCSV(client.nome),
      escapeCSV(client.cognome),
      escapeCSV(client.email),
      escapeCSV(client.telefono),
      formatDate(client.data_nascita),
      escapeCSV(client.codice_fiscale),
      escapeCSV(client.indirizzo),
      escapeCSV(client.citta),
      escapeCSV(client.cap),
      escapeCSV(client.piano?.nome),
      client.abbonamento_attivo ? 'Si' : 'No',
      formatDate(client.abbonamento_scadenza),
      client.pausa_attiva ? 'Si' : 'No',
      formatDate(client.pausa_data_inizio),
      formatDate(client.pausa_data_fine),
      client.giorni_pausa_usati,
      client.giorni_pausa_totali,
      client.stato_account,
      formatDate(client.created_at),
      formatDate(client.ultimo_accesso),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Add BOM for Excel compatibility
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    const now = new Date();
    const filename = `clienti_24fit_${now.toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[CLIENTI EXPORT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'esportazione' },
      { status: 500 }
    );
  }
}
