import "./Swap.scss";

import { Zoom } from "@material-ui/core";
import { Paper } from "@olympusdao/component-library";
import { Currency, CurrencyAmount, JSBI, Token, Trade } from "@pancakeswap/sdk";
import {
  ArrowDownIcon,
  BottomDrawer,
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useMatchBreakpoints,
  useModal,
} from "@pancakeswap/uikit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import ExchangeIcon from "src/assets/icons/exchange.svg";
import GlobalSettings from "src/components/Menu/GlobalSettings";
import StyledButton from "src/components/StyledButton";
import { WrappedTokenInfo } from "src/slices/types";
import styled from "styled-components";

import { GreyCard } from "../../components/Card";
import ConnectButton from "../../components/ConnectButton/ConnectButton";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import { AutoColumn } from "../../components/Layout/Column";
import { AutoRow } from "../../components/Layout/Row";
import CircleLoader from "../../components/Loader/CircleLoader";
import { useTranslation } from "../../contexts/Localization";
import { useWeb3Context } from "../../hooks";
import { useAllTokens, useCurrency } from "../../hooks/Tokens";
import { useIsTransactionUnsupported } from "../../hooks/Trades";
import { ApprovalState, useApproveCallbackFromTrade } from "../../hooks/useApproveCallback";
import { useSwapCallback } from "../../hooks/useSwapCallback";
import useWrapCallback, { WrapType } from "../../hooks/useWrapCallback";
import { Field } from "../../slices/swap/actions";
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSingleTokenSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from "../../slices/swap/hooks";
import {
  useExchangeChartManager,
  useExpertModeManager,
  useUserSingleHopOnly,
  useUserSlippageTolerance,
} from "../../slices/user/hooks";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import shouldShowSwapWarning from "../../utils/shouldShowSwapWarning";
import AddressInputPanel from "./components/AddressInputPanel";
import PriceChartContainer from "./components/Chart/PriceChartContainer";
import confirmPriceImpactWithoutFee from "./components/confirmPriceImpactWithoutFee";
import ConfirmSwapModal from "./components/ConfirmSwapModal";
import ImportTokenWarningModal from "./components/ImportTokenWarningModal";
import { ArrowWrapper, Wrapper } from "./components/styleds";
import SwapWarningModal from "./components/SwapWarningModal";
import useRefreshBlockNumberID from "./hooks/useRefreshBlockNumber";

const SwitchIconButton = styled(IconButton)`
  box-shadow: inset 0px -2px 0px rgba(0, 0, 0, 0.1);
  .icon-up-down {
    display: none;
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    .icon-down {
      display: none;
      fill: white;
    }
    .icon-up-down {
      display: block;
      fill: white;
    }
  }
`;

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch();
  const { t } = useTranslation();
  const { isMobile } = useMatchBreakpoints();
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const [userChartPreference, setUserChartPreference] = useExchangeChartManager(isMobile);
  const [isChartDisplayed, setIsChartDisplayed] = useState(userChartPreference);
  const [zoomed, setZoomed] = useState(false);
  const { refreshBlockNumber, isLoading } = useRefreshBlockNumberID();
  const history = useHistory();

  useEffect(() => {
    setUserChartPreference(isChartDisplayed);
  }, [isChartDisplayed, setUserChartPreference]);

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId ?? undefined),
    useCurrency(loadedUrlParams?.outputCurrencyId ?? undefined),
  ];
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  );

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens();
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens);
    });

  const { address: account } = useWeb3Context();

  // for expert mode
  const [isExpertMode] = useExpertModeManager();

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance();

  // swap state & price data
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState();
  const inputCurrency = useCurrency(inputCurrencyId as string);
  const outputCurrency = useCurrency(outputCurrencyId as string);
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(independentField, typedValue, inputCurrency, outputCurrency, recipient as string);

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
  const trade = showWrap ? undefined : v2Trade;

  const singleTokenPrice = useSingleTokenSwapInfo(
    inputCurrencyId,
    inputCurrency as Currency | Token,
    outputCurrencyId,
    outputCurrency as Currency | Token,
  );

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      };

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers();
  const isValid = !swapInputError;
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value);
    },
    [onUserInput],
  );
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value);
    },
    [onUserInput],
  );

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined;
    attemptingTxn: boolean;
    swapErrorMessage: string | undefined;
    txHash: string | undefined;
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  });

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField as keyof typeof parsedAmounts]?.toExact() ?? ""
      : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
  };

  const route = trade?.route;
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      parsedAmounts[independentField as keyof typeof parsedAmounts]?.greaterThan(JSBI.BigInt(0)),
  );
  const noRoute = !route;

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true);
    }
  }, [approval, approvalSubmitted]);

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient);

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

  const [singleHopOnly] = useUserSingleHopOnly();

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)) {
      return;
    }
    if (!swapCallback) {
      return;
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined });
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash });
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        });
      });
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t]);

  // errors
  // const [showInverted, setShowInverted] = useState<boolean>(false);

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode);

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, "");
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn });
  }, [attemptingTxn, swapErrorMessage, trade, txHash]);

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState<WrappedTokenInfo | null>(null);
  const [onPresentSwapWarningModal] = useModal(
    <SwapWarningModal swapCurrency={swapWarningCurrency as WrappedTokenInfo} />,
  );

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency]);

  const handleInputSelect = useCallback(
    currencyInput => {
      setApprovalSubmitted(false); // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, currencyInput);
      const showSwapWarning = shouldShowSwapWarning(currencyInput);
      if (showSwapWarning) {
        setSwapWarningCurrency(currencyInput);
      } else {
        setSwapWarningCurrency(null);
      }
    },
    [onCurrencySelection],
  );

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact());
    }
  }, [maxAmountInput, onUserInput]);

  const handleOutputSelect = useCallback(
    currencyOutput => {
      onCurrencySelection(Field.OUTPUT, currencyOutput);
      const showSwapWarning = shouldShowSwapWarning(currencyOutput);
      if (showSwapWarning) {
        setSwapWarningCurrency(currencyOutput);
      } else {
        setSwapWarningCurrency(null);
      }
    },

    [onCurrencySelection],
  );

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT);

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => history.push("/swap")} />,
  );

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length]);

  const [onPresentConfirmModal] = useModal(
    <ConfirmSwapModal
      trade={trade}
      originalTrade={tradeToConfirm}
      onAcceptChanges={handleAcceptChanges}
      attemptingTxn={attemptingTxn}
      txHash={txHash}
      recipient={recipient}
      allowedSlippage={allowedSlippage}
      onConfirm={handleSwap}
      swapErrorMessage={swapErrorMessage}
      customOnDismiss={handleConfirmDismiss}
    />,
    true,
    true,
    "confirmSwapModal",
  );

  return (
    <div id="swap-view">
      <Zoom in={true} onEntered={() => setZoomed(true)}>
        <Paper className="blur7">
          <Flex flexDirection={"column"} width="100%" justifyContent="center" position="relative" pt="2rem">
            {!isMobile && (
              <PriceChartContainer
                inputCurrencyId={inputCurrencyId as string}
                inputCurrency={currencies[Field.INPUT] as Currency}
                outputCurrencyId={outputCurrencyId as string}
                outputCurrency={currencies[Field.OUTPUT] as Currency}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
              />
            )}
            <BottomDrawer
              content={
                <PriceChartContainer
                  inputCurrencyId={inputCurrencyId as string}
                  inputCurrency={currencies[Field.INPUT] as Currency}
                  outputCurrencyId={outputCurrencyId as string}
                  outputCurrency={currencies[Field.OUTPUT] as Currency}
                  isChartExpanded={isChartExpanded}
                  setIsChartExpanded={setIsChartExpanded}
                  isChartDisplayed={isChartDisplayed}
                  currentSwapPrice={singleTokenPrice}
                  isMobile
                />
              }
              isOpen={isChartDisplayed}
              setIsOpen={setIsChartDisplayed}
            />
            <Flex flexDirection="column">
              <div style={{ textAlign: "center" }}>
                <Wrapper id="swap-page">
                  <Flex
                    mb="6px"
                    mr="1rem"
                    ml="6rem"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ gap: "3rem" }}
                  >
                    <CurrencyInputPanel
                      label={
                        independentField === Field.OUTPUT && !showWrap && trade ? t("From (estimated)") : t("From")
                      }
                      value={formattedAmounts[Field.INPUT]}
                      showMaxButton={!atMaxAmountInput}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      id="swap-currency-input"
                    />
                    <SwitchIconButton
                      variant="light"
                      scale="sm"
                      onClick={() => {
                        setApprovalSubmitted(false); // reset 2 step UI for approvals
                        onSwitchTokens();
                      }}
                    >
                      <img className="icon-down" src={ExchangeIcon} />
                      <img className="icon-up-down" src={ExchangeIcon} />
                      {/* <ArrowDownIcon
                        className="icon-up-down"
                        color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? "primary" : "text"}
                      /> */}
                      {/* <ArrowUpDownIcon
                        className="icon-up-down"
                        color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? "primary" : "text"}
                      /> */}
                    </SwitchIconButton>
                    {recipient === null && !showWrap && isExpertMode ? (
                      <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient("")}>
                        {t("+ Add a send (optional)")}
                      </Button>
                    ) : null}
                    <CurrencyInputPanel
                      value={formattedAmounts[Field.OUTPUT]}
                      onUserInput={handleTypeOutput}
                      label={independentField === Field.INPUT && !showWrap && trade ? t("To (estimated)") : t("To")}
                      showMaxButton={false}
                      currency={currencies[Field.OUTPUT]}
                      onCurrencySelect={handleOutputSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      id="swap-currency-output"
                    />
                    <GlobalSettings color="textSubtle" mr="0" />
                    {isExpertMode && recipient !== null && !showWrap ? (
                      <>
                        <AutoRow justify="space-between" style={{ padding: "0 1rem" }}>
                          <ArrowWrapper clickable={false}>
                            <ArrowDownIcon width="16px" />
                          </ArrowWrapper>
                          <Button variant="text" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                            {t("- Remove send")}
                          </Button>
                        </AutoRow>
                        <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                      </>
                    ) : null}
                  </Flex>
                  <Box mt="0.75rem">
                    {swapIsUnsupported ? (
                      <StyledButton light="light" width="100%" disabled>
                        {t("Unsupported Asset")}
                      </StyledButton>
                    ) : !account ? (
                      <ConnectButton light="light" />
                    ) : showWrap ? (
                      <StyledButton light="light" width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                        {wrapInputError ??
                          (wrapType === WrapType.WRAP ? "Wrap" : wrapType === WrapType.UNWRAP ? "Unwrap" : null)}
                      </StyledButton>
                    ) : noRoute && userHasSpecifiedInputOutput ? (
                      <GreyCard style={{ textAlign: "center", padding: "0.75rem" }}>
                        <Text color="textSubtle">{t("Insufficient liquidity for this trade.")}</Text>
                        {singleHopOnly && <Text color="textSubtle">{t("Try enabling multi-hop trades.")}</Text>}
                      </GreyCard>
                    ) : showApproveFlow ? (
                      <Flex style={{ justifyContent: "center" }}>
                        <StyledButton
                          light="light"
                          variant={approval === ApprovalState.APPROVED ? "success" : "primary"}
                          onClick={approveCallback}
                          disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                          width="48%"
                        >
                          {approval === ApprovalState.PENDING ? (
                            <AutoRow gap="6px" justify="center">
                              {t("Enabling")} <CircleLoader stroke="white" />
                            </AutoRow>
                          ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                            t("Enabled")
                          ) : (
                            t("Enable %asset%", { asset: currencies[Field.INPUT]?.symbol ?? "" })
                          )}
                        </StyledButton>
                        <StyledButton
                          light="light"
                          variant={isValid && priceImpactSeverity > 2 ? "danger" : "primary"}
                          onClick={() => {
                            if (isExpertMode) {
                              handleSwap();
                            } else {
                              setSwapState({
                                tradeToConfirm: trade,
                                attemptingTxn: false,
                                swapErrorMessage: undefined,
                                txHash: undefined,
                              });
                              onPresentConfirmModal();
                            }
                          }}
                          width="48%"
                          id="swap-button"
                          disabled={
                            !isValid ||
                            approval !== ApprovalState.APPROVED ||
                            (priceImpactSeverity > 3 && !isExpertMode)
                          }
                        >
                          {priceImpactSeverity > 3 && !isExpertMode
                            ? t("Price Impact High")
                            : priceImpactSeverity > 2
                            ? t("Swap Anyway")
                            : t("Swap")}
                        </StyledButton>
                      </Flex>
                    ) : (
                      <StyledButton
                        light="light"
                        onClick={() => {
                          if (isExpertMode) {
                            handleSwap();
                          } else {
                            setSwapState({
                              tradeToConfirm: trade,
                              attemptingTxn: false,
                              swapErrorMessage: undefined,
                              txHash: undefined,
                            });
                            onPresentConfirmModal();
                          }
                        }}
                        id="swap-button"
                        width="100%"
                        disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                      >
                        {swapInputError ||
                          (priceImpactSeverity > 3 && !isExpertMode
                            ? t("Price Impact Too High")
                            : priceImpactSeverity > 2
                            ? t("Swap Anyway")
                            : t("Swap"))}
                      </StyledButton>
                    )}
                  </Box>
                </Wrapper>
                {showWrap ? null : (
                  <AutoColumn gap="7px" style={{ padding: "0 16px" }}>
                    <Box>
                      <Text color="blueish_gray">
                        {t("Slippage Tolerance")}
                        <span style={{ fontWeight: "bold" }}> {allowedSlippage / 100}%</span>
                      </Text>
                    </Box>
                  </AutoColumn>
                )}
              </div>
            </Flex>
          </Flex>
        </Paper>
      </Zoom>
    </div>
  );
}
