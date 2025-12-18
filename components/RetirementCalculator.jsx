'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  DollarSign,
  Calendar,
  Percent,
  Target,
  Calculator,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function RetirementCalculator() {
  const [showResults, setShowResults] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: 100000,
    monthlyContribution: 2000,
    expectedReturn: 12,
    inflationRate: 6,
    monthlyExpenseToday: 50000,
    expenseInflation: 7,
  });

  const [advanced, setAdvanced] = useState({
    preRetirementReturn: 12,
    postRetirementReturn: 8,
    emergencyYears: 2,
    lifestyleChange: 0.8,
    medicalInflation: 10,
    medicalExpenses: 10000,
  });

  const handleInputChange = (field, value) =>
    setInputs((p) => ({ ...p, [field]: Number(value) }));

  const handleAdvancedChange = (field, value) =>
    setAdvanced((p) => ({ ...p, [field]: Number(value) }));

  /* ===== LOGIC (UNCHANGED) ===== */
  const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
  const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;

  const monthlyRate = advanced.preRetirementReturn / 100 / 12;
  const months = yearsToRetirement * 12;

  const fvCurrentSavings =
    inputs.currentSavings * Math.pow(1 + monthlyRate, months);

  const fvContributions =
    inputs.monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalCorpus = fvCurrentSavings + fvContributions;

  const inflatedMonthlyExpense =
    inputs.monthlyExpenseToday *
    Math.pow(1 + inputs.expenseInflation / 100, yearsToRetirement) *
    advanced.lifestyleChange;

  const inflatedMedicalExpense =
    advanced.medicalExpenses *
    Math.pow(1 + advanced.medicalInflation / 100, yearsToRetirement);

  const totalMonthlyExpense =
    inflatedMonthlyExpense + inflatedMedicalExpense / 12;

  const annualExpense = totalMonthlyExpense * 12;

  const realReturn =
    (1 + advanced.postRetirementReturn / 100) /
      (1 + inputs.inflationRate / 100) -
    1;

  const requiredCorpus =
    annualExpense *
    ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);

  const gap = requiredCorpus - totalCorpus;

  const chartData = [];
  let runningCorpus = inputs.currentSavings;

  for (let age = inputs.currentAge; age <= inputs.lifeExpectancy; age++) {
    if (age < inputs.retirementAge) {
      runningCorpus =
        (runningCorpus + inputs.monthlyContribution * 12) *
        (1 + advanced.preRetirementReturn / 100);
    } else {
      runningCorpus =
        runningCorpus * (1 + advanced.postRetirementReturn / 100) -
        annualExpense;
    }

    chartData.push({
      age,
      corpus: Math.max(0, Math.round(runningCorpus)),
    });
  }

  const status =
    gap <= 0
      ? { label: 'On Track', color: 'emerald', icon: CheckCircle }
      : gap < totalCorpus * 0.2
      ? { label: 'Almost There', color: 'amber', icon: AlertTriangle }
      : { label: 'Action Needed', color: 'rose', icon: XCircle };

  const StatusIcon = status.icon;

  /* ===== UI ===== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-800">
            Retirement Planner
          </h1>
          <p className="text-slate-600 mt-2">
            Plan confidently with realistic projections
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 transition hover:shadow-xl">
              <h2 className="font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Basic Details
              </h2>

              {Object.entries(inputs).map(([key, val]) => (
                <div key={key}>
                  <label className="text-sm text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      handleInputChange(key, e.target.value)
                    }
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Advanced */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex justify-between items-center"
              >
                <span className="font-semibold">Advanced Settings</span>
                {showAdvanced ? <ChevronUp /> : <ChevronDown />}
              </button>

              {showAdvanced && (
                <div className="px-6 pb-6 space-y-3 animate-fade-in">
                  {Object.entries(advanced).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-sm text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) =>
                          handleAdvancedChange(key, e.target.value)
                        }
                        className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowResults(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg font-semibold transition"
            >
              <Calculator />
              Calculate Retirement
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {showResults && (
              <>
                <div
                  className={`bg-white rounded-2xl shadow-lg p-6 border-l-8 border-${status.color}-500 animate-fade-up`}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`text-${status.color}-500`} />
                    <div>
                      <div className="text-sm text-slate-500">Status</div>
                      <div className="text-xl font-bold">
                        {status.label}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-fade-up">
                  <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-sm text-slate-500">You’ll Have</div>
                    <div className="text-2xl font-bold">
                      ₹{(totalCorpus / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <div className="text-sm text-slate-500">You’ll Need</div>
                    <div className="text-2xl font-bold">
                      ₹{(requiredCorpus / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="corpus"
                        stroke="#2563eb"
                        fill="#93c5fd"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
