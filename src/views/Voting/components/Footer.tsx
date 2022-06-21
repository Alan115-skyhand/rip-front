import { Box, Button, Flex, Heading, ProposalIcon, Text } from "@pancakeswap/uikit";
import { Link } from "react-router-dom";
import Container from "src/components/Layout/Container";
import { useTranslation } from "src/contexts/Localization";
import styled from "styled-components";

import DesktopImage from "./DesktopImage";

const StyledFooter = styled(Box)`
  background: ${({ theme }) => theme.colors.gradients.bubblegum};
  padding-bottom: 32px;
  padding-top: 32px;
`;

const Footer = () => {
  const { t } = useTranslation();

  return (
    <StyledFooter>
      <Container>
        <Flex alignItems="center" justifyContent="space-between">
          <Box pr="32px">
            <Heading as="h2" scale="lg" mb="16px">
              {t("Got a suggestion?")}
            </Heading>
            <Text as="p">
              {t("Community proposals are a great way to see how the community feels about your ideas.")}
            </Text>
            <Text as="p" mb="16px">
              {t(
                "They won't necessarily be implemented if the community votes successful, but suggestions with a lot of community support may be made into Core proposals.",
              )}
            </Text>

            <Link to="/voting/proposal/create">
              <Button startIcon={<ProposalIcon color="currentColor" width="24px" />}>{t("Make a Proposal")}</Button>
            </Link>
          </Box>
          <DesktopImage src="/images/voting/voting-bunny.png" width={173} height={234} />
        </Flex>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
