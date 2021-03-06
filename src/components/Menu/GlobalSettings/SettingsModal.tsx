import { Flex, InjectedModalProps, PancakeToggle, Text, Toggle } from "@pancakeswap/uikit";
import { useState } from "react";
import QuestionHelper from "src/components/QuestionHelper";
import StyledModal from "src/components/StyledModal";
import styled from "styled-components";

import { useTranslation } from "../../../contexts/Localization";
import { useSwapActionHandlers } from "../../../slices/swap/hooks";
import {
  useAudioModeManager,
  useExpertModeManager,
  useSubgraphHealthIndicatorManager,
  useUserExpertModeAcknowledgementShow,
  useUserSingleHopOnly,
} from "../../../slices/user/hooks";
import ExpertModal from "./ExpertModal";
import GasSettings from "./GasSettings";
import TransactionSettings from "./TransactionSettings";

const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  max-height: 400px;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-height: none;
  }
`;

const SettingsModal: React.FC<InjectedModalProps> = ({ onDismiss }) => {
  const [showConfirmExpertModal, setShowConfirmExpertModal] = useState(false);
  const [showExpertModeAcknowledgement, setShowExpertModeAcknowledgement] = useUserExpertModeAcknowledgementShow();
  const [expertMode, toggleExpertMode] = useExpertModeManager();
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly();
  const [audioPlay, toggleSetAudioMode] = useAudioModeManager();
  const [subgraphHealth, setSubgraphHealth] = useSubgraphHealthIndicatorManager();
  const { onChangeRecipient } = useSwapActionHandlers();

  const { t } = useTranslation();

  if (showConfirmExpertModal) {
    return (
      <ExpertModal
        setShowConfirmExpertModal={setShowConfirmExpertModal}
        onDismiss={onDismiss}
        setShowExpertModeAcknowledgement={setShowExpertModeAcknowledgement}
      />
    );
  }

  const handleExpertModeToggle = () => {
    if (expertMode) {
      onChangeRecipient(null);
      toggleExpertMode();
    } else if (!showExpertModeAcknowledgement) {
      onChangeRecipient(null);
      toggleExpertMode();
    } else {
      setShowConfirmExpertModal(true);
    }
  };

  return (
    <StyledModal title={t("Settings")} onDismiss={onDismiss}>
      <ScrollableContainer>
        <Flex pb="24px" flexDirection="column">
          <GasSettings />
        </Flex>
        <Flex flexDirection="column">
          <TransactionSettings />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text color="white">{t("Expert Mode")}</Text>
            <QuestionHelper
              text={t("Bypasses confirmation modals and allows high slippage trades. Use at your own risk.")}
              placement="top-start"
              ml="4px"
            />
          </Flex>
          <Toggle id="toggle-expert-mode-button" scale="md" checked={expertMode} onChange={handleExpertModeToggle} />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text color="white">{t("Disable Multihops")}</Text>
            <QuestionHelper text={t("Restricts swaps to direct pairs only.")} placement="top-start" ml="4px" />
          </Flex>
          <Toggle
            id="toggle-disable-multihop-button"
            checked={singleHopOnly}
            scale="md"
            onChange={() => {
              setSingleHopOnly(!singleHopOnly);
            }}
          />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center" mb="24px">
          <Flex alignItems="center">
            <Text color="white">{t("Subgraph Health Indicator")}</Text>
            <QuestionHelper
              text={t(
                "Turn on NFT market subgraph health indicator all the time. Default is to show the indicator only when the network is delayed",
              )}
              placement="top-start"
              ml="4px"
            />
          </Flex>
          <Toggle
            id="toggle-subgraph-health-button"
            checked={subgraphHealth}
            scale="md"
            onChange={() => {
              setSubgraphHealth(!subgraphHealth);
            }}
          />
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <Text color="white">{t("Flippy sounds")}</Text>
            <QuestionHelper
              text={t("Fun sounds to make a truly immersive pancake-flipping trading experience")}
              placement="top-start"
              ml="4px"
            />
          </Flex>
          <PancakeToggle checked={audioPlay} onChange={toggleSetAudioMode} scale="md" />
        </Flex>
      </ScrollableContainer>
    </StyledModal>
  );
};

export default SettingsModal;
