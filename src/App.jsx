
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import BudgetPlannerPage from './pages/BudgetPlannerPage'
import BudgetTrackerPage from './pages/BudgetTrackerPage'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box>
          <Navbar />
          <Routes>
            <Route path="/" element={<BudgetPlannerPage />} />
            <Route path="/planner" element={<BudgetPlannerPage />} />
            <Route path="/tracker" element={<BudgetTrackerPage />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  )
}