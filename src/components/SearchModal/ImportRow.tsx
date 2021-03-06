import { Token } from "@pancakeswap/sdk";
import { Button, CheckmarkCircleIcon, Text, useMatchBreakpoints } from "@pancakeswap/uikit";
import { CSSProperties } from "react";
import styled from "styled-components";

import { AutoColumn } from "../../components/Layout/Column";
import { AutoRow, RowFixed } from "../../components/Layout/Row";
import { ListLogo } from "../../components/Logo";
import CurrencyLogo from "../../components/Logo/CurrencyLogo";
import { useTranslation } from "../../contexts/Localization";
import { useIsTokenActive, useIsUserAddedToken } from "../../hooks/Tokens";
// import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useWeb3Context } from "../../hooks/web3Context";
import { useCombinedInactiveList } from "../../slices/lists/hooks";

const TokenSection = styled.div<{ dim?: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto;
  grid-gap: 10px;
  align-items: center;

  opacity: ${({ dim }) => (dim ? "0.4" : "1")};

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 16px;
  }
`;

const CheckIcon = styled(CheckmarkCircleIcon)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: ${({ theme }) => theme.colors.success};
`;

const NameOverflow = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  font-size: 12px;
`;

export default function ImportRow({
  token,
  style,
  dim,
  showImportView,
  setImportToken,
}: {
  token: Token;
  style?: CSSProperties;
  dim?: boolean;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}) {
  // globals
  const { networkId: chainId } = useWeb3Context();
  const { isMobile } = useMatchBreakpoints();

  const { t } = useTranslation();

  // check if token comes from list
  const inactiveTokenList = useCombinedInactiveList();
  const list = chainId && inactiveTokenList?.[chainId as keyof typeof inactiveTokenList]?.[token.address]?.list;

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token);
  const isActive = useIsTokenActive(token);

  return (
    <TokenSection style={style}>
      <CurrencyLogo currency={token} size={isMobile ? "20px" : "24px"} style={{ opacity: dim ? "0.6" : "1" }} />
      <AutoColumn gap="4px" style={{ opacity: dim ? "0.6" : "1" }}>
        <AutoRow>
          <Text color="white" mr="8px">
            {token.symbol}
          </Text>
          <Text color="textDisabled">
            <NameOverflow title={token.name}>{token.name}</NameOverflow>
          </Text>
        </AutoRow>
        {list && list.logoURI && (
          <RowFixed>
            <Text fontSize={isMobile ? "10px" : "14px"} mr="4px" color="white">
              {t("via")} {list.name}
            </Text>
            <ListLogo logoURI={list.logoURI} size="12px" />
          </RowFixed>
        )}
      </AutoColumn>
      {!isActive && !isAdded ? (
        <Button
          scale={isMobile ? "sm" : "md"}
          width="fit-content"
          padding={3}
          onClick={() => {
            if (setImportToken) {
              setImportToken(token);
            }
            showImportView();
          }}
        >
          <Text color="black">{t("Import")}</Text>
        </Button>
      ) : (
        <RowFixed style={{ minWidth: "fit-content" }}>
          <CheckIcon />
          <Text color="success">Active</Text>
        </RowFixed>
      )}
    </TokenSection>
  );
}
