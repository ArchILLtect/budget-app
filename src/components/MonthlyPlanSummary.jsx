import { Box, Heading, Stat, StatGroup, Text,
  StatLabel, StatNumber, useColorModeValue,
  Flex} from "@chakra-ui/react";
import dayjs from "dayjs";

export default function MonthlyPlanSummary({ plan }) {
  if (!plan) return null;

  return (
    <Box px={4} py={3} boxShadow="md" borderBottomRadius="lg" bg={useColorModeValue('white', 'gray.700')}>
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading size="md" mb={2}>Plan Summary</Heading>
        {plan.createdAt && (
          <Text fontSize="xs" color="gray.500">
            Created: {dayjs(plan.createdAt).format('MMM D, YYYY')}
          </Text>
        )}
      </Flex>

      <StatGroup>
        <Stat textAlign={'center'}>
            <StatLabel>Est. Net Income</StatLabel>
            <StatNumber color="teal.600">${plan.netIncome?.toFixed(2)}</StatNumber>
        </Stat>

        {plan.totalSavings > 0 && (
        <Stat textAlign={'center'}>
            <StatLabel>Total Savings</StatLabel>
            <StatNumber color="teal.600">${plan.totalSavings?.toFixed(2)}</StatNumber>
        </Stat>
        )}

        <Stat textAlign={'center'}>
            <StatLabel>Total Expenses</StatLabel>
            <StatNumber color="teal.600">${plan.totalExpenses?.toFixed(2)}</StatNumber>
        </Stat>

        <Stat textAlign={'center'}>
            <StatLabel>Leftover</StatLabel>
            <StatNumber color={plan.totalSavings >= 0 ? "green.600" : "red.600"} fontSize="2xl">
              ${plan.totalSavings}
            </StatNumber>
        </Stat>
      </StatGroup>
    </Box>
  );
}