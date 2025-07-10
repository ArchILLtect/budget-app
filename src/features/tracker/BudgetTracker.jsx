import {
  Box
} from '@chakra-ui/react';
import { useBudgetStore } from '../../state/budgetStore';
import MonthlyPlanSummary from '../../components/MonthlyPlanSummary';

export default function SavingsProgressBar() {

  const selectedMonth = useBudgetStore(s => s.selectedMonth);
  const plan = useBudgetStore(s => s.monthlyPlans[selectedMonth]);

  return (
    <Box>
      <MonthlyPlanSummary plan={plan} />
    </Box>
  );
}