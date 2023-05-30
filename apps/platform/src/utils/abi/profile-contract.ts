export const PROFILE_CONTRACT_ADDRESS =
  "0xe380DaA1355d416731b048cd0d23B6d769FF7E57";

export const PROFILE_ABI = [
  {
    type: "event",
    anonymous: false,
    name: "ProfileChanged",
    inputs: [
      {
        type: "address",
        name: "owner",
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
          {
            type: "string",
            name: "extra",
          },
        ],
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
      {
        type: "string",
        name: "extra",
      },
    ],
  },
  {
    type: "function",
    name: "setExtra",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "string",
        name: "_extra",
      },
    ],
    outputs: [],
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
          {
            type: "string",
            name: "extra",
          },
        ],
      },
    ],
    outputs: [],
  },
] as const;
