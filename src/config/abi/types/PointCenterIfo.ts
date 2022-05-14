/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface PointCenterIfoInterface extends utils.Interface {
  functions: {
    "addIFOAddress(address,uint256,uint256,uint256)": FunctionFragment;
    "checkClaimStatus(address,address)": FunctionFragment;
    "checkClaimStatuses(address,address[])": FunctionFragment;
    "getPoints(address)": FunctionFragment;
    "ifos(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addIFOAddress",
    values: [string, BigNumberish, BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: "checkClaimStatus", values: [string, string]): string;
  encodeFunctionData(functionFragment: "checkClaimStatuses", values: [string, string[]]): string;
  encodeFunctionData(functionFragment: "getPoints", values: [string]): string;
  encodeFunctionData(functionFragment: "ifos", values: [string]): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "renounceOwnership", values?: undefined): string;
  encodeFunctionData(functionFragment: "transferOwnership", values: [string]): string;

  decodeFunctionResult(functionFragment: "addIFOAddress", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "checkClaimStatus", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "checkClaimStatuses", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPoints", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ifos", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "renounceOwnership", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "transferOwnership", data: BytesLike): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export type OwnershipTransferredEvent = TypedEvent<[string, string], { previousOwner: string; newOwner: string }>;

export type OwnershipTransferredEventFilter = TypedEventFilter<OwnershipTransferredEvent>;

export interface PointCenterIfo extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PointCenterIfoInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addIFOAddress(
      _contractAddress: string,
      _campaignId: BigNumberish,
      _thresholdToClaim: BigNumberish,
      _numberPoints: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    checkClaimStatus(_userAddress: string, _contractAddress: string, overrides?: CallOverrides): Promise<[boolean]>;

    checkClaimStatuses(
      _userAddress: string,
      _contractAddresses: string[],
      overrides?: CallOverrides,
    ): Promise<[boolean[]]>;

    getPoints(
      _contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;

    ifos(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        thresholdToClaim: BigNumber;
        campaignId: BigNumber;
        numberPoints: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(overrides?: Overrides & { from?: string | Promise<string> }): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<ContractTransaction>;
  };

  addIFOAddress(
    _contractAddress: string,
    _campaignId: BigNumberish,
    _thresholdToClaim: BigNumberish,
    _numberPoints: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  checkClaimStatus(_userAddress: string, _contractAddress: string, overrides?: CallOverrides): Promise<boolean>;

  checkClaimStatuses(_userAddress: string, _contractAddresses: string[], overrides?: CallOverrides): Promise<boolean[]>;

  getPoints(
    _contractAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  ifos(
    arg0: string,
    overrides?: CallOverrides,
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      thresholdToClaim: BigNumber;
      campaignId: BigNumber;
      numberPoints: BigNumber;
    }
  >;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(overrides?: Overrides & { from?: string | Promise<string> }): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ContractTransaction>;

  callStatic: {
    addIFOAddress(
      _contractAddress: string,
      _campaignId: BigNumberish,
      _thresholdToClaim: BigNumberish,
      _numberPoints: BigNumberish,
      overrides?: CallOverrides,
    ): Promise<void>;

    checkClaimStatus(_userAddress: string, _contractAddress: string, overrides?: CallOverrides): Promise<boolean>;

    checkClaimStatuses(
      _userAddress: string,
      _contractAddresses: string[],
      overrides?: CallOverrides,
    ): Promise<boolean[]>;

    getPoints(_contractAddress: string, overrides?: CallOverrides): Promise<void>;

    ifos(
      arg0: string,
      overrides?: CallOverrides,
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        thresholdToClaim: BigNumber;
        campaignId: BigNumber;
        numberPoints: BigNumber;
      }
    >;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(newOwner: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null,
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(previousOwner?: string | null, newOwner?: string | null): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    addIFOAddress(
      _contractAddress: string,
      _campaignId: BigNumberish,
      _thresholdToClaim: BigNumberish,
      _numberPoints: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    checkClaimStatus(_userAddress: string, _contractAddress: string, overrides?: CallOverrides): Promise<BigNumber>;

    checkClaimStatuses(
      _userAddress: string,
      _contractAddresses: string[],
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getPoints(
      _contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;

    ifos(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(overrides?: Overrides & { from?: string | Promise<string> }): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addIFOAddress(
      _contractAddress: string,
      _campaignId: BigNumberish,
      _thresholdToClaim: BigNumberish,
      _numberPoints: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    checkClaimStatus(
      _userAddress: string,
      _contractAddress: string,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    checkClaimStatuses(
      _userAddress: string,
      _contractAddresses: string[],
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getPoints(
      _contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;

    ifos(arg0: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(overrides?: Overrides & { from?: string | Promise<string> }): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> },
    ): Promise<PopulatedTransaction>;
  };
}
