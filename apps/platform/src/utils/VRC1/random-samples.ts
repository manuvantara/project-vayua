// TODO: add random samples for DAO mockup

export const names = [
  'John Smith',
  'Mary Jones',
  'Susan Brown',
  'Peter Williams',
  'David Davis',
  'Sarah Miller',
  'Michael Johnson',
  'Jessica Garcia',
  'William Thompson',
  'Jennifer Walker',
];

export const bios = [
  `A curious and intelligent person who is always looking for new challenges.`,
  `A kind and compassionate person who is always willing to help others.`,
  `A creative and innovative person who is always coming up with new ideas.`,
  `A hard worker who is always willing to put in the effort to achieve their goals.`,
  `A positive and optimistic person who always sees the best in people and situations.`,
];

export const emojis = [
  '🐧',
  '🐙',
  '🦆',
  '🦉',
  '🐨',
  '🐿',
  '🦋',
  '🐞',
  '🐠',
  '🐬',
  '🐋',
  '💻',
  '📱',
  '📟',
  '📠',
  '🎥',
  '📷',
  '🎞',
  '💿',
  '📀',
  '📻',
  '🎙',
  '🚓',
  '🏎',
  '🚊',
  '🚇',
  '🚠',
  '🚡',
  '🚝',
  '🚞',
  '🚟',
  '🚠',
  '🚡',
];

export const locations = [
  {
    city: 'New York City',
    country: 'United States',
  },
  {
    city: 'London',
    country: 'United Kingdom',
  },
  {
    city: 'Paris',
    country: 'France',
  },
  {
    city: 'Rome',
    country: 'Italy',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
  },
  {
    city: 'Sydney',
    country: 'Australia',
  },
  {
    city: 'Beijing',
    country: 'China',
  },
  {
    city: 'Mexico City',
    country: 'Mexico',
  },
  {
    city: 'Rio de Janeiro',
    country: 'Brazil',
  },
];

export const wikipediaPages = [
  'https://w.wiki/3iPR',
  'https://w.wiki/3jRj',
  'https://w.wiki/3rg8',
  'https://w.wiki/6nC8',
  'https://w.wiki/3rQS',
  'https://w.wiki/3kEe',
  'https://w.wiki/3og7',
];

export const chooseRandomly = <T>(collection: T[]) =>
  collection[Math.floor(Math.random() * collection.length)];
