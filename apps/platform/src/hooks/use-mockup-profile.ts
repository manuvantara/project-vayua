import { type Profile, mockupProfile, parseProfile } from '@/utils/VRC1';
import { useEffect, useState } from 'react';

type NonNullableProfile = Required<Profile>;

export default function useMockupProfile(delay: number = 500) {
  const [profile, setProfile] = useState<NonNullableProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (isMounted) {
        setProfile(null);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));

      if (isMounted) {
        setProfile(parseProfile(mockupProfile()) as NonNullableProfile);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [delay]);

  return {
    isLoading: profile === null,
    mockupProfile: profile,
  };
}
