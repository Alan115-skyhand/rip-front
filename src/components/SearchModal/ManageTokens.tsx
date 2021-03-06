import { Token } from "@pancakeswap/sdk";
import { Button, CloseIcon, IconButton, Link, LinkExternal, Text } from "@pancakeswap/uikit";
import { RefObject, useCallback, useMemo, useRef, useState } from "react";
// import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useWeb3Context } from "src/hooks";
import styled from "styled-components";

import Row, { RowBetween, RowFixed } from "../../components/Layout/Row";
import { CurrencyLogo } from "../../components/Logo";
import { useTranslation } from "../../contexts/Localization";
import { useToken } from "../../hooks/Tokens";
import { useRemoveUserAddedToken } from "../../slices/user/hooks";
import useUserAddedTokens from "../../slices/user/hooks/useUserAddedTokens";
import { getBscScanLink, isAddress } from "../../utils";
import Column, { AutoColumn } from "../Layout/Column";
import { StyledInput } from "./CurrencySearch";
import ImportRow from "./ImportRow";
import { CurrencyModalView } from "./types";

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 60px;
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function ManageTokens({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CurrencyModalView) => void;
  setImportToken: (token: Token) => void;
}) {
  const { networkId: chainId } = useWeb3Context();

  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState<string>("");

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();
  const handleInput = useCallback(event => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
  }, []);

  // if they input an address, use it
  const searchToken = useToken(searchQuery);

  // all tokens for local list
  const userAddedTokens: Token[] = useUserAddedTokens();
  const removeToken = useRemoveUserAddedToken();

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.forEach(token => {
        return removeToken(chainId, token.address);
      });
    }
  }, [removeToken, userAddedTokens, chainId]);

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map(token => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CurrencyLogo currency={token} size="20px" />
            <Link external href={getBscScanLink(token.address, "address", chainId)} color="white" ml="10px">
              {token.symbol}
            </Link>
          </RowFixed>
          <RowFixed>
            <IconButton variant="text" onClick={() => removeToken(chainId, token.address)}>
              <CloseIcon color="#09FDB5" />
            </IconButton>
            <LinkExternal color="#09FDB5" href={getBscScanLink(token.address, "address", chainId)} />
          </RowFixed>
        </RowBetween>
      ))
    );
  }, [userAddedTokens, chainId, removeToken]);

  const isAddressValid = searchQuery === "" || isAddress(searchQuery);

  return (
    <Wrapper>
      <Column style={{ width: "100%", flex: "1 1" }}>
        <AutoColumn gap="14px">
          <Row>
            <StyledInput
              id="token-search-input"
              scale="lg"
              placeholder="0x0000"
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              isWarning={!isAddressValid}
              light="dark"
            />
          </Row>
          {!isAddressValid && <Text color="failure">{t("Enter valid token address")}</Text>}
          {searchToken && (
            <ImportRow
              token={searchToken}
              showImportView={() => setModalView(CurrencyModalView.importToken)}
              setImportToken={setImportToken}
              style={{ height: "fit-content" }}
            />
          )}
        </AutoColumn>
        {tokenList}
        <Footer>
          <Text bold color="white">
            {userAddedTokens?.length} {userAddedTokens.length === 1 ? t("Custom Token") : t("Custom Tokens")}
          </Text>
          {userAddedTokens.length > 0 && (
            <Button
              style={{ borderRadius: "40px", backgroundColor: "#09FDB5" }}
              variant="tertiary"
              onClick={handleRemoveAll}
            >
              <Text color="white" bold>
                {t("clear all")}
              </Text>
            </Button>
          )}
        </Footer>
      </Column>
    </Wrapper>
  );
}
