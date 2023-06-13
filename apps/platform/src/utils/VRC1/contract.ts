export const VRC1_CONTRACT_ADDRESS =
  '0xC302097eCdC64fE36d2e2702E54f24bf72512A3e';

export const VRC1_CONTRACT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'profileOwner',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'bio',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'avatar',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'location',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'website',
            type: 'string',
          },
        ],
        indexed: false,
        internalType: 'struct VRC1.Profile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'ProfileChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'profileOwner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'extension',
        type: 'string',
      },
    ],
    name: 'ProfileExtensionChanged',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'profileExtensions',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'profiles',
    outputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'bio',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'avatar',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'location',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'website',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'bio',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'avatar',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'location',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'website',
            type: 'string',
          },
        ],
        internalType: 'struct VRC1.Profile',
        name: '_profile',
        type: 'tuple',
      },
    ],
    name: 'setProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_extension',
        type: 'string',
      },
    ],
    name: 'setProfileExtension',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
