import { GelatoLimitOrders, Order } from "@gelatonetwork/limit-orders-lib";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";
import { SLOW_INTERVAL } from "src/constants";
import useGelatoLimitOrdersLib from "src/hooks/limitOrders/useGelatoLimitOrdersLib";
import { useWeb3Context } from "src/hooks/web3Context";
import { getLSOrders, hashOrder, hashOrderSet, saveOrder, saveOrders } from "src/utils/localStorageOrders";
import useSWR from "swr";

import { LimitOrderStatus, ORDER_CATEGORY } from "../types";

export const OPEN_ORDERS_SWR_KEY = ["gelato", "openOrders"];
export const EXECEUTED_CANCELLED_ORDERS_SWR_KEY = ["gelato", "cancelledExecutedOrders"];

function newOrdersFirst(a: Order, b: Order) {
  return Number(b.updatedAt) - Number(a.updatedAt);
}

const isOrderUpdated = (oldOrder: Order, newOrder: Order): boolean => {
  return newOrder ? Number(oldOrder.updatedAt) < Number(newOrder.updatedAt) : false;
};

async function syncOrderToLocalStorage({
  gelatoLimitOrders,
  chainId,
  account,
  orders,
  syncStatuses,
}: {
  chainId: number;
  account: string;
  orders: Order[];
  syncStatuses?: LimitOrderStatus[];
  gelatoLimitOrders?: GelatoLimitOrders;
}) {
  const allOrdersLS = getLSOrders(chainId, account);

  const lsOrdersHashSet = hashOrderSet(allOrdersLS);
  const newOrders = orders.filter((order: Order) => !lsOrdersHashSet.has(hashOrder(order)));
  saveOrders(chainId, account, newOrders);

  const typeOrdersLS = syncStatuses
    ? allOrdersLS.filter(order => syncStatuses.some(type => type === order.status))
    : [];

  for (let i = 0; i < typeOrdersLS.length; i++) {
    const confOrder = typeOrdersLS[i];
    try {
      const graphOrder =
        orders.find(order => confOrder.id.toLowerCase() === order.id.toLowerCase()) ??
        // eslint-disable-next-line no-await-in-loop
        (gelatoLimitOrders ? await gelatoLimitOrders.getOrder(confOrder.id) : null);
      if (isOrderUpdated(confOrder, graphOrder as Order)) {
        saveOrder(chainId, account, graphOrder as Order);
      }
    } catch (e) {
      console.error("Error fetching order from subgraph", e);
    }
  }
}

const useOpenOrders = (turnOn: boolean): Order[] => {
  const { address: account, networkId: chainId } = useWeb3Context();

  const gelatoLimitOrders = useGelatoLimitOrdersLib();

  const startFetch = turnOn && gelatoLimitOrders && account && account !== "" && chainId;

  const { data } = useSWR(
    startFetch ? OPEN_ORDERS_SWR_KEY : null,
    async () => {
      try {
        const orders: Order[] = (await gelatoLimitOrders?.getOpenOrders(
          (account as string).toLowerCase(),
          false,
        )) as Order[];

        await syncOrderToLocalStorage({
          orders,
          chainId,
          account,
          syncStatuses: [LimitOrderStatus.OPEN],
          gelatoLimitOrders,
        });
      } catch (e) {
        console.error("Error fetching open orders from subgraph", e);
      }

      const openOrdersLS = getLSOrders(chainId, account).filter(order => order.status === LimitOrderStatus.OPEN);

      const pendingOrdersLS = getLSOrders(chainId, account, true);

      return [
        ...openOrdersLS.filter((order: Order) => {
          const orderCancelled = pendingOrdersLS
            .filter(pendingOrder => pendingOrder.status === LimitOrderStatus.CANCELLED)
            .find(pendingOrder => pendingOrder.id.toLowerCase() === order.id.toLowerCase());
          return !orderCancelled;
        }),
        ...pendingOrdersLS.filter(order => order.status === LimitOrderStatus.OPEN),
      ].sort(newOrdersFirst);
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  );

  return startFetch ? data! : [];
};

const useHistoryOrders = (turnOn: boolean): Order[] => {
  const { address: account, networkId: chainId } = useWeb3Context();
  const gelatoLimitOrders = useGelatoLimitOrdersLib();

  const startFetch = turnOn && gelatoLimitOrders && account && account !== "" && chainId;

  const { data } = useSWR(
    startFetch ? EXECEUTED_CANCELLED_ORDERS_SWR_KEY : null,
    async () => {
      try {
        const acc = account.toLowerCase();

        const [canOrders, exeOrders] = await Promise.all([
          gelatoLimitOrders?.getCancelledOrders(acc, false),
          gelatoLimitOrders?.getExecutedOrders(acc, false),
        ]);

        await syncOrderToLocalStorage({
          orders: [...(canOrders as Order[]), ...(exeOrders as Order[])],
          chainId,
          account,
        });
      } catch (e) {
        console.error("Error fetching history orders from subgraph", e);
      }

      const executedOrdersLS = getLSOrders(chainId, account).filter(
        order => order.status === LimitOrderStatus.EXECUTED,
      );

      const cancelledOrdersLS = getLSOrders(chainId, account).filter(
        order => order.status === LimitOrderStatus.CANCELLED,
      );

      const pendingCancelledOrdersLS = getLSOrders(chainId, account, true).filter(
        order => order.status === LimitOrderStatus.CANCELLED,
      );

      return [...pendingCancelledOrdersLS, ...cancelledOrdersLS, ...executedOrdersLS].sort(newOrdersFirst);
    },
    {
      refreshInterval: SLOW_INTERVAL,
    },
  );

  return startFetch ? data! : [];
};

export default function useGelatoLimitOrdersHistory(orderCategory: ORDER_CATEGORY) {
  const historyOrders = useHistoryOrders(orderCategory === ORDER_CATEGORY.History);
  const openOrders = useOpenOrders(orderCategory === ORDER_CATEGORY.Open);

  const orders = useMemo(
    () => (orderCategory === ORDER_CATEGORY.Open ? openOrders : historyOrders),
    [orderCategory, openOrders, historyOrders],
  );

  return useMemo(
    () => (Array.isArray(orders) ? orderBy(orders, order => parseInt(order.createdAt), "desc") : orders),
    [orders],
  );
}
