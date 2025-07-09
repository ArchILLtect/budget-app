import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Button, Select
} from "@chakra-ui/react";
import { useState } from "react";
import { useBudgetStore } from "../state/budgetStore";

export default function ScenarioPlanModal({ isOpen, onClose }) {
  const scenarios = useBudgetStore((s) => s.scenarios);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const saveMonthlyPlan = useBudgetStore((s) => s.saveMonthlyPlan);

  const [selectedScenario, setSelectedScenario] = useState(Object.keys(scenarios)[0] || "");

  const handleSave = (e) => {
    const scenario = scenarios[selectedScenario];
    if (!scenario) return;

    const netIncome = scenario.incomeSources?.length
      ? scenario.incomeSources.reduce((sum, src) => {
          if (src.type === "hourly") {
            const base = Math.min(src.hoursPerWeek || 0, 40);
            const ot = Math.max((src.hoursPerWeek || 0) - 40, 0);
            return sum + ((src.hourlyRate || 0) * base + (src.hourlyRate || 0) * 1.5 * ot) * 52 / 12;
          } else {
            return sum + (src.grossSalary || 0) / 12;
          }
        }, 0)
      : 0;

    const savingsPercent =
      scenario.savingsMode === "10"
        ? 0.1
        : scenario.savingsMode === "20"
        ? 0.2
        : scenario.savingsMode === "custom"
        ? (scenario.customSavings || 0) / 100
        : 0;

    const estSavings = +(netIncome * savingsPercent).toFixed(2);
    const totalExpenses = scenario.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const estLeftover = netIncome - totalExpenses - estSavings;

    saveMonthlyPlan(selectedMonth, {
      scenarioName: selectedScenario,
      incomeSources: JSON.parse(JSON.stringify(scenario.incomeSources)),
      expenses: JSON.parse(JSON.stringify(scenario.expenses)),
      savingsMode: scenario.savingsMode,
      customSavings: scenario.customSavings,
      netIncome: netIncome,
      savingsPercent: savingsPercent,
      totalExpenses: totalExpenses,
      estLeftover: estLeftover,
      totalSavings: estSavings
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select a Scenario</ModalHeader>
        <ModalCloseButton />
          <ModalBody>
          <Select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
          >
            {Object.keys(scenarios).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSave} colorScheme="teal" mr={3}>Use Scenario</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
      </ModalContent>
    </Modal>
  );
}