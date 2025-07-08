
import { Box, Heading, Center } from '@chakra-ui/react'


function FinanceTracker() {

  return (
    <Box bg="gray.200" p={4} minH="100vh">
      <Box p={4} maxW="800px" mx="auto" borderWidth={1} borderRadius="lg" boxShadow="md" background={"white"}>
        {/* <pre>{JSON.stringify(income, null, 2)}</pre>
        <pre>{JSON.stringify(expenses, null, 2)}</pre> */}
        <Center mb={4}>
          <Heading>Budget Tracker</Heading>
        </Center>
      </Box>
    </Box>
  )
}

export default FinanceTracker