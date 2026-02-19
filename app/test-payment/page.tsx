'use client';

import { StripeCheckoutButton } from '@/components/stripe-checkout-button';

export default function TestPaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-6 border rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Test Payment</h1>
          <p className="text-muted-foreground">
            This is a test payment using Stripe
          </p>
        </div>

        <div className="space-y-4">
          <StripeCheckoutButton
            amount={10}
            title="Test Donation"
            description="Testing Stripe integration"
            onSuccess={() => console.log('Payment successful!')}
            onCancel={() => console.log('Payment canceled')}
          />

          <StripeCheckoutButton
            amount={25}
            title="Premium Support"
            description="Get premium support for your project"
          />

          <StripeCheckoutButton
            amount={50}
            title="Custom Amount"
            description="Pay what you want"
          />
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>Use card: 4242 4242 4242 4242</p>
          <p>Any future date, any CVC</p>
        </div>
      </div>
    </div>
  );
}
