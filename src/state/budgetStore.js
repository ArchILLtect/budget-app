import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateTotalTaxes } from "../utils/taxUtils";

// TODO: Allow users to change overtime threshold and tax rates

export const useBudgetStore = create(
    persist(
        (set) => ({
            incomeSources: [
                {
                    id: "primary",
                    label: "Primary Job",
                    type: "hourly",
                    hourlyRate: 25,
                    hoursPerWeek: 40,
                    grossSalary: 0,
                    state: "WI",
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
                        },
                    ],
                    selectedSourceId: "primary",
                    expenses: [{ id: "rent", name: "Rent", amount: 0 }],
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
        }),

        {
            name: "budget-app-storage", // key in localStorage
        }
    )
);
