import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateTotalTaxes } from "../utils/taxUtils";
import dayjs from "dayjs";

// TODO: Allow users to change overtime threshold and tax rates

const currentMonth = dayjs().format("YYYY-MM"); // e.g. "2025-07"

export const useBudgetStore = create(
    persist(
        (set) => ({
            currentPage: "planner", // or null initially
            setCurrentPage: (page) => set(() => ({ currentPage: page })),
            incomeSources: [
                {
                    id: "primary",
                    label: "Primary Job",
                    type: "hourly",
                    hourlyRate: 25,
                    hoursPerWeek: 40,
                    grossSalary: 0,
                    state: "WI",
                    createdAt: new Date().toISOString(),
                },
            ],
            scenarios: {
                Main: {
                    name: "Main",
                    incomeSources: [
                        {
                            id: "primary",
                            label: "Primary Job",
                            type: "hourly",
                            hourlyRate: 25,
                            hoursPerWeek: 40,
                            grossSalary: 0,
                            state: "WI",
                            createdAt: new Date().toISOString(),
                        },
                    ],
                    expenses: [{ id: "rent", name: "Rent", amount: 0 }],
                },
                College: {
                    name: "College",
                    incomeSources: [
                        {
                            id: "primary",
                            label: "Primary Job",
                            type: "hourly",
                            hourlyRate: 25,
                            hoursPerWeek: 40,
                            grossSalary: 0,
                            state: "WI",
                            createdAt: new Date().toISOString(),
                        },
                    ],
                    expenses: [{ id: "rent", name: "Rent", amount: 0 }],
                },
            },
            selectedSourceId: "primary",
            showIncomeInputs: true, // Controls visibility of income input fields
            showExpenseInputs: true, // Controls visibility of income input fields
            setShowIncomeInputs: (value) =>
                set(() => ({ showIncomeInputs: value })),
            setShowExpenseInputs: (value) =>
                set(() => ({ showExpenseInputs: value })),
            expenses: [{ id: "rent", name: "Rent", amount: 0 }],
            savingsMode: "none", // 'none' | '10' | '20' | 'custom'
            customSavings: 0,
            currentScenario: "Main",
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
                return incomeSources.reduce((sum, source) => {
                    if (source.type === "hourly") {
                        const baseHours = Math.min(
                            source.hoursPerWeek || 0,
                            40
                        );
                        const overtime = Math.max(
                            (source.hoursPerWeek || 0) - 40,
                            0
                        );
                        return (
                            sum +
                            ((source.hourlyRate || 0) * baseHours +
                                (source.hourlyRate || 0) * 1.5 * overtime) *
                                52
                        );
                    } else {
                        return sum + (source.grossSalary || 0);
                    }
                }, 0);
            },
            getTotalNetIncome: () => {
                const { incomeSources } = useBudgetStore.getState();
                const totalGross = incomeSources.reduce((sum, source) => {
                    if (source.type === "hourly") {
                        const base = Math.min(source.hoursPerWeek || 0, 40);
                        const ot = Math.max((source.hoursPerWeek || 0) - 40, 0);
                        return (
                            sum +
                            ((source.hourlyRate || 0) * base +
                                (source.hourlyRate || 0) * 1.5 * ot) *
                                52
                        );
                    } else {
                        return sum + (source.grossSalary || 0);
                    }
                }, 0);

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
                    const updated = state.incomeSources.filter(
                        (s) => s.id !== id
                    );
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
            reset: () =>
                set({
                    incomeSources: [
                        {
                            id: "primary",
                            label: "Primary Job",
                            type: "hourly",
                            hourlyRate: 25,
                            hoursPerWeek: 40,
                            grossSalary: 0,
                            state: "WI",
                            createdAt: new Date().toISOString(),
                        },
                    ],
                    selectedSourceId: "primary",
                    expenses: [{ id: "rent", name: "Rent", amount: 0 }],
                    savingsMode: "none",
                    customSavings: 0,
                    // TODO: reset scenarios to default?
                }),
            setScenario: (name) => set({ currentScenario: name }),
            saveScenario: (name) =>
                set((state) => ({
                    scenarios: {
                        ...state.scenarios,
                        [name]: {
                            name,
                            incomeSources: JSON.parse(
                                JSON.stringify(state.incomeSources)
                            ),
                            expenses: JSON.parse(
                                JSON.stringify(state.expenses)
                            ),
                            savingsMode: state.savingsMode,
                            customSavings: state.customSavings,
                            showIncomeInputs: true,
                        },
                    },
                    currentScenario: name,
                })),
            loadScenario: (name) =>
                set((state) => {
                    const scenario = state.scenarios[name];
                    return scenario
                        ? {
                              incomeSources: JSON.parse(
                                  JSON.stringify(scenario.incomeSources)
                              ),
                              expenses: JSON.parse(
                                  JSON.stringify(scenario.expenses)
                              ),
                              savingsMode: scenario.savingsMode || "none",
                              customSavings: scenario.customSavings || 0,
                              currentScenario: name,
                              // TODO: add following to reset input opening on scenario change
                              showIncomeInputs: false, // 👈 Optional reset
                          }
                        : {};
                }),
            deleteScenario: (name) =>
                set((state) => {
                    const updated = { ...state.scenarios };
                    delete updated[name];

                    const isCurrent = state.currentScenario === name;
                    const fallback = Object.keys(updated)[0] || "Main";

                    return {
                        scenarios: updated,
                        ...(isCurrent && updated[fallback]
                            ? {
                                  currentScenario: fallback,
                                  incomeSources: JSON.parse(
                                      JSON.stringify(
                                          updated[fallback].incomeSources
                                      )
                                  ),
                                  expenses: JSON.parse(
                                      JSON.stringify(updated[fallback].expenses)
                                  ),
                                  savingsMode:
                                      updated[fallback].savingsMode || "none",
                                  customSavings:
                                      updated[fallback].customSavings || 0,
                              }
                            : {}),
                    };
                }),
        }),

        {
            name: "budget-app-storage", // key in localStorage
        }
    )
);
