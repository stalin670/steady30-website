'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export const SignOutButton = () => {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <Button type="button" variant="outline" loading={signingOut} onClick={signOut} full>
      Sign out
    </Button>
  );
};
