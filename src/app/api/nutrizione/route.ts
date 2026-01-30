import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cognome, email, telefono, obiettivo, messaggio } = body;

    // Validazione
    if (!nome || !cognome || !email || !telefono || !obiettivo) {
      return NextResponse.json(
        { success: false, error: "Tutti i campi obbligatori devono essere compilati" },
        { status: 400 }
      );
    }

    // Salva nel database
    const contatto = await prisma.contatti_nutrizione.create({
      data: {
        nome,
        cognome,
        email,
        telefono,
        obiettivo,
        messaggio: messaggio || null,
      },
    });

    // Invia email di notifica al team
    const notificationEmail = process.env.NUTRITION_EMAIL || "nutrizione@24fit.it";

    await resend.emails.send({
      from: "24FIT <noreply@24fit.it>",
      to: notificationEmail,
      replyTo: email,
      subject: `Nuova richiesta consulenza nutrizione - ${nome} ${cognome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FDCF07;">Nuova Richiesta Consulenza Nutrizione</h2>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Dati del contatto</h3>
            <p><strong>Nome:</strong> ${nome} ${cognome}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Telefono:</strong> <a href="tel:${telefono}">${telefono}</a></p>
            <p><strong>Obiettivo:</strong> ${obiettivo}</p>
            ${messaggio ? `<p><strong>Messaggio:</strong><br/>${messaggio}</p>` : ""}
          </div>

          <p style="color: #666; font-size: 14px;">
            Data richiesta: ${new Date().toLocaleString("it-IT", {
              dateStyle: "full",
              timeStyle: "short"
            })}
          </p>
        </div>
      `,
    });

    // Invia email di conferma al cliente
    await resend.emails.send({
      from: "24FIT <noreply@24fit.it>",
      to: email,
      replyTo: "supporto@24fit.it",
      subject: "Abbiamo ricevuto la tua richiesta - 24FIT Nutrizione",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FDCF07;">Ciao ${nome}!</h2>

          <p>Grazie per aver richiesto una consulenza nutrizionale con 24FIT.</p>

          <p>Abbiamo ricevuto la tua richiesta e un nostro esperto ti contatterà al più presto per fissare un appuntamento.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Riepilogo richiesta</h3>
            <p><strong>Obiettivo:</strong> ${obiettivo}</p>
            ${messaggio ? `<p><strong>Note:</strong> ${messaggio}</p>` : ""}
          </div>

          <p>Nel frattempo, se hai domande, non esitare a contattarci:</p>
          <ul>
            <li>Email: <a href="mailto:supporto@24fit.it">supporto@24fit.it</a></li>
          </ul>

          <p style="margin-top: 30px;">A presto,<br><strong>Il Team 24FIT</strong></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Richiesta inviata con successo",
      id: contatto.id,
    });
  } catch (error) {
    console.error("[API] Errore contatto nutrizione:", error);
    return NextResponse.json(
      { success: false, error: "Errore durante l'invio della richiesta" },
      { status: 500 }
    );
  }
}
