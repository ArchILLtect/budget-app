
import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import BudgetPlanner from './pages/BudgetPlanner'
import BudgetTracker from './pages/BudgetTracker'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box>
          <Navbar />
          <Routes>
            <Route path="/" element={<BudgetPlanner />} />
            <Route path="/planner" element={<BudgetPlanner />} />
            <Route path="/tracker" element={<BudgetTracker />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  )
}