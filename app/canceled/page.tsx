import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function CanceledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Canceled</h1>
        <p className="text-muted-foreground">Your payment was canceled.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
