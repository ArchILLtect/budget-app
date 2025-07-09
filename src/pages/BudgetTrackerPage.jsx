import {
  Box,
  Heading,
  Text,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  Input,
  Button,
  HStack,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { useBudgetStore } from '../state/budgetStore';
import dayjs from 'dayjs';
import TrackerHeader from '../components/TrackerHeader';
import MonthlyPlanSummary from '../components/MonthlyPlanSummary';

export default function BudgetTrackerPage() {
  const currentMonthKey = dayjs().format('YYYY-MM');
  const monthlyData = useBudgetStore((s) => s.monthlyData[currentMonthKey]);
  const setSavingsGoal = useBudgetStore((s) => s.setSavingsGoal);
  const savingsGoal = useBudgetStore((s) => s.savingsGoal);
  const selectedMonth = useBudgetStore(s => s.selectedMonth);
  const plan = useBudgetStore(s => s.monthlyPlans[selectedMonth]);
  const toast = useToast();
  const [newGoal, setNewGoal] = useState(savingsGoal);

  const actualSavings = monthlyData?.actualSavings || 0;
  const progress = savingsGoal > 0 ? Math.min((actualSavings / savingsGoal) * 100, 100) : 0;

  const handleGoalSave = () => {
    setSavingsGoal(newGoal);
    toast({ title: 'Savings goal updated!', status: 'success', duration: 2000 });
  };

  return (
    <Box bg="gray.200" p={4} minH="100vh">
      <Box p={4} maxW="800px" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="md" background={"white"}>
        <Center mb={4}>
          <Heading size="md" fontWeight={700}>Budget Tracker - {dayjs().format('MMMM YYYY')}</Heading>
        </Center>

        <TrackerHeader />

        <MonthlyPlanSummary plan={plan} />

        <Box mt={4} borderWidth={1} p={4} borderRadius="lg" bg="white" boxShadow="md">
          <Stat mb={4} textAlign="center">
            <StatLabel>Monthly Savings Progress</StatLabel>
            <StatNumber color="green.500">
              ${actualSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })} / ${savingsGoal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </StatNumber>
          </Stat>

          <Progress value={progress} size="lg" colorScheme="green" borderRadius="xl" mb={4} />

          <VStack align="start" spacing={3}>
            <Text fontWeight="semibold">Set a New Goal:</Text>
            <HStack>
              <Input
                type="number"
                placeholder="Enter savings goal"
                value={newGoal}
                onChange={(e) => setNewGoal(parseFloat(e.target.value) || 0)}
              />
              <Button colorScheme="blue" onClick={handleGoalSave}>
                Save
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}