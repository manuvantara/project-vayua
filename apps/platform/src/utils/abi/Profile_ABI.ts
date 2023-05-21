export const Profile_ABI = {
  address: "0x6D82bA0C308156E5579Da9a2C3c00aA579D9e09c",
  abi: [
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
  ],
} as const;
