'use client';

import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Percent, Target, Calculator, ChevronRight, Info, ShieldCheck } from 'lucide-react';

export default function RetirementCalculator() {
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

  const [showResults, setShowResults] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [calculations, setCalculations] = useState(null);

  // Helper to format currency in Cr/L for the chart and insights
  const formatValue = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleAdvancedChange = (field, value) => {
    setAdvanced(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateRetirement = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
    
    let corpus = inputs.currentSavings;
    const monthlyRate = advanced.preRetirementReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    const fvCurrentSavings = corpus * Math.pow(1 + monthlyRate, months);
    const fvContributions = inputs.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const totalCorpus = fvCurrentSavings + fvContributions;
    
    const inflatedMonthlyExpense = inputs.monthlyExpenseToday * Math.pow(1 + inputs.expenseInflation / 100, yearsToRetirement) * advanced.lifestyleChange;
    const inflatedMedicalExpense = advanced.medicalExpenses * Math.pow(1 + advanced.medicalInflation / 100, yearsToRetirement);
    
    const totalMonthlyExpense = inflatedMonthlyExpense + inflatedMedicalExpense / 12;
    const annualExpense = totalMonthlyExpense * 12;
    
    const realReturn = ((1 + advanced.postRetirementReturn / 100) / (1 + inputs.inflationRate / 100)) - 1;
    const requiredCorpus = annualExpense * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
    
    const emergencyFund = annualExpense * advanced.emergencyYears;
    const totalRequired = requiredCorpus + emergencyFund;
    
    const chartData = [];
    let currentCorpus = inputs.currentSavings;
    
    for (let year = 0; year <= inputs.lifeExpectancy - inputs.currentAge; year++) {
      const age = inputs.currentAge + year;
      
      if (age < inputs.retirementAge) {
        const yearlyContribution = inputs.monthlyContribution * 12;
        currentCorpus = (currentCorpus + yearlyContribution) * (1 + advanced.preRetirementReturn / 100);
        chartData.push({ age, corpus: Math.round(currentCorpus) });
      } else {
        const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, age - inputs.retirementAge);
        currentCorpus = currentCorpus * (1 + advanced.postRetirementReturn / 100) - yearExpense;
        chartData.push({ age, corpus: Math.round(Math.max(0, currentCorpus)) });
      }
    }
    
    const runSimulation = () => {
      let successCount = 0;
      const simulations = 1000;
      for (let sim = 0; sim < simulations; sim++) {
        let simCorpus = totalCorpus;
        for (let year = 0; year < yearsInRetirement; year++) {
          const randomReturn = (Math.random() - 0.5) * 10 + advanced.postRetirementReturn;
          const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, year);
          simCorpus = simCorpus * (1 + randomReturn / 100) - yearExpense;
          if (simCorpus < 0) break;
        }
        if (simCorpus > 0) successCount++;
      }
      return (successCount / simulations * 100).toFixed(1);
    };

    setCalculations({
      totalCorpus: Math.round(totalCorpus),
      requiredCorpus: Math.round(totalRequired),
      gap: Math.round(totalRequired - totalCorpus),
      monthlyExpenseAtRetirement: Math.round(totalMonthlyExpense),
      chartData,
      successRate: runSimulation(),
      yearsToRetirement,
      emergencyFund: Math.round(emergencyFund),
    });

    setShowResults(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  const getStatusColor = () => {
    if (!calculations) return 'text-slate-600';
    if (calculations.gap <= 0) return 'text-emerald-500';
    return 'text-rose-500';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {showPopup && calculations && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <div className="animate-in zoom-in-95 duration-300 pointer-events-auto bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm text-center border-4 border-slate-100">
            {calculations.gap <= 0 ? (
              <>
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">Congratulations!</h2>
                <p className="text-slate-600">On track for retirement!</p>
              </>
            ) : (
              <>
                <div className="text-7xl mb-4 animate-bounce">😟</div>
                <h2 className="text-2xl font-black text-amber-600 mb-2">Action Required!</h2>
                <p className="text-slate-600">Shortfall detected.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">Retirement <span className="text-blue-600">Planner</span></h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-[2rem] shadow-sm border p-8 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Target className="text-blue-600" /> Basic Details</h2>
              {['currentAge', 'retirementAge', 'lifeExpectancy', 'currentSavings', 'monthlyContribution', 'monthlyExpenseToday', 'inflationRate', 'expenseInflation'].map(key => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 ml-1">{key}</label>
                  <input type="number" value={inputs[key]} onChange={(e) => handleInputChange(key, e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100" />
                </div>
              ))}
            </section>

            <section className="bg-white rounded-[2rem] shadow-sm border p-8 space-y-5">
              <h2 className="text-xl font-bold flex items-center gap-2"><Percent className="text-slate-900" /> Advanced</h2>
              {['preRetirementReturn', 'postRetirementReturn', 'medicalExpenses', 'medicalInflation', 'emergencyYears'].map(key => (
                <div key={key}>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 ml-1">{key}</label>
                  <input type="number" value={advanced[key]} onChange={(e) => handleAdvancedChange(key, e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100" />
                </div>
              ))}
            </section>

            <button onClick={calculateRetirement} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"><Calculator size={24} /> Calculate</button>
          </div>

          <div id="results-section" className="lg:col-span-8 space-y-6">
            {showResults && calculations ? (
              <>
                <div className="bg-white rounded-[2.5rem] shadow-sm border p-8 grid md:grid-cols-3 gap-8">
                   <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Target Corpus</p><p className="text-3xl font-black">{formatValue(calculations.requiredCorpus)}</p></div>
                   <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p><p className={`text-3xl font-black ${getStatusColor()}`}>{calculations.gap <= 0 ? 'Optimal' : 'Shortfall'}</p></div>
                   <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Success Rate</p><p className="text-3xl font-black text-blue-600">{calculations.successRate}%</p></div>
                </div>

                {/* --- FIXED CHART SECTION --- */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border p-8">
                  <h2 className="text-xl font-bold mb-10 flex items-center gap-2"><TrendingUp className="text-blue-500" /> Wealth Projection</h2>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculations.chartData}>
                        <defs>
                          <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="age" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                          dy={10} 
                        />
                        <YAxis 
                          tickFormatter={(v) => formatValue(v)} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                        />
                        <Tooltip 
                          formatter={(v) => [formatValue(v), "Corpus"]} 
                          labelFormatter={(l) => `Age: ${l}`} 
                          contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}} 
                        />
                        <Area type="monotone" dataKey="corpus" stroke="#3b82f6" strokeWidth={4} fill="url(#colorCorpus)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* --- END CHART SECTION --- */}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Monthly Cost at Retirement</p>
                    <p className="text-3xl font-black text-blue-900">₹{(calculations.monthlyExpenseAtRetirement / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                    <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Emergency Fund</p>
                    <p className="text-3xl font-black text-emerald-900">₹{(calculations.emergencyFund / 100000).toFixed(1)}L</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full bg-white/50 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-white flex flex-col items-center justify-center text-center p-12">
                <h2 className="text-3xl font-black text-slate-800 mb-3">Ready to Plan?</h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
