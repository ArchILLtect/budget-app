import { useBudgetStore } from './state/budgetStore'
import { Box, Heading, Center } from '@chakra-ui/react'
import IncomeCalculator from './components/IncomeCalculator'
import ExpenseTracker from './components/ExpenseTracker'
import ExpensePie from './components/ExpensePie'

function App() {
  const income = useBudgetStore((s) => s.income)
  // const expenses = useBudgetStore((s) => s.expenses)

  return (
    <Box bg="gray.100" minH="100vh">
      <Center>
        <Heading m={4}>Budget App</Heading>
      </Center>
      <Box p={4} maxW="800px" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="md" background={"white"}>
        {/* <pre>{JSON.stringify(income, null, 2)}</pre>
        <pre>{JSON.stringify(expenses, null, 2)}</pre> */}
        <IncomeCalculator />
        <ExpenseTracker netIncome={income.netIncome} />
        <ExpensePie />
      </Box>
    </Box>
  )
}

export default App
