import { useBudgetStore } from '../state/budgetStore'
import {
  Box,
  Heading,
  Stack,
  Input,
  Button,
  Text,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

// TODO: Use FormErrorMessage for better validation feedback

export default function ExpenseTracker({ netSalary }) {
  const expenses = useBudgetStore((s) => s.expenses)
  const addExpense = useBudgetStore((s) => s.addExpense)
  const updateExpense = useBudgetStore((s) => s.updateExpense)
  const removeExpense = useBudgetStore((s) => s.removeExpense)
  const netIncome = useBudgetStore((s) => s.income.netIncome)
  const monthlyIncome = netIncome / 12
  const suggestedSavings10 = monthlyIncome * 0.10
  const suggestedSavings20 = monthlyIncome * 0.20

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const leftover = monthlyIncome - totalExpenses

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mt={6}>
      <Heading size="md" mb={3}>Expenses</Heading>

      <Stack spacing={3}>
        {expenses.map((expense) => (
          <HStack key={expense.id}>
            <Input
              value={expense.name}
              isInvalid={!expense.name.trim()}
              onChange={(e) =>
                updateExpense(expense.id, { name: e.target.value })
              }
              placeholder="Expense name"
            />
            <Input
              type="number"
              value={expense.amount}
              isInvalid={expense.amount < 0}
              onChange={(e) =>
                updateExpense(expense.id, { amount: parseFloat(e.target.value) || 0 })
              }
              placeholder="Amount"
            />
            {expense.name.toLowerCase() !== 'rent' && (
              <IconButton
                aria-label="Remove expense"
                icon={<DeleteIcon />}
                onClick={() => removeExpense(expense.id)}
                size="sm"
                colorScheme="red"
              />
            )}
          </HStack>
        ))}

        <Button
          onClick={() => addExpense({ name: '', amount: 0 })}
          leftIcon={<AddIcon />}
          size="sm"
          alignSelf="start"
        >
          Add Expense
        </Button>

        <Box pt={4}>
          <Text fontWeight="semibold">Estimated Monthly Net Income:</Text>
          <Text>${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

          <Text fontWeight="semibold" mt={3}>Total Expenses:</Text>
          <Text color="red.500">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

          <Text fontWeight="semibold" mt={3}>Leftover After Expenses:</Text>
          <Text color={leftover >= 0 ? 'green.600' : 'red.600'} fontSize="xl">
            ${leftover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text fontWeight="semibold" mt={4}>Suggested Savings:</Text>
          <Text fontSize="sm" color="gray.600">
            10%: ${suggestedSavings10.toLocaleString(undefined, { minimumFractionDigits: 2 })} &nbsp; | &nbsp;
            20%: ${suggestedSavings20.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}