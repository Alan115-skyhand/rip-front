import { t } from "@lingui/macro";
import { BigNumber, ethers } from "ethers";
import { useQuery } from "react-query";
import { NetworkId } from "src/constants";
// import { GIVE_ADDRESSES, GRIP_ADDRESSES } from "src/constants/addresses";
import { GIVE_CONTRACT } from "src/constants/contracts";
// import { GetFirstDonationDate } from "src/helpers/GiveGetDonationDate";
import { queryAssertion } from "src/helpers/react-query/queryAssertion";
import { nonNullable } from "src/helpers/types/nonNullable";

// import { IUserDonationInfo } from "src/views/Give/Interfaces";
import { useTestableNetworks } from "./useTestableNetworks";
import { useWeb3Context } from "./web3Context";

interface IDonorAddresses {
  [key: string]: boolean;
}

/**
 * sripDebt: total amount of sRIP principal earning yield for the recipient
 * gripDebt: gRIP equivalent of sRIP debt
 */
export interface IUserRecipientInfo {
  sripDebt: string;
  gripDebt: string;
}

/**
 * Query key for useDonationInfo, will refresh on address changes or
 * networkId changes
 */
export const donationInfoQueryKey = (address: string, networkId: NetworkId) =>
  ["useDonationInfo", address, networkId].filter(nonNullable);

/**
 * @notice Uses the currently connected address and networkId to request
 * donation amount, yield sent, first donation date, and recipient for
 * all recipients the current user is donating to
 * @returns query object in which the data attribute holds an array of
 * these donation info items.
 *
 *          id: string representing the universal deposit id
 *          date: string representing when the donation was started
 *          deposit: amount of tokens earning yield for the recipient (returned as gRIP)
 *          recipient: string representing the address of the recipient
 *          yieldDonated: quantity of yield sent to recipient so far (returned as gRIP)
 */
// export const useDonationInfo = () => {
//   const { address = "" } = useAccount();
//   const provider = useProvider();
//   const { chain = { id: 1 } } = useNetwork();

//   // Establish contract
//   const networks = useTestableNetworks();
//   const contract = GIVE_CONTRACT.getEthersContract(networks.MAINNET);

//   const query = useQuery<IUserDonationInfo[] | null, Error>(
//     donationInfoQueryKey(address, chainId),
//     async () => {
//       queryAssertion([address, chainId], donationInfoQueryKey(address, chainId));

//       // Set default return value
//       const donationInfo: IUserDonationInfo[] = [];

//       // If there's no contract (i.e. on a non-ETH network), throw error
//       if (!contract)
//         throw new Error(
//           t`Give is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
//         );

//       // Get set of all a user's deposits and begin to iterate through them. depositIds and allDeposits are
//       // indexed the same way, so we can select them by index
//       let depositIds: BigNumber[] = [];
//       let allDeposits: [string[], BigNumber[]] = [[], []];
//       try {
//         depositIds = await contract.getDepositorIds(address);
//         allDeposits = await contract.getAllDeposits(address);
//       } catch (e: unknown) {
//         // These will only revert if the user has not initiated any deposits yet
//         console.log("You have not deposited to anyone yet.");
//       }

//       // Define empty arrays to push promises and non-zero deposits into
//       const selectedDepositIds = [];
//       const selectedDeposits = [];
//       const firstDonationDatePromises: Promise<string>[] = [];
//       const yieldSentPromises: Promise<BigNumber>[] = [];

//       for (let i = 0; i < allDeposits[0].length; i++) {
//         // Given the conversions back and forth with sRIP and gRIP, this is a dust value that repeatedly
//         // arises that we can use to filter out deposits that are not worth showing (0.000000015 gRIP)
//         if (allDeposits[1][i].lte("15000000000")) continue;

//         selectedDepositIds.push(depositIds[i]);
//         selectedDeposits.push(i);

//         // Get the first donation date for a donation to a specific recipient
//         const firstDonationDatePromise = GetFirstDonationDate({
//           address: address,
//           recipient: allDeposits[0][i],
//           networkID: networks.MAINNET,
//           provider,
//         });
//         firstDonationDatePromises.push(firstDonationDatePromise);

//         const yieldSentPromise: Promise<BigNumber> = contract.donatedTo(address, allDeposits[0][i]).catch(() => {
//           // This will only revert if the user has not donated at all yet
//           console.log("You have not donated any yield yet.");
//           return ethers.constants.Zero;
//         });
//         yieldSentPromises.push(yieldSentPromise);
//       }

//       // Define arrays to push data from resolved promises into
//       let firstDonationData: string[] = [];
//       let yieldSentData: BigNumber[] = [];
//       try {
//         firstDonationData = await Promise.all(firstDonationDatePromises);
//         yieldSentData = await Promise.all(yieldSentPromises);
//       } catch (e: unknown) {
//         console.info(
//           "If the following error contains 'user is not donating', then it is an expected error. No need to report it!",
//         );
//         console.error(e);
//       }

//       for (let i = 0; i < firstDonationData.length; i++) {
//         donationInfo.push({
//           id: selectedDepositIds[i].toString(),
//           date: firstDonationData[i],
//           deposit: ethers.utils.formatEther(allDeposits[1][selectedDeposits[i]]),
//           recipient: allDeposits[0][selectedDeposits[i]],
//           yieldDonated: ethers.utils.formatEther(yieldSentData[i]),
//         });
//       }

//       // Return donationInfo array as the data attribute
//       return donationInfo;
//     },
//     { enabled: !!address }, // will run as long as an address is connected
//   );

//   // Return query
//   return query as typeof query;
// };

/**
 * Query key for useRedeemableBalance, will refresh on address changes or
 * networkId changes
 */
export const redeemableBalanceQueryKey = (address: string, networkId: NetworkId) =>
  ["useRedeemableBalance", address, networkId].filter(nonNullable);

/**
 * @notice Pulls a given address's redeemable gRIP balance from the YieldDirector contract
 * @param address The address we would like to fetch the redeemable balance for
 * @returns query object in which the data attribute holds the redeemable balance
 *
 *          redeemableBalance: quantity of yield that has been sent to the recipient and
 *                             can be redeemed (returned as gRIP)
 */
export const useRedeemableBalance = (address: string) => {
  const { networkId: chainId = 56 } = useWeb3Context();

  // Establish contract
  const networks = useTestableNetworks();
  const contract = GIVE_CONTRACT.getEthersContract(networks.MAINNET);

  const query = useQuery<string, Error>(
    redeemableBalanceQueryKey(address, chainId),
    async () => {
      queryAssertion([address, chainId], redeemableBalanceQueryKey(address, chainId));

      // If no contract is established throw an error to switch to ETH
      if (!contract)
        throw new Error(
          t`Give is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
        );

      // Set default redeemable balance value
      const redeemableBalance = BigNumber.from("0");

      // try {
      //   redeemableBalance = await contract.totalRedeemableBalance(address);
      // } catch (e: unknown) {
      //   // This can only revert if there is no deposit to this user yet
      //   console.log("No donations to: " + address + " yet.");
      // }

      // Convert to proper decimals and return
      return ethers.utils.formatEther(redeemableBalance);
    },
    { enabled: !!address },
  );

  // Return query
  return query as typeof query;
};

export const v1RedeemableBalanceQueryKey = (address: string, networkId: NetworkId) =>
  ["useV1RedeemableBalance", address, networkId].filter(nonNullable);

// export const useV1RedeemableBalance = () => {
//   const { chain = { id: 1 } } = useNetwork();
//   const { address = "" } = useAccount();

//   // Hook to establish static old Give contract
//   const contract = useDynamicV1GiveContract(OLD_GIVE_ADDRESSES, true);
//   const query = useQuery<string, Error>(
//     v1RedeemableBalanceQueryKey(address, chainId),
//     async () => {
//       queryAssertion([address, chainId], v1RedeemableBalanceQueryKey(address, chainId));

//       if (chainId != 1)
//         throw new Error(t`The old Give contract is only supported on the mainnet. Please switch to Ethereum mainnet`);

//       // If no contract is established throw an error to switch to ETH
//       if (!contract)
//         throw new Error(
//           t`Give V1 is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
//         );

//       // Set default redeemable balance value
//       let redeemableBalance = BigNumber.from("0");

//       try {
//         redeemableBalance = await contract.redeemableBalance(address);
//       } catch (e: unknown) {
//         // This shouldn't revert at all, but just in case
//         console.log("No donations to: " + address + " yet.");
//       }

//       // Convert to proper decimals and return
//       return ethers.utils.formatUnits(redeemableBalance, "gwei");
//     },
//     { enabled: !!address },
//   );

//   // Return query
//   return query as typeof query;
// };

/**
 * Query key for useRecipientInfo, will refresh on address changes or
 * networkId changes
 */
export const recipientInfoQueryKey = (address: string, networkId: NetworkId) =>
  ["useRecipientInfo", address, networkId].filter(nonNullable);

/**
 * @notice Fetches total debt, carry, agnostic debt, and index at
 * last change for a given wallet address
 * @param address The wallet we would like to fetch the data for
 * @returns query object in which the data attribute holds the
 * recipient info object
 *
 *          sripDebt: total amount of sRIP principal earning yield for the recipient
 *          gripDebt: gRIP equivalent of sRIP debt
 */
// export const useRecipientInfo = (address: string) => {
//   const { chain = { id: 1 } } = useNetwork();
//   const { data: signer } = useSigner();
//   // Hook to establish dynamic contract, meaning it will connect to the network
//   // the user is currently connected to
//   const contract = useDynamicGiveContract(GIVE_ADDRESSES, true);
//   const gripContract = new ethers.Contract(
//     GRIP_ADDRESSES[chainId as keyof typeof GRIP_ADDRESSES],
//     gRIP.abi,
//     signer ? signer : undefined,
//   );

//   const query = useQuery<IUserRecipientInfo, Error>(
//     recipientInfoQueryKey(address, chainId),
//     async () => {
//       queryAssertion([address, chainId], recipientInfoQueryKey(address, chainId));

//       // If no contract object was successfully created, tell the user to switch to ETH
//       if (!contract)
//         throw new Error(
//           t`Give is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
//         );

//       // Create recipient info object with default values
//       const recipientInfo: IUserRecipientInfo = {
//         sripDebt: "",
//         gripDebt: "",
//       };

//       // Pull relevant data from the contract, put in the right format, and push to
//       // the recipient info object
//       try {
//         const recipientIds = await contract.getRecipientIds(address);

//         const debtPromises = [];
//         for (let i = 0; i < recipientIds.length; i++) {
//           debtPromises.push(contract.depositInfo(recipientIds[i]));
//         }

//         const debtData = await Promise.all(debtPromises);

//         let sumDebt = BigNumber.from("0");

//         for (let i = 0; i < debtData.length; i++) {
//           // principal amount is the sRIP equivalent value that the donor originally put into the contract
//           sumDebt = sumDebt.add(debtData[i].principalAmount);
//         }

//         const sumAgnosticDebt = await gripContract.balanceTo(sumDebt);

//         recipientInfo.sripDebt = ethers.utils.formatUnits(sumDebt, "gwei");
//         recipientInfo.gripDebt = ethers.utils.formatEther(sumAgnosticDebt);
//       } catch (e: unknown) {
//         console.log(e);
//       }

//       return recipientInfo;
//     },
//     { enabled: !!address },
//   );

//   // return query
//   return query as typeof query;
// };

/**
 * Query key for useTotalYieldDonated, will refresh on address changes or
 * networkId changes
 */
export const totalYieldDonatedQueryKey = (address: string, networkId: NetworkId) =>
  ["useTotalYieldDonated", address, networkId].filter(nonNullable);

/**
 * @notice Fetches total amount of sRIP yield donated to a specific
 * wallet throughout its history
 * @param address The wallet we would like to fetch the data for
 * @returns query object in which the data attribute holds the
 * total donated amount
 *
 *          totalDonated: yield that has been redeemed so far + current redeemable balance (returned as gRIP)
 */
export const useTotalYieldDonated = (address: string) => {
  const { provider, networkId: chainId = 56 } = useWeb3Context();

  // Event logs use data values that are padded with zeros, so to match that we
  // pad the given wallet address with zeros
  const zeroPadAddress = ethers.utils.hexZeroPad(address === "" ? ethers.utils.hexlify(0) : address, 32);

  // Establish contract
  const networks = useTestableNetworks();
  const contract = GIVE_CONTRACT.getEthersContract(networks.MAINNET);

  // Filter to search through event logs and find all redeemed events for a given address
  const filter = {
    address: contract?.address,
    fromBlock: 1,
    toBlock: "latest",
    topics: [ethers.utils.id("Redeemed(address,uint256)"), zeroPadAddress],
  };

  const query = useQuery<string, Error>(
    totalYieldDonatedQueryKey(address, chainId),
    async () => {
      queryAssertion([address, chainId], totalYieldDonatedQueryKey(address, chainId));

      // If no contract object was successfully created, tell the user to switch to ETH
      if (!contract)
        throw new Error(
          t`Give is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
        );

      // Default values for totalRedeemed and totalDonated
      let totalRedeemed = BigNumber.from("0");

      // Get all event logs using our filter
      const events = await provider.getLogs(filter);

      // Sum up all redemption events to totalRedeemed
      for (let i = 0; i < events.length; i++) {
        totalRedeemed = totalRedeemed.add(events[i].data);
      }

      // Fetch redeemable balance from YieldDirector
      const redeemableBalance = BigNumber.from("0");
      // try {
      //   redeemableBalance = await contract.totalRedeemableBalance(address);
      // } catch (e: unknown) {
      //   // this can only revert when there is no donations to an address yet
      //   console.log("No donations to: " + address + " yet.");
      // }

      // Sum all redemption events with redeemable balance
      const totalDonated = totalRedeemed.add(redeemableBalance);

      // Return formatted total donated value
      return ethers.utils.formatEther(totalDonated);
    },
    { enabled: !!address },
  );

  // Return query object
  return query as typeof query;
};

/**
 * Query key for useDonorNumbers, will refresh on address changes or
 * networkId changes
 */
export const donorNumbersQueryKey = (address: string, networkId: NetworkId) =>
  ["useDonorNumbers", address, networkId].filter(nonNullable);

/**
 * @notice Fetches number of users donating to a specific address
 * @param address The wallet we would like to fetch donors for
 * @returns query object in which the data attribute holds the
 * donor numbers
 */
export const useDonorNumbers = (address: string) => {
  const { provider, networkId: chainId = 56 } = useWeb3Context();
  // Event logs use data values that are padded with zeros, so to match that we
  // pad the given wallet address with zeros
  const zeroPadAddress = ethers.utils.hexZeroPad(address === "" ? ethers.utils.hexlify(0) : address, 32);

  // Establish contract
  const networks = useTestableNetworks();
  const contract = GIVE_CONTRACT.getEthersContract(networks.MAINNET);

  // Filter to search through event logs and find all Deposited events for a given address as recipient
  const filter = {
    address: contract?.address,
    fromBlock: 1,
    toBlock: "latest",
    topics: [ethers.utils.id("Deposited(address,address,uint256)"), null, zeroPadAddress],
  };

  const query = useQuery<number, Error>(
    donorNumbersQueryKey(address, chainId),
    async () => {
      queryAssertion([address, chainId], donorNumbersQueryKey(address, chainId));

      // If no contract object was successfully created, tell the user to switch to ETH
      if (!contract)
        throw new Error(
          t`Give is not supported on this network. Please switch to a supported network, such as Ethereum mainnet`,
        );

      // Initialize donorAddresses and donationsToAddress
      const donorAddresses: IDonorAddresses = {};
      const donationsToAddress: ethers.providers.Log[] = [];

      // Get all event logs using our filter
      const events: ethers.providers.Log[] = await provider.getLogs(filter);
      const selectedEvents: ethers.providers.Log[] = [];

      const potentialActiveDonationsPromises: Promise<[string[], BigNumber[]]>[] = [];

      for (let i = 0; i < events.length; i++) {
        const event = events[i];

        // If the recipient matches the desired wallet, pull all donations for the relevant
        // depositor
        if (event.topics[2] === zeroPadAddress.toLowerCase()) {
          // By pushing these both, their indices should match which avoids needing a third
          // for loop below
          selectedEvents.push(event);
          potentialActiveDonationsPromises.push(
            contract.getAllDeposits(ethers.utils.hexDataSlice(event.topics[1], 12)),
          );
        }
      }

      const potentialActiveDonors = await Promise.all(potentialActiveDonationsPromises);

      for (let i = 0; i < potentialActiveDonors.length; i++) {
        for (let j = 0; j < potentialActiveDonors[i][0].length; j++) {
          // Confirm again recipient matches desired wallet, the current deposit is non-zero,
          // and that we haven't already counted this donor
          if (
            potentialActiveDonors[i][0][j].toLowerCase() === address.toLowerCase() &&
            // Given the conversions back and forth with sRIP and gRIP, this is a dust value that repeatedly
            // arises that we can use to filter out deposits that are not worth showing (0.000000015 gRIP)
            potentialActiveDonors[i][1][j].gt("15000000000") &&
            !donorAddresses[selectedEvents[i].topics[1]]
          ) {
            // Add the donor to donorAddresses
            donorAddresses[selectedEvents[i].topics[1]] = true;

            // Add the donation to donationsToAddress
            donationsToAddress.push(selectedEvents[i]);
          }
        }
      }

      // Return number of donors
      return donationsToAddress.length;
    },
    { enabled: !!address },
  );

  // Return query object
  return query as typeof query;
};