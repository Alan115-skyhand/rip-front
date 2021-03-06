import binance from "./assets/tokens/BNB.svg";
import { NodeHelper } from "./helpers/NodeHelper";

export enum NetworkId {
  MAINNET = 56,
  TESTNET_RINKEBY = 4,

  BSC = 56,
  BSC_TEST = 97,

  ARBITRUM = 42161,
  ARBITRUM_TESTNET = 421611,

  AVALANCHE = 43114,
  AVALANCHE_TESTNET = 43113,

  POLYGON = 137,
  POLYGON_TESTNET = 80001,

  FANTOM = 250,
  FANTOM_TESTNET = 4002,

  Localhost = 1337,
}

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const addresses: IAddresses = {
  [NetworkId.TESTNET_RINKEBY]: {
    DAI_ADDRESS: "0xB2180448f8945C8Cc8AE9809E67D6bd27d8B2f2C", // duplicate
    RIP_ADDRESS: "0xC0b491daBf3709Ee5Eb79E603D73289Ca6060932",
    STAKING_ADDRESS: "0xC5d3318C0d74a72cD7C55bdf844e24516796BaB2",
    STAKING_HELPER_ADDRESS: "0xf73f23Bb0edCf4719b12ccEa8638355BF33604A1",
    OLD_STAKING_ADDRESS: "0xb640AA9082ad720c60102489b806E665d67DCE32",
    SRIP_ADDRESS: "0x1Fecda1dE7b6951B248C0B62CaeBD5BAbedc2084",
    WSRIP_ADDRESS: "0xe73384f11Bb748Aa0Bc20f7b02958DF573e6E2ad",
    OLD_SRIP_ADDRESS: "0x8Fc4167B0bdA22cb9890af2dB6cB1B818D6068AE",
    MIGRATE_ADDRESS: "0x3BA7C6346b93DA485e97ba55aec28E8eDd3e33E2",
    DISTRIBUTOR_ADDRESS: "0x0626D5aD2a230E05Fb94DF035Abbd97F2f839C3a",
    BONDINGCALC_ADDRESS: "0xaDBE4FA3c2fcf36412D618AfCfC519C869400CEB",
    CIRCULATING_SUPPLY_ADDRESS: "0x5b0AA7903FD2EaA16F1462879B71c3cE2cFfE868",
    TREASURY_ADDRESS: "0x0d722D813601E48b7DAcb2DF9bae282cFd98c6E7",
    REDEEM_HELPER_ADDRESS: "0xBd35d8b2FDc2b720842DB372f5E419d39B24781f",
    PT_TOKEN_ADDRESS: "0x0a2d026bacc573a8b5a2b049f956bdf8e5256cfd", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
    PT_PRIZE_POOL_ADDRESS: "0xf9081132864ed5e4980CFae83bDB122d86619281", // NEW
    PT_PRIZE_STRATEGY_ADDRESS: "0x2Df17EA8D6B68Ec444c9a698315AfB36425dac8b", // NEW
    GIVING_ADDRESS: "0x83D4FE6Ead62547758E094ee5BDb343ADbC2AeB9",
    MOCK_GIVING_ADDRESS: "0xfC93B6fC25D751ef1141EAB01C3f51Ecd484Ba05",
    MOCK_SRIP: "0x22C0b7Dc53a4caa95fEAbb05ea0729995a10D727",
    MIGRATOR_ADDRESS: "0x568c257BF4714864382b643fC8e6Ce5fbBcC6d3C",
    GRIP_ADDRESS: "0xcF2D6893A1CB459fD6B48dC9C41c6110B968611E",
    RIP_V2: "0xd7B98050962ec7cC8D11a83446B3217257C754B7",
    TREASURY_V2: "0x8dd0d811CEFb5CF41528C495E76638B2Ea39d2e6",
    SRIP_V2: "0xebED323CEbe4FfF65F7D7612Ea04313F718E5A75",
    STAKING_V2: "0x06984c3A9EB8e3A8df02A4C09770D5886185792D",
    BOND_DEPOSITORY: "0x9810C5c97C57Ef3F23d9ee06813eF7FD51E13042",
    DAO_TREASURY: "0xee1520f94f304e8d551cbf310fe214212e3ca34a",
  },
  // [NetworkId.MAINNET]: { // Olympus Dao contracts on ETH net
  //   DAI_ADDRESS: "0x6b175474e89094c44da98b954eedeac495271d0f", // duplicate
  //   RIP_ADDRESS: "0x383518188c0c6d7730d91b2c03a03c837814a899",
  //   STAKING_ADDRESS: "0xfd31c7d00ca47653c6ce64af53c1571f9c36566a", // The new staking contract
  //   STAKING_HELPER_ADDRESS: "0xc8c436271f9a6f10a5b80c8b8ed7d0e8f37a612d", // Helper contract used for Staking only
  //   OLD_STAKING_ADDRESS: "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  //   SRIP_ADDRESS: "0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F",
  //   WSRIP_ADDRESS: "0xca76543cf381ebbb277be79574059e32108e3e65",
  //   OLD_SRIP_ADDRESS: "0x31932E6e45012476ba3A3A4953cbA62AeE77Fbbe",
  //   PRESALE_ADDRESS: "0xcBb60264fe0AC96B0EFa0145A9709A825afa17D8",
  //   ARIP_ADDRESS: "0x24ecfd535675f36ba1ab9c5d39b50dc097b0792e",
  //   MIGRATE_ADDRESS: "0xC7f56EC779cB9e60afA116d73F3708761197dB3d",
  //   DISTRIBUTOR_ADDRESS: "0xbe731507810C8747C3E01E62c676b1cA6F93242f",
  //   BONDINGCALC_ADDRESS: "0xcaaa6a2d4b26067a391e7b7d65c16bb2d5fa571a",
  //   CIRCULATING_SUPPLY_ADDRESS: "0x0efff9199aa1ac3c3e34e957567c1be8bf295034",
  //   TREASURY_ADDRESS: "0x31f8cc382c9898b273eff4e0b7626a6987c846e8",
  //   REDEEM_HELPER_ADDRESS: "0xE1e83825613DE12E8F0502Da939523558f0B819E",
  //   FUSE_6_SRIP: "0x59bd6774c22486d9f4fab2d448dce4f892a9ae25", // Tetranode's Locker
  //   FUSE_18_SRIP: "0x6eDa4b59BaC787933A4A21b65672539ceF6ec97b", // RIPProtocol Pool Party
  //   FUSE_36_SRIP: "0x252d447c54F33e033AD04048baEAdE7628cB1274", // Fraximalist Money Market
  //   PT_TOKEN_ADDRESS: "0x0E930b8610229D74Da0A174626138Deb732cE6e9", // 33T token address, taken from `ticket` function on PRIZE_STRATEGY_ADDRESS
  //   PT_PRIZE_POOL_ADDRESS: "0xEaB695A8F5a44f583003A8bC97d677880D528248", // NEW
  //   PT_PRIZE_STRATEGY_ADDRESS: "0xf3d253257167c935f8C62A02AEaeBB24c9c5012a", // NEW
  //   ZAPPER_POOL_V1: "0x04f2694c8fcee23e8fd0dfea1d4f5bb8c352111f",
  //   BONDINGCALC_V2: "0x7b1a5649145143F4faD8504712ca9c614c3dA2Ae",
  //   MIGRATOR_ADDRESS: "0x184f3FAd8618a6F458C16bae63F70C426fE784B3",
  //   GRIP_ADDRESS: "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f",
  //   RIP_V2: "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5",
  //   TREASURY_V2: "0x9a315bdf513367c0377fb36545857d12e85813ef",
  //   SRIP_V2: "0x04906695D6D12CF5459975d7C3C03356E4Ccd460",
  //   STAKING_V2: "0xB63cac384247597756545b500253ff8E607a8020",
  //   FIATDAO_WSRIP_ADDRESS: "0xe98ae8cD25CDC06562c29231Db339d17D02Fd486",
  //   GIVING_ADDRESS: "0x2604170762A1dD22BB4F96C963043Cd4FC358f18",
  //   BOND_DEPOSITORY: "0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6", // updated
  //   DAO_TREASURY: "0x245cc372C84B3645Bf0Ffe6538620B04a217988B",
  //   TOKEMAK_GRIP: "0x41f6a95bacf9bc43704c4a4902ba5473a8b00263",
  //   ZAP: "0x6F5CC3EDEa92AB52b75bad50Bcf4C6daa781B87e",
  // },
  [NetworkId.MAINNET]: {
    DAI_ADDRESS: "0xB17b4703Cf1ce5bF44A22e14D25Ef4fDCd05c4b4", // duplicate
    RIP_ADDRESS: "",
    STAKING_ADDRESS: "", // The new staking contract
    STAKING_HELPER_ADDRESS: "", // Helper contract used for Staking only
    OLD_STAKING_ADDRESS: "",
    SRIP_ADDRESS: "",
    OLD_SRIP_ADDRESS: "",
    PRESALE_ADDRESS: "0xcBb60264fe0AC96B0EFa0145A9709A825afa17D8",
    MIGRATE_ADDRESS: "", // aRIPMigration
    DISTRIBUTOR_ADDRESS: "0x619B993f40e37B1c0d7C6EE84A17BE3b587b8233",
    BONDINGCALC_ADDRESS: "0xc9906ee9471226C2884Fd921Fb4C49EC27BaF690",
    TREASURY_ADDRESS: "",
    REDEEM_HELPER_ADDRESS: "",
    BONDINGCALC_V2: "0x6cF66AA7fF22db4cfA62eA78972f20a9E334E826",
    MIGRATOR_ADDRESS: "",
    GRIP_ADDRESS: "0x47F8D559e6feC98852bC6789DEf22F401B60A81f",
    RIP_V2: "0x9ACF3fCaee2F0d40F684DEF891B201C706A60B42",
    TREASURY_V2: "0x5343825A215499175f7c85E9aa1780ffB2298d9B",
    SRIP_V2: "0xb5F91D8AfB91fD5E89Cab44Db67Bc1C1DC54Bc8E",
    STAKING_V2: "0x0151738baBEaCCDE21803DB1D212e30c23E8C578",
    GIVING_ADDRESS: "0x66C23E9A61D49dab72a4286D70069CcA576cCAFf",
    BOND_DEPOSITORY: "0xBfc6fDFFc8f995ECDbABa878059775a54949E8b2", // updated
    DAO_TREASURY: "0x5343825A215499175f7c85E9aa1780ffB2298d9B",
    ZAP: "0xCC37b420cFb9751e8c4e38818dbE4E01BFeACB00",
  },
};

/**
 * Network details required to add a network to a user's wallet, as defined in EIP-3085 (https://eips.ethereum.org/EIPS/eip-3085)
 */

interface INativeCurrency {
  name: string;
  symbol: string;
  decimals?: number;
}

interface INetwork {
  chainName: string;
  chainId: number;
  nativeCurrency: INativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  image: SVGImageElement | string;
  imageAltText: string;
  uri: () => string;
}

// These networks will be available for users to select. Other networks may be functional
// (e.g. testnets, or mainnets being prepared for launch) but need to be selected directly via the wallet.
export const USER_SELECTABLE_NETWORKS = [
  NetworkId.MAINNET,
  NetworkId.BSC,
  NetworkId.BSC_TEST,
  // NetworkId.ARBITRUM,
  // NetworkId.AVALANCHE
];

// Set this to the chain number of the most recently added network in order to enable the 'Now supporting X network'
// message in the UI. Set to -1 if we don't want to display the message at the current time.
export const NEWEST_NETWORK_ID = NetworkId.AVALANCHE;

export const NETWORKS: { [key: number]: INetwork } = {
  [NetworkId.BSC]: {
    chainName: "Binance",
    chainId: 56,
    nativeCurrency: {
      name: "Binance",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://speedy-nodes-nyc.moralis.io/9f1fe98d210bc4fca911bee2/bsc/mainnet/archive"],
    blockExplorerUrls: ["https://bscscan.com/"],
    image: binance,
    imageAltText: "Binance Logo",
    uri: () => NodeHelper.getMainnetURI(NetworkId.BSC),
  },
  [NetworkId.BSC_TEST]: {
    chainName: "Binance Test",
    chainId: 97,
    nativeCurrency: {
      name: "Binance",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
    image: binance,
    imageAltText: "Binance Logo",
    uri: () => NodeHelper.getMainnetURI(NetworkId.BSC_TEST),
  },
};

// VIEWS FOR NETWORK is used to denote which paths should be viewable on each network
// ... attempting to prevent contract calls that can't complete & prevent user's from getting
// ... stuck on the wrong view

interface IViewsForNetwork {
  dashboard: boolean;
  stake: boolean;
  wrap: boolean;
  zap: boolean;
  threeTogether: boolean;
  bonds: boolean;
  network: boolean;
  bondsV2: boolean;
}

export const VIEWS_FOR_NETWORK: { [key: number]: IViewsForNetwork } = {
  [NetworkId.MAINNET]: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
    bondsV2: true,
  },
  [NetworkId.TESTNET_RINKEBY]: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
    bondsV2: true,
  },
  [NetworkId.BSC]: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
    bondsV2: true,
  },
  [NetworkId.BSC_TEST]: {
    dashboard: true,
    stake: true,
    wrap: true,
    zap: true,
    threeTogether: true,
    bonds: true,
    network: true,
    bondsV2: true,
  },
};
