import { nanoid } from "@reduxjs/toolkit";
import { TokenList } from "@uniswap/token-lists";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "../Root";
import { fetchTokenList } from "../slices/lists/actions";

function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const dispatch = useDispatch<AppDispatch>();

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid();
      if (sendDispatch) {
        dispatch(fetchTokenList.pending({ requestId, url: listUrl }));
      }
      // lazy load avj and token list schema
      const getTokenList = (await import("../utils/getTokenList")).default;
      return getTokenList(listUrl)
        .then((tokenList: any) => {
          if (sendDispatch) {
            dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId }));
          }
          return tokenList;
        })
        .catch((error: any) => {
          console.error(`Failed to get list at url ${listUrl}`, error);
          if (sendDispatch) {
            dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message }));
          }
          throw error;
        });
    },
    [dispatch],
  );
}

export default useFetchListCallback;
