import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export type ProductType = 'portfolio_pack' | 'projects_pack' | 'blog_pack';

export const PRODUCTS = {
  portfolio_pack: {
    name: 'Pack Portfolio',
    description: '1 Portfolio + 3 Proyectos adicionales',
    priceEur: 999,
    credits: {
      portfolios: 1,
      projects: 3,
      blogPosts: 0,
    },
  },
  projects_pack: {
    name: 'Pack Proyectos',
    description: '5 Proyectos adicionales',
    priceEur: 499,
    credits: {
      portfolios: 0,
      projects: 5,
      blogPosts: 0,
    },
  },
  blog_pack: {
    name: 'Pack Blog',
    description: '5 Posts de blog adicionales',
    priceEur: 499,
    credits: {
      portfolios: 0,
      projects: 0,
      blogPosts: 5,
    },
  },
} as const;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productType, quantity = 1 } = await request.json();

    if (!productType || !PRODUCTS[productType as ProductType]) {
      return NextResponse.json(
        { error: 'Tipo de producto inválido' },
        { status: 400 }
      );
    }

    const product = PRODUCTS[productType as ProductType];
    const totalAmount = product.priceEur * quantity;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: totalAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/dashboard/settings?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/dashboard/settings?canceled=true`,
      metadata: {
        userId: user.id,
        productType,
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
