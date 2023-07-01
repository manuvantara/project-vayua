export const PROFILE_CONTRACT_ADDRESS =
  '0xe380DaA1355d416731b048cd0d23B6d769FF7E57';

export const PROFILE_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: 'owner',
        type: 'address',
      },
      {
        components: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'bio',
            type: 'string',
          },
          {
            name: 'avatar',
            type: 'string',
          },
          {
            name: 'location',
            type: 'string',
          },
          {
            name: 'website',
            type: 'string',
          },
          {
            name: 'extra',
            type: 'string',
          },
        ],
        indexed: false,
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'ProfileChanged',
    type: 'event',
  },
  {
    constant: true,
    inputs: [
      {
        type: 'address',
      },
    ],
    name: 'profiles',
    outputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'bio',
        type: 'string',
      },
      {
        name: 'avatar',
        type: 'string',
      },
      {
        name: 'location',
        type: 'string',
      },
      {
        name: 'website',
        type: 'string',
      },
      {
        name: 'extra',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_extra',
        type: 'string',
      },
    ],
    name: 'setExtra',
    outputs: [],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        components: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'bio',
            type: 'string',
          },
          {
            name: 'avatar',
            type: 'string',
          },
          {
            name: 'location',
            type: 'string',
          },
          {
            name: 'website',
            type: 'string',
          },
          {
            name: 'extra',
            type: 'string',
          },
        ],
        name: '_profile',
        type: 'tuple',
      },
    ],
    name: 'setProfile',
    outputs: [],
    payable: false,
    type: 'function',
  },
] as const;
