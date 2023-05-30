export const PROFILE_CONTRACT_ADDRESS =
  "0x1D27dA98f83803A6ddCD6c2e2599082916844973";

export const PROFILE_ABI = [
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
