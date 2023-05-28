export const Profile_ABI = {
  address: "0x4C36314a3027531101a03799b60c4f12E75A91B0",
  abi: [
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
  ],
} as const;
