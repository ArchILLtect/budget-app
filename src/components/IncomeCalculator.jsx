import { useState } from 'react'
import { useBudgetStore } from '../state/budgetStore'
import {
  Box,
  Heading,
  Input,
  Stack,
  Text,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  HStack,
  Select,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Collapse,
  Button
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

// Federal brackets – 2024 Single Filer
const FEDERAL_BRACKETS = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: 95375, rate: 0.22 },
  { min: 95375, max: 182100, rate: 0.24 },
  { min: 182100, max: 231250, rate: 0.32 },
  { min: 231250, max: 578125, rate: 0.35 },
  { min: 578125, max: Infinity, rate: 0.37 },
]

// WI brackets – 2024
const STATE_BRACKETS = {
  WI: [
    { min: 0, max: 14430, rate: 0.035 },
    { min: 14430, max: 28850, rate: 0.045 },
    { min: 28850, max: 31610, rate: 0.053 },
    { min: 31610, max: Infinity, rate: 0.0615 },
  ],
}

// Tax calculation helper
function calculateTax(gross, brackets) {
  let tax = 0
  for (const bracket of brackets) {
    const taxable = Math.min(gross, bracket.max) - bracket.min
    if (taxable > 0) {
      tax += taxable * bracket.rate
    }
    if (gross < bracket.max) break
  }
  return tax
}

export default function IncomeCalculator() {
  const [showDetails, setShowDetails] = useState(false)

  const income = useBudgetStore((s) => s.income)
  const setIncome = useBudgetStore((s) => s.setIncome)

  const handleChange = (field, value) => {
    const parsed = parseFloat(value)
    setIncome({ [field]: isNaN(parsed) ? 0 : parsed })
  }

  // TODO: Add filing status and adjust brackets accordingly
  // For now, we assume single filer
  // This can be extended to include other filing statuses like married, head of household, etc.
  // For simplicity, we will use the single filer brackets for both federal and state taxes

  const overtimeThreshold = 40
  const hourly = income.type === 'hourly'
  const baseHours = Math.min(income.hoursPerWeek || 0, overtimeThreshold)
  const overtimeHours = Math.max((income.hoursPerWeek || 0) - overtimeThreshold, 0)

  const grossSalary = income.type === 'hourly'
    ? ((income.hourlyRate || 0) * baseHours + (income.hourlyRate || 0) * 1.5 * overtimeHours) * 52
    : income.grossSalary || 0

  const SOCIAL_SECURITY_RATE = 0.062
  const SOCIAL_SECURITY_WAGE_CAP = 168600

  const MEDICARE_RATE = 0.0145

  const socialSecurityTax = Math.min(grossSalary, SOCIAL_SECURITY_WAGE_CAP) * SOCIAL_SECURITY_RATE
  const medicareTax = grossSalary * MEDICARE_RATE

  const federalTax = calculateTax(grossSalary, FEDERAL_BRACKETS)
  const stateTax = calculateTax(grossSalary, STATE_BRACKETS[income.state] || [])
  const netSalary = grossSalary - federalTax - stateTax - socialSecurityTax - medicareTax

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
      <Heading size="md" mb={3}>Income</Heading>

      {/* Income Type Toggle */}
      <FormControl mb={4}>
        <FormLabel>Income Type</FormLabel>
        <RadioGroup
          value={income.type}
          onChange={(val) => setIncome({ type: val })}
        >
          <HStack spacing={4}>
            <Radio value="hourly">Hourly</Radio>
            <Radio value="salary">Salary</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>

      {/* Hourly Inputs */}
      {hourly && (
        <Stack spacing={3}>
          <FormControl>
            <FormLabel>Hourly Rate ($/hr)</FormLabel>
            <Input
              type="number"
              value={income.hourlyRate}
              onChange={(e) => handleChange('hourlyRate', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Hours per Week</FormLabel>
            <Input
              type="number"
              value={income.hoursPerWeek}
              onChange={(e) => handleChange('hoursPerWeek', e.target.value)}
            />
          </FormControl>
        </Stack>
      )}

      {/* Salary Input */}
      {income.type === 'salary' && (
        <FormControl>
          <FormLabel>Annual Gross Salary</FormLabel>
          <Input
            type="number"
            value={income.grossSalary}
            onChange={(e) => handleChange('grossSalary', e.target.value)}
          />
        </FormControl>
      )}

      {/* State Selector */}
      <FormControl mt={5}>
        <FormLabel>Select State (for tax estimate)</FormLabel>
        <Select
          value={income.state}
          onChange={(e) => setIncome({ state: e.target.value })}
        >
          <option value="WI">Wisconsin</option>
        </Select>
      </FormControl>

      {/* Estimated Tax Output */}
      {grossSalary > 0 && (
        <Box mt={6} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
          <StatGroup mt={6}>
            <Stat>
              <StatLabel>Est. Gross Salary</StatLabel>
              <StatNumber color="teal.600">${grossSalary.toLocaleString()}</StatNumber>
              <StatHelpText>Before taxes</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel>
                💰 Est. Net Salary
                <Tooltip label="Includes federal, state, SS, and Medicare taxes" hasArrow placement="right">
                  <InfoIcon ml={2} color="gray.500" />
                </Tooltip>
              </StatLabel>
              <StatNumber color="green.600">
                ${netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </StatNumber>
              <StatHelpText>
                After taxes
                <Button size="xs" variant="link" colorScheme="blue" ml={2} onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Hide Breakdown' : 'Show Breakdown'}
                </Button>

                <Collapse in={showDetails} animateOpacity>
                  <Stack mt={3} spacing={2}>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Estimated Federal Tax:</Text>
                      <Text>${federalTax.toFixed(2)}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">State Tax (WI):</Text>
                      <Text>${stateTax.toFixed(2)}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Social Security:</Text>
                      <Text>${socialSecurityTax.toFixed(2)}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Medicare:</Text>
                      <Text>${medicareTax.toFixed(2)}</Text>
                    </Box>
                  </Stack>
                </Collapse>
              </StatHelpText>
            </Stat>
          </StatGroup>
        </Box>
      )}
    </Box>
  )
}