import { useBudgetStore } from './state/budgetStore'
import { Box, Heading, Button } from '@chakra-ui/react'
import IncomeCalculator from './components/IncomeCalculator'

function App() {
  const income = useBudgetStore((s) => s.income)
  const setIncome = useBudgetStore((s) => s.setIncome)

  return (
    <Box p={4}>
      <Heading>Budget App</Heading>
      <pre>{JSON.stringify(income, null, 2)}</pre>
      <IncomeCalculator />
    </Box>
  )
}

export default App
