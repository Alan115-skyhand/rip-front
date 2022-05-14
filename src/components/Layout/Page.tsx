import { useLocation } from "react-router";
import styled from "styled-components";

// import Head from 'next/head'
// import { useRouter } from 'next/router'
import { DEFAULT_META, getCustomMeta } from "../../constants/meta";
import { useTranslation } from "../../contexts/Localization";
import { useCakeBusdPrice } from "../../hooks/useBUSDPrice";
import Container from "./Container";

const StyledPage = styled(Container)`
  min-height: calc(100vh - 64px);
  padding-top: 16px;
  padding-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-top: 24px;
    padding-bottom: 24px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 32px;
    padding-bottom: 32px;
  }
`;

export const PageMeta: React.FC<{ symbol?: string }> = ({ symbol }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathname } = location;
  const cakePriceUsd = useCakeBusdPrice();
  const cakePriceUsdDisplay = cakePriceUsd ? `$${cakePriceUsd.toFixed(3)}` : "...";

  const pageMeta = getCustomMeta(pathname, t) || {};
  const { title, description, image } = { ...DEFAULT_META, ...pageMeta };
  let pageTitle = cakePriceUsdDisplay ? [title, cakePriceUsdDisplay].join(" - ") : title;
  if (symbol) {
    pageTitle = [symbol, title].join(" - ");
  }

  return (
    <head>
      <title>{pageTitle}</title>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </head>
  );
};

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  symbol?: string;
}

const Page: React.FC<PageProps> = ({ children, symbol, ...props }) => {
  return (
    <>
      <PageMeta symbol={symbol} />
      <StyledPage {...props}>{children}</StyledPage>
    </>
  );
};

export default Page;
