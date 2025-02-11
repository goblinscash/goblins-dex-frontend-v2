type UniswapContract = {
    factory?: string;
    nfpm?: string;
};

type UniswapContracts = Record<number, UniswapContract>;

export const uniswapContracts: UniswapContracts = {
    84532: {
        factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
        nfpm: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
    },
    56: {}
};


export const vfatContracts = {
    84532: {
        UniswapV3Connector: "0x5d6094F3d68d725153d0938ce5b0E4D7815B42A7",
        AerodromeRouterConnector: "0x43FDB828aD3D705Fc5D25467f078a724fC209c5D",
        NftFarmStrategy: "0xE174bB384365CBD50BF50E8dEeA7DF8b8808dfac",
        SickleImplementation: "0x527A36c3C0e66d10664954cd86B156670e6871E0",
        SickleFactory: "0x62fB598f4a7379Ca36c2d031443F6c97B8F60C3f",
        NftSettingsRegistry: "0xcec6e003108B15FA31A7F5BD80f91aAab3E565CF",
        SickleRegistry: "0xFd8E0705EdCc01A142ed0a8e76F036e38B72Bcc3",
        ConnectorRegistry: "0xdBaE2aA28b83b952f7542F87420897F4e12F1A99",
        NftTransferLib: "0xa2C3056E4150A9Df0459FEd70Bc735702dC6Cc30",
        NftSettingsLib: "0x4FDAd64621cd20CCC94164bF81C299ff75346E6a",
        FeesLib: "0x2c2fC8A1CDa7d853a214e294ea40De03d9fC1d2D",
        TransferLib: "0x64e72a67eaE17aa771D97eA07e3407b171f33Fe5",
        SwapLib: "0xd98634607C1FEc0dfB925c64037a675eb17a2fc2",
        NftZapLib: "0x758a3B49A4Fee14B18CC8dFA5CeB547Acc594f21"
    },
    56: {

    }
}

export const rpcUrls = {
    84532: "https://base-sepolia-rpc.publicnode.com",
    56: ""
}

export const zeroAddr = "0x0000000000000000000000000000000000000000"