import { Box, Heading, Message, ModalBody, ModalContainer, ModalHeader } from "@pancakeswap/uikit";
import { Handler } from "puppeteer";
import { useEffect } from "react";
import styled from "styled-components";

import SwapWarningTokensConfig from "../../../../constants/swapWarningTokens";
import { useTranslation } from "../../../../contexts/Localization";
import { WrappedTokenInfo } from "../../../../slices/types";
import Acknowledgement from "./Acknowledgement";
import BondlyWarning from "./BondlyWarning";
import BTTWarning from "./BTTWarning";
import CcarWarning from "./CcarWarning";
import ItamWarning from "./ItamWarning";
import SafemoonWarning from "./SafemoonWarning";

const StyledModalContainer = styled(ModalContainer)`
  max-width: 440px;
`;

const MessageContainer = styled(Message)`
  align-items: flex-start;
  justify-content: flex-start;
`;

interface SwapWarningModalProps {
  swapCurrency: WrappedTokenInfo;
  onDismiss?: Handler | undefined;
}

// Modal is fired by a useEffect and doesn't respond to closeOnOverlayClick prop being set to false
const usePreventModalOverlayClick = () => {
  useEffect(() => {
    const preventClickHandler = (e: any) => {
      e.stopPropagation();
      e.preventDefault();
      return false;
    };

    document.querySelectorAll('[role="presentation"]').forEach(el => {
      el.addEventListener("click", preventClickHandler, true);
    });

    return () => {
      document.querySelectorAll('[role="presentation"]').forEach(el => {
        el.removeEventListener("click", preventClickHandler, true);
      });
    };
  }, []);
};

const SwapWarningModal: React.FC<SwapWarningModalProps> = ({ swapCurrency, onDismiss }) => {
  const { t } = useTranslation();
  usePreventModalOverlayClick();

  const TOKEN_WARNINGS = {
    [SwapWarningTokensConfig.safemoon.address]: {
      symbol: SwapWarningTokensConfig.safemoon.symbol,
      component: <SafemoonWarning />,
    },
    [SwapWarningTokensConfig.bondly.address]: {
      symbol: SwapWarningTokensConfig.bondly.symbol,
      component: <BondlyWarning />,
    },
    [SwapWarningTokensConfig.itam.address]: {
      symbol: SwapWarningTokensConfig.itam.symbol,
      component: <ItamWarning />,
    },
    [SwapWarningTokensConfig.ccar.address]: {
      symbol: SwapWarningTokensConfig.ccar.symbol,
      component: <CcarWarning />,
    },
    [SwapWarningTokensConfig.bttold.address]: {
      symbol: SwapWarningTokensConfig.bttold.symbol,
      component: <BTTWarning />,
    },
  };

  const SWAP_WARNING = TOKEN_WARNINGS[swapCurrency.address];

  return (
    <StyledModalContainer minWidth="280px">
      <ModalHeader background={"green"}>
        <Heading p="12px 24px">{t("Notice for trading %symbol%", { symbol: SWAP_WARNING.symbol! })}</Heading>
      </ModalHeader>
      <ModalBody p="24px">
        <MessageContainer variant="warning" mb="24px">
          <Box>{SWAP_WARNING.component}</Box>
        </MessageContainer>
        <Acknowledgement handleContinueClick={onDismiss as Handler | undefined} />
      </ModalBody>
    </StyledModalContainer>
  );
};

export default SwapWarningModal;
