import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // ═══════════════════════════════════════════════════════════════
  // 1. Create Superadmin User
  // ═══════════════════════════════════════════════════════════════
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@24fit.it';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin24fit!2024';

  const existingAdmin = await prisma.users.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✓ Admin user already exists: ${adminEmail}`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.users.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nome: 'Admin',
        cognome: '24FIT',
        ruolo: 'superadmin',
        attivo: true,
      },
    });

    console.log(`✓ Created superadmin: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  ⚠️  CAMBIA LA PASSWORD DOPO IL PRIMO ACCESSO!\n');
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. Create Base Plans
  // ═══════════════════════════════════════════════════════════════
  const plans = [
    {
      nome: 'Trimestrale',
      descrizione: 'Abbonamento trimestrale con accesso 24/7',
      durata_mesi: 3,
      prezzo: 99.00,
      quota_iscrizione: 30.00,
      giorni_pausa_inclusi: 7,
      pausa_minima_giorni: 3,
      popolare: false,
      in_evidenza: false,
      ordine: 1,
      features: JSON.stringify([
        'Accesso 24/7',
        'Tutte le sedi',
        'App dedicata',
        '7 giorni di pausa inclusi',
      ]),
    },
    {
      nome: 'Semestrale',
      descrizione: 'Abbonamento semestrale - il più scelto!',
      durata_mesi: 6,
      prezzo: 179.00,
      quota_iscrizione: 30.00,
      giorni_pausa_inclusi: 14,
      pausa_minima_giorni: 3,
      popolare: true,
      in_evidenza: true,
      ordine: 2,
      features: JSON.stringify([
        'Accesso 24/7',
        'Tutte le sedi',
        'App dedicata',
        '14 giorni di pausa inclusi',
        'Prezzo mensile più basso',
      ]),
    },
    {
      nome: 'Annuale',
      descrizione: 'Abbonamento annuale - massimo risparmio',
      durata_mesi: 12,
      prezzo: 299.00,
      quota_iscrizione: 0.00,
      giorni_pausa_inclusi: 30,
      pausa_minima_giorni: 3,
      popolare: false,
      in_evidenza: false,
      ordine: 3,
      features: JSON.stringify([
        'Accesso 24/7',
        'Tutte le sedi',
        'App dedicata',
        '30 giorni di pausa inclusi',
        'Quota iscrizione GRATIS',
        'Miglior prezzo mensile',
      ]),
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.piani.findFirst({
      where: { nome: plan.nome },
    });

    if (existing) {
      console.log(`✓ Plan already exists: ${plan.nome}`);
    } else {
      const prezzoMensile = plan.prezzo / plan.durata_mesi;
      const prezzoTotale = plan.prezzo + plan.quota_iscrizione;

      await prisma.piani.create({
        data: {
          ...plan,
          prezzo_mensile: prezzoMensile,
          prezzo_totale: prezzoTotale,
          attivo: true,
        },
      });

      console.log(`✓ Created plan: ${plan.nome} (€${plan.prezzo})`);
    }
  }

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
