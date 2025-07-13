import {
  Box, Button, Heading, Input, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, IconButton, Flex
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { DeleteIcon } from '@chakra-ui/icons'
import { useBudgetStore } from '../state/budgetStore';

// TODO: Add avatars?
// TODO: Rename/Edit buttons
// TODO: Tooltip on hoverover
// TODO: Test for keyboard nav / screen readers
// TODO: Add responsive stacking (Wrap at small sizes)

export default function PersonSelector() {
  const scenario = useBudgetStore(s => s.scenarios[s.currentScenario]);
  const currentPersonId = useBudgetStore(s => s.currentPersonId);
  const setCurrentPersonId = useBudgetStore(s => s.setCurrentPersonId);
  const updateScenario = useBudgetStore(s => s.updateScenario);
  const setIncomeSources = useBudgetStore(s => s.setIncomeSources);
  const setExpenses = useBudgetStore(s => s.setExpenses);

  const personIds = Object.keys(scenario.people || {});
  const currentIndex = personIds.indexOf(currentPersonId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newPersonName, setNewPersonName] = useState('');

  const cancelRef = useRef();
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const confirmDeletePerson = () => {
    deletePerson(personToDelete);
    setIsDeleteOpen(false);
    setPersonToDelete(null);
  };

  const switchPerson = (id) => {
    const person = scenario.people[id];
    setCurrentPersonId(id);
    setIncomeSources(person.incomeSources || []);
    setExpenses(person.expenses || []);

    if (person.incomeSources?.length > 0) {
      useBudgetStore.getState().selectIncomeSource(person.incomeSources[0].id);
    }
  };

  const addPerson = () => {
    const displayName = newPersonName.trim();
    const id = displayName.toLowerCase().replace(/\s+/g, '-');
    if (!id || scenario.people[id]) return;

    const newPeople = {
      ...scenario.people,
      [id]: {
        name: displayName,
        incomeSources: [],
        expenses: [],
      },
    };

    updateScenario(scenario.name, { people: newPeople });
    setCurrentPersonId(id);
    setIncomeSources([
      {
        id: 'primary',
        label: 'Primary Job',
        type: 'hourly',
        hourlyRate: 25,
        hoursPerWeek: 40,
        grossSalary: 0,
        state: 'WI',
        createdAt: new Date().toISOString(),
      }
    ]);
    setExpenses([{id: "rent", name: "Rent", amount: 1000}]);

    setNewPersonName('');
    onClose();
  };

  const deletePerson = (id) => {
    if (personIds.length === 1) return; // Can't delete the last person
    const updated = { ...scenario.people };
    delete updated[id];

    const fallbackId = personIds.find(p => p !== id);
    updateScenario(scenario.name, { people: updated });
    setCurrentPersonId(fallbackId);
    const fallback = updated[fallbackId];
    setIncomeSources(fallback.incomeSources || []),
    setExpenses(fallback.expenses || [])
  };

  return (
    <>
      <Heading size="md" mb={2}>Family Member</Heading>
      <Flex justify={'space-between'} mb={4}>
        <Flex gap={2}>
          {personIds.map((id) => (
            <Box>
              <Button
                key={id}
                variant={id === currentPersonId ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => switchPerson(id)}
                size="lg"
                borderRightRadius={scenario.people[id].name == 'You' ? "lg" : "none"}
              >
                {scenario.people[id].name}
              </Button>
              {scenario.people[id].name !== 'You' && (
                <IconButton
                  aria-label="Remove expense"
                  icon={<DeleteIcon />}
                  onClick={(e) => {
                  e.stopPropagation();
                  setPersonToDelete(id);
                  setIsDeleteOpen(true);
                  }}
                  size="lg"
                  colorScheme="red"
                  borderLeftRadius="none"
                  borderColor={'rgba(49, 130, 206, 1)'}
                />
              )}
            </Box>
          ))}
        </Flex>
        <Button onClick={onOpen} size="lg" colorScheme="green">+ Add</Button>
      </Flex>

      {/* Add Person Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Person</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Person's Name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              mb={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={addPerson} colorScheme="teal" mr={3}>Add</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Person
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{scenario.people[personToDelete]?.name}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeletePerson} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}