import { useBudgetStore } from './state/budgetStore'
import { Box, Heading, Center } from '@chakra-ui/react'
import IncomeCalculator from './components/IncomeCalculator'
import ExpenseTracker from './components/ExpenseTracker'
import ExpensePie from './components/ExpensePie'

function App() {
  const income = useBudgetStore((s) => s.income)
  // const expenses = useBudgetStore((s) => s.expenses)

  return (
    <Box p={4}>
      <Center>
        <Heading mt={4} mb={8}>Budget App</Heading>
      </Center>
      {/* <pre>{JSON.stringify(income, null, 2)}</pre>
      <pre>{JSON.stringify(expenses, null, 2)}</pre> */}
      <IncomeCalculator />
      <ExpenseTracker netIncome={income.netIncome} />
      <ExpensePie />
    </Box>
  )
}

export default App
