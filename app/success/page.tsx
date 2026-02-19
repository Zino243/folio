import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">¡Pago completado!</h1>
        <p className="text-muted-foreground">
          Tu pago ha sido procesado correctamente. Los créditos se han añadido a tu cuenta.
        </p>
        <Button asChild>
          <Link href="/dashboard/settings">Ver mi cuenta</Link>
        </Button>
      </div>
    </div>
  );
}
