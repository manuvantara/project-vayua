export const VRC1_CONTRACT_ADDRESS =
  "0xC302097eCdC64fE36d2e2702E54f24bf72512A3e";

export const VRC1_CONTRACT_ABI = [
  {
    type: "event",
    anonymous: false,
    name: "ProfileChanged",
    inputs: [
      {
        type: "address",
        name: "profileOwner",
        indexed: false,
      },
      {
        type: "tuple",
        name: "profile",
        indexed: false,
        components: [
          {
            type: "string",
            name: "name",
          },
          {
            type: "string",
            name: "bio",
          },
          {
            type: "string",
            name: "avatar",
          },
          {
            type: "string",
            name: "location",
          },
          {
            type: "string",
            name: "website",
          },
        ],
      },
    ],
  },
  {
    type: "event",
    anonymous: false,
    name: "ProfileExtensionChanged",
    inputs: [
      {
        type: "address",
        name: "profileOwner",
        indexed: false,
      },
      {
        type: "string",
        name: "extension",
        indexed: false,
      },
    ],
  },
  {
    type: "function",
    name: "profileExtensions",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
      },
    ],
    outputs: [
      {
        type: "string",
      },
    ],
  },
  {
    type: "function",
    name: "profiles",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
      },
    ],
    outputs: [
      {
        type: "string",
        name: "name",
      },
      {
        type: "string",
        name: "bio",
      },
      {
        type: "string",
        name: "avatar",
      },
      {
        type: "string",
        name: "location",
      },
      {
        type: "string",
        name: "website",
      },
    ],
  },
  {
    type: "function",
    name: "setProfile",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "_profile",
        components: [
          {
            type: "string",
            name: "name",
          },
          {
            type: "string",
            name: "bio",
          },
          {
            type: "string",
            name: "avatar",
          },
          {
            type: "string",
            name: "location",
          },
          {
            type: "string",
            name: "website",
          },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setProfileExtension",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "string",
        name: "_extension",
      },
    ],
    outputs: [],
  },
] as const;
