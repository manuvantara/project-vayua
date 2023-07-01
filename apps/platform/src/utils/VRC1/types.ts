export type Profile = {
  avatar?: string;
  bio?: string;
  location?: string;
  name?: string;
  website?: string;
};

export type Extension = {
  standard: 'VRC1';
  target: 'User';
  version: '1.0.0';
};

export type UserStarringExtension = Extension & {
  organisations: `0x${string}`[];
};

export type UserProfile = Profile & { extension: UserStarringExtension };

export type OrganisationProfile = Profile;
