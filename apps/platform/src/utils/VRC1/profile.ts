// TODO: is it possible to create a convinient function that will parse the output of the smart contract based on its ABI
// TODO: add mockupOrganisation

import type { Profile } from "./types";

import {
  chooseRandomly,
  names,
  bios,
  emojis,
  locations,
  wikipediaPages,
} from "./random-samples";

export const generateAvatarUrl = (filename: string, text?: string) =>
  `https://avatar.vercel.sh/${filename}.svg?text=${text}`;

export const mockupAvatarUrl = () =>
  generateAvatarUrl(chooseRandomly(emojis), chooseRandomly(emojis));

export const mockupProfile = (): [string, string, string, string, string] => {
  const name = chooseRandomly(names);
  const bio = chooseRandomly(bios);

  const avatar = generateAvatarUrl(
    chooseRandomly(emojis),
    chooseRandomly(emojis)
  );

  const { city, country } = chooseRandomly(locations);
  const location = `${city}, ${country}`;

  const website = chooseRandomly(wikipediaPages);

  return [name, bio, avatar, location, website];
};

export function parseProfile(
  data: readonly [string, string, string, string, string]
): Profile {
  const profile: Profile = {};

  if (data[0].length > 0) {
    profile.name = data[0];
  }

  if (data[1].length > 0) {
    profile.bio = data[1];
  }

  if (data[2].length > 0) {
    profile.avatar = data[2];
  }

  if (data[3].length > 0) {
    profile.location = data[3];
  }

  if (data[4].length > 0) {
    profile.website = data[4];
  }

  return profile;
}
