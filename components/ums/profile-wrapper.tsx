'use client';

import dynamic from 'next/dynamic';

const ProfileWrapper = dynamic(() => import('./profile'), {
  ssr: false, // Disable SSR
});

export default ProfileWrapper;