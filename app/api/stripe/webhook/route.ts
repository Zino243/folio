import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS, ProductType } from '../checkout/route';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment successful:', session.id);
      
      const userId = session.metadata?.userId;
      const productType = session.metadata?.productType as ProductType | undefined;
      const quantity = parseInt(session.metadata?.quantity || '1', 10);

      if (!userId || !productType || !PRODUCTS[productType]) {
        console.error('Missing metadata for payment processing');
        return NextResponse.json({ received: true });
      }

      const product = PRODUCTS[productType];
      const creditsToAdd = {
        portfolios: (product.credits.portfolios || 0) * quantity,
        projects: (product.credits.projects || 0) * quantity,
        blogPosts: (product.credits.blogPosts || 0) * quantity,
      };

      console.log(`Adding credits to user ${userId}:`, creditsToAdd);
      console.log('UserId type:', typeof userId, 'length:', userId?.length);

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('portfolios_limit, projects_limit, blog_posts_limit')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile query error:', profileError);
        console.error('Profile query error details:', JSON.stringify(profileError));
      }

      if (!profile) {
        console.error('Profile not found for user:', userId);
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          portfolios_limit: profile.portfolios_limit + creditsToAdd.portfolios,
          projects_limit: profile.projects_limit + creditsToAdd.projects,
          blog_posts_limit: profile.blog_posts_limit + creditsToAdd.blogPosts,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user credits:', updateError);
      } else {
        console.log('User credits updated:', userId, creditsToAdd);
      }

      const { error: purchaseError } = await supabaseAdmin
        .from('purchases')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string,
          product_type: productType,
          amount_eur: session.amount_total || 0,
          credits_added: creditsToAdd.portfolios + creditsToAdd.projects + creditsToAdd.blogPosts,
          status: 'completed',
        });

      if (purchaseError) {
        console.error('Failed to record purchase:', purchaseError);
      }

      break;
    }
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

export const dynamic = 'force-dynamic';
