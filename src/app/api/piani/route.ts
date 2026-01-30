import { NextRequest, NextResponse } from 'next/server';
import { PLANS } from '@/data/constants';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Use local API server (port 3001) instead of external domain to avoid DNS issues
const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const strutturaId = url.searchParams.get('strutturaId');

  try {
    const response = await fetch(`${API_URL}/api/public/piani`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans from API');
    }

    let data = await response.json();

    // If strutturaId is provided, check for structure-specific promotions
    if (strutturaId && data.success && data.data) {
      data = await applyStructurePromotions(data, strutturaId);
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching plans from backend, using fallback:', error);

    // Return fallback plans from constants
    let fallbackData = {
      success: true,
      data: PLANS.map(plan => ({
        ...plan,
        // Ensure all required fields are present
        promoActive: plan.promoActive || false,
        promoText: plan.promoText || null,
        promoPrice: plan.promoPrice || null,
      }))
    };

    // Apply structure promotions to fallback data too
    if (strutturaId) {
      fallbackData = await applyStructurePromotions(fallbackData, strutturaId);
    }

    return NextResponse.json(
      fallbackData,
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  }
}

// Apply structure-specific promotions to plans
async function applyStructurePromotions(
  data: { success: boolean; data: any[] },
  strutturaId: string
): Promise<{ success: boolean; data: any[] }> {
  try {
    const now = new Date();

    // Fetch active structure promotions
    const promozioni = await prisma.promozioni_struttura.findMany({
      where: {
        struttura_id: strutturaId,
        promo_attiva: true,
        OR: [
          // No date restrictions
          {
            data_inizio: null,
            data_fine: null,
          },
          // Within date range
          {
            data_inizio: { lte: now },
            data_fine: { gte: now },
          },
          // Started but no end date
          {
            data_inizio: { lte: now },
            data_fine: null,
          },
          // Not started yet but ends after now
          {
            data_inizio: null,
            data_fine: { gte: now },
          },
        ],
      },
    });

    if (promozioni.length === 0) {
      return data;
    }

    // Create a map of piano_id -> promo
    const promoMap = new Map<number, typeof promozioni[0]>();
    for (const promo of promozioni) {
      promoMap.set(promo.piano_id, promo);
    }

    // Apply promotions to plans
    const updatedPlans = data.data.map((plan: any) => {
      const planId = typeof plan.id === 'string' ? parseInt(plan.id) : plan.id;
      const structurePromo = promoMap.get(planId);

      if (structurePromo) {
        // Structure-specific promo overrides global promo
        return {
          ...plan,
          promoActive: true,
          promoText: structurePromo.promo_nome || plan.promoText,
          // promoPrice from structure promo (this is the discounted subscription price, not total)
          // Add activation fee to get total promo price
          promoPrice: structurePromo.promo_prezzo
            ? Number(structurePromo.promo_prezzo) + (plan.activationFee || 0)
            : plan.promoPrice,
          // Flag to indicate this is a structure-specific promo
          isStructurePromo: true,
        };
      }

      return plan;
    });

    return {
      success: true,
      data: updatedPlans,
    };
  } catch (error) {
    console.error('Error applying structure promotions:', error);
    // Return original data if something goes wrong
    return data;
  }
}
