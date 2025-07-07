import { create } from "zustand";
import { persist } from "zustand/middleware";

// Format: { name: string, amount: number }
const defaultExpenses = [{ id: "rent", name: "Rent", amount: 0 }];

// TODO: Allow users to change overtime threshold and tax rates

export const useBudgetStore = create(
    persist(
        (set) => ({
            incomeSources: [
                {
                    id: "main",
                    label: "Main Job",
                    type: "hourly",
                    hourlyRate: 25,
                    hoursPerWeek: 40,
                    grossSalary: 0,
                    state: "WI",
                },
            ],
            selectedSourceId: "main",
            expenses: defaultExpenses,
            scenario: "Main",
            getTotalGrossIncome: () => {
                const { incomeSources } = useBudgetStore.getState();

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
            addIncomeSource: (source) =>
                set((state) => ({
                    incomeSources: [
                        ...state.incomeSources,
                        {
                            ...source,
                            id: source.id || crypto.randomUUID(), // ✅ Only generate if one wasn't provided
                        },
                    ],
                })),
            updateIncomeSource: (id, updates) =>
                set((state) => ({
                    incomeSources: state.incomeSources.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                })),
            removeIncomeSource: (id) =>
                set((state) => ({
                    incomeSources: state.incomeSources.filter(
                        (s) => s.id !== id
                    ),
                    selectedSourceId:
                        state.selectedSourceId === id
                            ? null
                            : state.selectedSourceId,
                })),
            selectIncomeSource: (id) => set(() => ({ selectedSourceId: id })),
            addExpense: (expense) =>
                set((state) => ({
                    expenses: [
                        ...state.expenses,
                        {
                            ...expense,
                            id: expense.id || crypto.randomUUID(), // ✅ use provided ID if given
                        },
                    ],
                })),
            updateExpense: (id, newData) =>
                set((state) => ({
                    expenses: state.expenses.map((e) =>
                        e.id === id ? { ...e, ...newData } : e
                    ),
                })),
            removeExpense: (id) =>
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                })),
            reset: () => set({ income: {}, expenses: defaultExpenses }),

            // future: scenarios[]
        }),

        {
            name: "budget-app-storage", // key in localStorage
        }
    )
);
