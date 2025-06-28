import { create } from "zustand";
import { persist } from "zustand/middleware";

// Format: { name: string, amount: number }
const defaultExpenses = [{ id: "rent", name: "Rent", amount: 0 }];

// TODO: Allow users to change overtime threshold and tax rates

export const useBudgetStore = create(
    persist(
        (set) => ({
            income: {
                type: "hourly", // 'hourly' | 'salary'
                hourlyRate: 0,
                hoursPerWeek: 40,
                overtimeThreshold: 40, // Hours per week before overtime kicks in
                weeklyChecks: [],
                grossSalary: 0,
                taxRate: 0.15,
                state: "WI", // Default state for tax estimate
                estimatedTax: 0, // Calculated based on gross salary and tax rate
                netIncome: 0, // Calculated based on gross salary and estimated tax
                netWeeklyIncome: 0, // Calculated based on net income and weeks in a year
                weeksInYear: 52, // Default value, can be adjusted
            },
            expenses: defaultExpenses,
            scenario: "Main",

            setIncome: (data) =>
                set((state) => ({ income: { ...state.income, ...data } })),
            addExpense: (expense) =>
                set((state) => ({
                    expenses: [
                        ...state.expenses,
                        { ...expense, id: crypto.randomUUID() },
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
