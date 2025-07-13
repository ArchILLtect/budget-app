import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateTotalTaxes, calculateNetIncome } from '../utils/calcUtils';
import dayjs from 'dayjs';

// TODO: Allow users to change overtime threshold and tax rates

const currentMonth = dayjs().format('YYYY-MM'); // e.g. "2025-07"

export const useBudgetStore = create(
    persist(
        (set) => ({
            currentPage: 'planner', // or null initially
            setCurrentPage: (page) => set(() => ({ currentPage: page })),
            filingStatus: 'headOfHousehold', // 'single' | 'marriedSeparate' | 'marriedJoint' | 'headOfHousehold'
            incomeSources: [
                {
                    id: 'primary',
                    label: 'Primary Job',
                    type: 'hourly',
                    hourlyRate: 25,
                    hoursPerWeek: 40,
                    grossSalary: 52000,
                    state: 'WI',
                    createdAt: new Date().toISOString(),
                },
            ],
            scenarios: {
                Main: {
                    name: 'Main',
                    people: {
                        You: {
                            name: 'You',
                            incomeSources: [
                                {
                                    id: 'primary',
                                    label: 'Primary Job',
                                    type: 'hourly',
                                    hourlyRate: 25,
                                    hoursPerWeek: 40,
                                    grossSalary: 0,
                                    state: 'WI',
                                    createdAt: new Date().toISOString(),
                                },
                            ],
                            expenses: [{ id: 'rent', name: 'Rent', amount: 0 }],
                        },
                    },
                    savingsMode: '20',
                    filingStatus: 'single', // 'single' | 'marriedSeparate' | 'marriedJoint' | 'headOfHousehold'
                },
                College: {
                    name: 'College',
                    people: {
                        You: {
                            name: 'You',
                            incomeSources: [
                                {
                                    id: 'primary',
                                    label: 'Primary Job',
                                    type: 'hourly',
                                    hourlyRate: 25,
                                    hoursPerWeek: 40,
                                    grossSalary: 0,
                                    state: 'WI',
                                    createdAt: new Date().toISOString(),
                                },
                            ],
                            expenses: [{ id: 'rent', name: 'Rent', amount: 0 }],
                        },
                    },
                    filingStatus: 'single', // 'single' | 'marriedSeparate' | 'marriedJoint' | 'headOfHousehold'
                    customSavings: 0,
                    savingsMode: '10',
                },
            },
            selectedSourceId: 'primary',
            showIncomeInputs: false, // Controls visibility of income input fields
            showExpenseInputs: true, // Controls visibility of income input fields
            setShowIncomeInputs: (value) => set(() => ({ showIncomeInputs: value })),
            setShowExpenseInputs: (value) => set(() => ({ showExpenseInputs: value })),
            expenses: [
                { id: 'rent', name: 'Rent', amount: 1600 },
                { id: 'groceries', name: 'Groceries', amount: 400 },
                { id: 'phone', name: 'Phone', amount: 100 },
            ],
            savingsMode: 'none', // 'none' | '10' | '20' | 'custom'
            customSavings: 0,
            currentScenario: 'Main',
            currentPersonId: 'You',
            setCurrentPersonId: (id) => set(() => ({ currentPersonId: id })),
            setIncomeSources: (sources) => set(() => ({ incomeSources: sources })),
            setExpenses: (expenses) => set(() => ({ expenses })),
            filingStatus: 'single', // 'single' | 'marriedSeparate' | 'marriedJoint' | 'headOfHousehold'
            // 📅 Current month being tracked
            selectedMonth: currentMonth,
            setSelectedMonth: (month) => set(() => ({ selectedMonth: month })),
            savingsGoal: 10000,
            setSavingsGoal: (goal) => set(() => ({ savingsGoal: goal })),
            savingsLogs: {}, // key: '2025-07', value: [{ amount, date }]
            resetSavingsLogs: () => set(() => ({ savingsLogs: {} })),
            getTotalSavingsLogged: () => {
                const { savingsLogs } = useBudgetStore.getState();
                return Object.values(savingsLogs)
                    .flat()
                    .reduce((sum, entry) => sum + (entry.amount || 0), 0);
            },
            addSavingsLog: (month, entry) =>
                set((state) => {
                    const logs = state.savingsLogs[month] || [];
                    return {
                        savingsLogs: {
                            ...state.savingsLogs,
                            [month]: [...logs, entry],
                        },
                    };
                }),
            getSavingsForMonth: (month) => {
                const { savingsLogs } = useBudgetStore.getState();
                const logs = savingsLogs[month] || [];
                return logs.reduce((sum, e) => sum + e.amount, 0);
            },
            monthlyPlans: {},
            saveMonthlyPlan: (month, planData) =>
                set((state) => {
                    const newPlan = {
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                        ...planData,
                    };

                    // Only clone actuals if none exist for this month yet
                    const existingActual = state.monthlyActuals[month];

                    const newActual = existingActual ?? {
                        actualIncome: +planData.netIncome?.toFixed(2) || 0,
                        actualExpenses: JSON.parse(
                            JSON.stringify(planData.expenses || [])
                        ),
                    };

                    return {
                        monthlyPlans: {
                            ...state.monthlyPlans,
                            [month]: newPlan,
                        },
                        monthlyActuals: {
                            ...state.monthlyActuals,
                            [month]: newActual,
                        },
                    };
                }),
            removeMonthlyPlan: (month) =>
                set((state) => {
                    const updatedPlans = { ...state.monthlyPlans };
                    delete updatedPlans[month];

                    const updatedActuals = { ...state.monthlyActuals };
                    delete updatedActuals[month];

                    return {
                        monthlyPlans: updatedPlans,
                        monthlyActuals: updatedActuals,
                    };
                }),
            // 📊 Actuals for the month
            monthlyActuals: {},
            updateMonthlyActuals: (month, updates) =>
                set((state) => ({
                    monthlyActuals: {
                        ...state.monthlyActuals,
                        [month]: {
                            ...state.monthlyActuals[month],
                            ...updates,
                        },
                    },
                })),
            // 🔁 Reset the entire log for a month -- BudgetTracker-->Savings Log
            resetSavingsLog: (month) =>
                set((state) => {
                    const newLogs = { ...state.savingsLogs };
                    delete newLogs[month];
                    return { savingsLogs: newLogs };
                }),
            // ❌ Delete a specific entry (by index or ID) -- BudgetTracker-->Savings Log
            deleteSavingsEntry: (month, index) =>
                set((state) => {
                    const logs = state.savingsLogs[month] || [];
                    return {
                        savingsLogs: {
                            ...state.savingsLogs,
                            [month]: logs.filter((_, i) => i !== index),
                        },
                    };
                }),
            getTotalGrossIncome: () => {
                const { incomeSources } = useBudgetStore.getState();
                if (!Array.isArray(incomeSources)) return 0;
                return calculateNetIncome(incomeSources);
            },
            getTotalNetIncome: () => {
                const totalGross = useBudgetStore.getState().getTotalGrossIncome();
                const taxes = calculateTotalTaxes(totalGross);
                return {
                    net: totalGross - taxes.total,
                    gross: totalGross,
                    breakdown: taxes,
                };
            },
            addIncomeSource: (source) =>
                set((state) => {
                    const newSource = {
                        ...source,
                        id: source.id || crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    };
                    const updated = [...state.incomeSources, newSource];
                    return {
                        incomeSources: updated,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                incomeSources: updated,
                            },
                        },
                    };
                }),
            updateIncomeSource: (id, updates) =>
                set((state) => {
                    const updated = state.incomeSources.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    );
                    return {
                        incomeSources: updated,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                incomeSources: updated,
                            },
                        },
                    };
                }),
            removeIncomeSource: (id) =>
                set((state) => {
                    const updated = state.incomeSources.filter((s) => s.id !== id);
                    return {
                        incomeSources: updated,
                        selectedSourceId:
                            state.selectedSourceId === id
                                ? updated[0]?.id || null
                                : state.selectedSourceId,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                incomeSources: updated,
                            },
                        },
                    };
                }),
            selectIncomeSource: (id) => set(() => ({ selectedSourceId: id })),
            addExpense: (expense) =>
                set((state) => {
                    const newExpense = {
                        ...expense,
                        id: expense.id || crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    };
                    const updated = [...state.expenses, newExpense];
                    return {
                        expenses: updated,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                expenses: updated,
                            },
                        },
                    };
                }),
            updateExpense: (id, newData) =>
                set((state) => {
                    const updated = state.expenses.map((e) =>
                        e.id === id ? { ...e, ...newData } : e
                    );
                    return {
                        expenses: updated,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                expenses: updated,
                            },
                        },
                    };
                }),
            removeExpense: (id) =>
                set((state) => {
                    const updated = state.expenses.filter((e) => e.id !== id);
                    return {
                        expenses: updated,
                        scenarios: {
                            ...state.scenarios,
                            [state.currentScenario]: {
                                ...state.scenarios[state.currentScenario],
                                expenses: updated,
                            },
                        },
                    };
                }),
            setSavingsMode: (mode) => set(() => ({ savingsMode: mode })),
            setCustomSavings: (value) => set(() => ({ customSavings: value })),
            resetScenario: () =>
                set({
                    incomeSources: [
                        {
                            id: 'primary',
                            label: 'Primary Job',
                            type: 'hourly',
                            hourlyRate: 25,
                            hoursPerWeek: 40,
                            grossSalary: 0,
                            state: 'WI',
                            createdAt: new Date().toISOString(),
                        },
                    ],
                    selectedSourceId: 'primary',
                    expenses: [{ id: 'rent', name: 'Rent', amount: 0 }],
                    savingsMode: 'none',
                    customSavings: 0,
                    filingStatus: 'headOfHousehold', // 'single' | 'married' | 'head'
                    // TODO: reset scenarios to default?
                }),
            setScenario: (name) => set({ currentScenario: name }),
            saveScenario: (name) =>
                set((state) => {
                    const personId = state.currentPersonId || 'you';
                    const existingScenario = state.scenarios[name] || {};

                    return {
                        scenarios: {
                            ...state.scenarios,
                            [name]: {
                                ...existingScenario,
                                name,
                                people: {
                                    ...(existingScenario.people || {}),
                                    [personId]: {
                                        name:
                                            state.scenarios[name]?.people?.[personId]
                                                ?.name || personId,
                                        incomeSources: JSON.parse(
                                            JSON.stringify(state.incomeSources)
                                        ),
                                        expenses: JSON.parse(
                                            JSON.stringify(state.expenses)
                                        ),
                                    },
                                },
                                savingsMode: state.savingsMode,
                                customSavings: state.customSavings,
                                filingStatus: state.filingStatus,
                            },
                        },
                        currentScenario: name,
                    };
                }),
            updateScenario: (key, updates) =>
                set((state) => ({
                    scenarios: {
                        ...state.scenarios,
                        [key]: {
                            ...state.scenarios[key],
                            ...updates,
                        },
                    },
                })),
            loadScenario: (name) =>
                set((state) => {
                    const scenario = state.scenarios[name];
                    const defaultPersonId = Object.keys(scenario.people)[0];
                    const person = scenario.people[defaultPersonId];
                    return scenario
                        ? {
                              incomeSources: JSON.parse(
                                  JSON.stringify(person.incomeSources)
                              ),
                              expenses: JSON.parse(JSON.stringify(person.expenses)),
                              savingsMode: scenario.savingsMode || 'none',
                              customSavings: scenario.customSavings || 0,
                              currentScenario: name,
                              currentPersonId: defaultPersonId,
                              filingStatus: scenario.filingStatus || 'single',
                              // TODO: add following to reset input opening on scenario change
                              showIncomeInputs: false, // 👈 Optional reset
                          }
                        : {};
                }),
            deleteScenario: (name) =>
                set((state) => {
                    const updated = { ...state.scenarios };
                    delete updated[name];

                    const fallback = Object.keys(updated)[0] || 'Main';
                    const fallbackScenario = updated[fallback];
                    const fallbackPerson =
                        fallbackScenario && Object.keys(fallbackScenario.people || {})[0];

                    return {
                        scenarios: updated,
                        ...(fallbackScenario
                            ? {
                                  currentScenario: fallback,
                                  currentPersonId: fallbackPerson,
                                  incomeSources:
                                      fallbackScenario.people?.[fallbackPerson]
                                          ?.incomeSources || [],
                                  expenses:
                                      fallbackScenario.people?.[fallbackPerson]
                                          ?.expenses || [],
                                  savingsMode: fallbackScenario.savingsMode || 'none',
                                  customSavings: fallbackScenario.customSavings || 0,
                                  filingStatus: fallbackScenario.filingStatus || 'single',
                              }
                            : {}),
                    };
                }),
        }),

        {
            name: 'budget-app-storage', // key in localStorage
        }
    )
);
