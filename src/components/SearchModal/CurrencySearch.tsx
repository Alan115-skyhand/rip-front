/* eslint-disable no-restricted-syntax */
import { Currency, ETHER, Token } from "@pancakeswap/sdk";
import { Box, Input, Text } from "@pancakeswap/uikit";
import { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
// import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useWeb3Context } from "src/hooks";
import styled from "styled-components";

import { useTranslation } from "../../contexts/Localization";
import { useAllTokens, useIsUserAddedToken, useToken } from "../../hooks/Tokens";
import useDebounce from "../../hooks/useDebounce";
import { useAllLists, useInactiveListUrls } from "../../slices/lists/hooks";
import { TagInfo, WrappedTokenInfo } from "../../slices/types";
import { useAudioModeManager } from "../../slices/user/hooks";
import { isAddress } from "../../utils";
import Column, { AutoColumn } from "../Layout/Column";
import Row from "../Layout/Row";
import CommonBases from "./CommonBases";
import CurrencyList from "./CurrencyList";
import { createFilterToken, useSortedTokensByQuery } from "./filtering";
import ImportRow from "./ImportRow";
import useTokenComparator from "./sorting";
import { getSwapSound } from "./swapSound";

export const StyledInput = styled(Input)<{ light?: string }>`
  background: #00fcb0;
  color: ${({ light }) => (light === "dark" ? "white" : "black")};
  border-radius: 50px;
  text-align: center;
  border: none;
  max-height: 40px;
  &:focus {
    box-shadow: none !important;
  }
  &::placeholder {
    color: ${({ light }) => (light === "dark" ? "white" : "#000000aa")};
  }
`;

interface CurrencySearchProps {
  selectedCurrency?: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  otherSelectedCurrency?: Currency | null;
  showCommonBases?: boolean;
  showImportView: () => void;
  setImportToken: (token: Token) => void;
}

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists();
  const inactiveUrls = useInactiveListUrls();
  const { networkId: chainId } = useWeb3Context();
  const activeTokens = useAllTokens();
  return useMemo(() => {
    if (!search || search.trim().length === 0) return [];
    const filterToken = createFilterToken(search);
    const result: WrappedTokenInfo[] = [];
    const addressSet: { [address: string]: true } = {};
    for (const url of inactiveUrls) {
      const list = lists[url].current;
      // eslint-disable-next-line no-continue
      if (!list) continue;
      for (const tokenInfo of list.tokens) {
        const tags: TagInfo[] =
          tokenInfo.tags
            ?.map(tagId => {
              if (!list.tags?.[tagId]) return undefined;
              return { ...list.tags[tagId], id: tagId };
            })
            ?.filter((x): x is TagInfo => Boolean(x)) ?? [];

        if (tokenInfo.chainId === chainId && filterToken(tokenInfo)) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, tags);
          if (!(wrapped.address in activeTokens) && !addressSet[wrapped.address]) {
            addressSet[wrapped.address] = true;
            result.push(wrapped);
            if (result.length >= minResults) return result;
          }
        }
      }
    }
    return result;
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search]);
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  showImportView,
  setImportToken,
}: CurrencySearchProps) {
  const { t } = useTranslation();
  const { networkId: chainId } = useWeb3Context();

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedQuery = useDebounce(searchQuery, 200);

  const [invertSearchOrder] = useState<boolean>(false);

  const allTokens = useAllTokens();
  // if they input an address, use it
  const searchToken = useToken(debouncedQuery);
  const searchTokenIsAdded = useIsUserAddedToken(searchToken);

  const [audioPlay] = useAudioModeManager();

  const showBNB: boolean = useMemo(() => {
    const s = debouncedQuery.toLowerCase().trim();
    return s === "" || s === "b" || s === "bn" || s === "bnb";
  }, [debouncedQuery]);

  const filteredTokens: Token[] = useMemo(() => {
    const filterToken = createFilterToken(debouncedQuery);
    return Object.values(allTokens).filter(filterToken);
  }, [allTokens, debouncedQuery]);

  const filteredQueryTokens = useSortedTokensByQuery(filteredTokens, debouncedQuery);

  const tokenComparator = useTokenComparator(invertSearchOrder);

  const filteredSortedTokens: Token[] = useMemo(() => {
    return [...filteredQueryTokens].sort(tokenComparator);
  }, [filteredQueryTokens, tokenComparator]);

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency);
      if (audioPlay) {
        getSwapSound().play();
      }
    },
    [audioPlay, onCurrencySelect],
  );

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleInput = useCallback(event => {
    const input = event.target.value;
    const checksummedInput = isAddress(input);
    setSearchQuery(checksummedInput || input);
    //@ts-ignore
    fixedList.current?.scrollTo(0);
  }, []);

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const s = debouncedQuery.toLowerCase().trim();
        if (s === "bnb") {
          handleCurrencySelect(ETHER);
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0]);
          }
        }
      }
    },
    [filteredSortedTokens, handleCurrencySelect, debouncedQuery],
  );

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(debouncedQuery);

  return (
    <>
      <div>
        <AutoColumn gap="16px">
          <Row>
            <StyledInput
              id="token-search-input"
              placeholder={t("Search name or paste address...")}
              scale="lg"
              autoComplete="off"
              value={searchQuery}
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              onKeyDown={handleEnter}
              style={{ border: 0, outline: 0 }}
              light="light"
            />
          </Row>
          {showCommonBases && (
            <CommonBases chainId={chainId} onSelect={handleCurrencySelect} selectedCurrency={selectedCurrency} />
          )}
        </AutoColumn>
        <br />
        <hr style={{ border: "1px solid #09FDB5" }} />
        {searchToken && !searchTokenIsAdded ? (
          <Column style={{ padding: "0px 0", height: "100%" }}>
            <ImportRow token={searchToken} showImportView={showImportView} setImportToken={setImportToken} />
          </Column>
        ) : Boolean(filteredSortedTokens?.length) || Boolean(filteredInactiveTokens?.length) ? (
          <Box margin="0px -24px">
            <CurrencyList
              height={390}
              showBNB={showBNB}
              currencies={filteredSortedTokens}
              inactiveCurrencies={filteredInactiveTokens}
              breakIndex={
                Boolean(filteredInactiveTokens?.length) && filteredSortedTokens
                  ? filteredSortedTokens.length
                  : undefined
              }
              onCurrencySelect={handleCurrencySelect}
              otherCurrency={otherSelectedCurrency}
              selectedCurrency={selectedCurrency}
              fixedListRef={fixedList}
              showImportView={showImportView}
              setImportToken={setImportToken}
            />
          </Box>
        ) : (
          <Column style={{ padding: "0px", height: "100%" }}>
            <Text color="textSubtle" textAlign="center" mb="20px">
              {t("No results found.")}
            </Text>
          </Column>
        )}
      </div>
    </>
  );
}

export default CurrencySearch;
