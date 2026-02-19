'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutButtonProps {
  amount: number;
  currency?: string;
  title: string;
  description?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StripeCheckoutButton({
  amount,
  currency = 'usd',
  title,
  description,
  onSuccess,
  onCancel,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, title, description }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session');
        onCancel?.();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      onCancel?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? 'Processing...' : `Pay $${amount}`}
    </Button>
  );
}
