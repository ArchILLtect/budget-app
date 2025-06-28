import { useBudgetStore } from './state/budgetStore'
import { Box, Heading, Button } from '@chakra-ui/react'
import IncomeCalculator from './components/IncomeCalculator'
import ExpenseTracker from './components/ExpenseTracker'

function App() {
  const income = useBudgetStore((s) => s.income)
  const setIncome = useBudgetStore((s) => s.setIncome)
  const netIncome = useBudgetStore((s) => s.income.netIncome)

  return (
    <Box p={4}>
      <Heading>Budget App</Heading>
      <pre>{JSON.stringify(income, null, 2)}</pre>
      <IncomeCalculator />
      <ExpenseTracker netSalary={income.netSalary} />
    </Box>
  )
}

export default App
