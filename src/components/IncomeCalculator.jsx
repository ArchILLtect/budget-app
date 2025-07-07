import { useState, useEffect } from 'react'
import { useBudgetStore } from '../state/budgetStore'
import {
  Box,
  Flex,
  Heading,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
import IncomeSourceForm from './IncomeSourceForm'
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
  const [showInputs, setShowInputs] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const sources = useBudgetStore((s) => s.incomeSources)
  const selectedId = useBudgetStore((s) => s.selectedSourceId)
  const setSelected = useBudgetStore((s) => s.selectIncomeSource)
  const updateSource = useBudgetStore((s) => s.updateIncomeSource)
  const addSource = useBudgetStore((s) => s.addIncomeSource)
  const grossTotal = useBudgetStore.getState().getTotalGrossIncome();

  const activeSource = sources.find((s) => s.id === selectedId) || sources[0] || {}
  const { net, breakdown } = useBudgetStore.getState().getTotalNetIncome();

  // TODO: Add filing status and adjust brackets accordingly
  // For now, we assume single filer
  // This can be extended to include other filing statuses like married, head of household, etc.
  // For simplicity, we will use the single filer brackets for both federal and state taxes

  const overtimeThreshold = 40
  const baseHours = Math.min(activeSource.hoursPerWeek || 0, overtimeThreshold)
  const overtimeHours = Math.max((activeSource.hoursPerWeek || 0) - overtimeThreshold, 0)

  const grossSalary = activeSource.type === 'hourly'
    ? ((activeSource.hourlyRate || 0) * baseHours + (activeSource.hourlyRate || 0) * 1.5 * overtimeHours) * 52
    : activeSource.grossSalary || 0

  const SOCIAL_SECURITY_RATE = 0.062
  const SOCIAL_SECURITY_WAGE_CAP = 168600

  const MEDICARE_RATE = 0.0145

  const socialSecurityTax = Math.min(grossSalary, SOCIAL_SECURITY_WAGE_CAP) * SOCIAL_SECURITY_RATE
  const medicareTax = grossSalary * MEDICARE_RATE

  const federalTax = calculateTax(grossSalary, FEDERAL_BRACKETS)
  const stateTax = calculateTax(grossSalary, STATE_BRACKETS[activeSource.state] || [])
  const netSalary = grossSalary - federalTax - stateTax - socialSecurityTax - medicareTax

  useEffect(() => {
    if (activeSource) {
      updateSource(activeSource.id, { netIncome: netSalary })
    }
  }, [netSalary])

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
      <Flex mb={2} justifyContent="space-between" alignItems="center">
        <Heading size="md">Income</Heading>
        <Button size="xs" variant="link" colorScheme="blue" ml={2} onClick={() => setShowInputs(!showInputs)}>
          {showInputs ? 'Hide Inputs' : 'Show Inputs'}
        </Button>
      </Flex>

      <Collapse mb={4} in={showInputs} animateOpacity>
        <Tabs
          index={sources.findIndex((s) => s.id === selectedId)}
          onChange={(index) => {
            if (index < sources.length) {
              setSelected(sources[index].id)
            }
            // else: it's the +Add tab — no need to set selected source yet
          }}
          isLazy
          variant="enclosed"
        >
          <TabList>
            {sources.map((source) => (
              <Tab key={source.id}>{source.label}</Tab>
            ))}
            <Tab
              onClick={() => {
                const id = crypto.randomUUID(); // generate a new ID here
                const newSource = {
                  id,
                  label: `Income ${sources.length + 1}`,
                  type: 'hourly',
                  hourlyRate: 0,
                  hoursPerWeek: 0,
                  grossSalary: 0,
                  state: 'WI',
                }

                addSource(newSource)     // ✅ uses our updated store logic
                setSelected(id)          // ✅ auto-switch to the new tab
              }}
              >+ Add</Tab>
          </TabList>

          <TabPanels>
            {sources.map((source) => (
              <TabPanel key={source.id}>
                {/* YOUR income input form for this source */}
                <IncomeSourceForm source={source} onUpdate={updateSource} />
              </TabPanel>
            ))}

            <TabPanel>
              <Button
                onClick={() => {
                  const newSource = {
                    label: `Income ${sources.length + 1}`,
                    type: 'hourly',
                    hourlyRate: 0,
                    hoursPerWeek: 0,
                    grossSalary: 0,
                    state: 'WI'
                  }
                  addSource(newSource)
                }}
              >
                Create New Income Source
              </Button>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Collapse>

      {/* Estimated Income Output */}
      {grossTotal > 0 && (
        <Box mt={2} px={4} py={3} borderWidth={1} borderRadius="md" bg="gray.50">
          <StatGroup>
            <Stat textAlign={'center'}>
              <StatLabel>Est. Gross Salary</StatLabel>
              <StatNumber color="teal.600">${grossTotal.toLocaleString()}</StatNumber>
              <StatHelpText mb={0}>Before taxes</StatHelpText>
            </Stat>

            <Stat textAlign={'center'}>
              <StatLabel>
                💰 Est. Net Salary
                <Tooltip label="Includes federal, state, SS, and Medicare taxes" hasArrow placement="right">
                  <InfoIcon ml={2} color="gray.500" />
                </Tooltip>
              </StatLabel>
              <StatNumber color="green.600">
                ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </StatNumber>
              <StatHelpText mb={0}>
                After taxes
                <Button size="xs" variant="link" colorScheme="blue" ml={2} onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Hide Breakdown' : 'Show Breakdown'}
                </Button>

                <Collapse in={showDetails} animateOpacity>
                  <Stack mt={3} spacing={2}>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Estimated Federal Tax:</Text>
                      <Text>${breakdown.federalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">State Tax (WI):</Text>
                      <Text>${breakdown.stateTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Social Security:</Text>
                      <Text>${breakdown.ssTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </Box>
                    <Box bg="gray.100" p={3} borderRadius="md">
                      <Text fontWeight="semibold">Medicare:</Text>
                      <Text>${breakdown.medicareTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
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