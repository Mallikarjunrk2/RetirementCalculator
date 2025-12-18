import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Retirement Calculator for India
        </h1>

        <p className="mt-5 text-lg text-slate-700 max-w-3xl mx-auto">
          Use this free retirement calculator to estimate how much money you will
          need after retirement, how your savings grow before retirement, and how
          long your retirement corpus may last considering inflation, expenses,
          and realistic returns.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/retirement-calculator"
            className="px-10 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Start Retirement Planning →
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Free • No login required • Built for Indian investors
        </p>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-8">
        <Feature
          title="Inflation-adjusted retirement planning"
          desc="This retirement calculator considers inflation, lifestyle changes, and rising medical costs to give a more realistic retirement estimate."
        />
        <Feature
          title="Pre and post retirement projections"
          desc="Visualize how your retirement corpus grows before retirement and how it gets utilized after retirement."
        />
        <Feature
          title="No product pushing"
          desc="This is a calculation and planning tool, not an investment recommendation or sales platform."
        />
      </section>

      {/* LONG SEO CONTENT */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-6 text-slate-700 leading-relaxed">
          <h2 className="text-3xl font-semibold text-slate-900">
            Retirement Planning Calculator – Understand Your Future Financial Needs
          </h2>

          <p>
            Retirement planning is one of the most important financial decisions
            you will make in your life. A retirement calculator helps you estimate
            the amount of money you may need after retirement based on your current
            age, retirement age, life expectancy, monthly expenses, inflation rate,
            expected returns, and medical costs.
          </p>

          <p>
            Many people underestimate how inflation affects their retirement
            expenses. What costs ₹50,000 per month today may cost significantly
            more after 20 or 30 years. This retirement planning calculator for
            India adjusts your future expenses using realistic inflation
            assumptions so you can plan with clarity instead of guesswork.
          </p>

          <p>
            This calculator is useful for salaried individuals, self-employed
            professionals, and business owners who want to understand whether
            their current savings and monthly investments are sufficient to
            support their retirement lifestyle. It shows whether you are on
            track, almost there, or need to take corrective action.
          </p>

          <p>
            Unlike basic retirement calculators, this tool also considers
            post-retirement returns and corpus depletion. This helps you
            understand how long your retirement savings may last and whether you
            need to increase investments, reduce expenses, or delay retirement.
          </p>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-semibold text-slate-900 text-center">
          Frequently Asked Questions
        </h2>

        <div className="mt-12 space-y-8 max-w-4xl mx-auto">
          <FAQ
            q="What is a retirement calculator?"
            a="A retirement calculator is a financial planning tool that helps you estimate how much money you may need after retirement based on your expenses, savings, inflation, and expected investment returns."
          />
          <FAQ
            q="How accurate is this retirement calculator?"
            a="This calculator provides estimates based on assumptions such as inflation rate, returns, and expenses. Actual results may vary, but it offers a realistic framework for retirement planning."
          />
          <FAQ
            q="Does this retirement calculator consider inflation?"
            a="Yes. The calculator adjusts future expenses for inflation, including lifestyle inflation and medical inflation, to give a more accurate retirement estimate."
          />
          <FAQ
            q="Is this retirement calculator suitable for Indian investors?"
            a="Yes. This retirement calculator is designed keeping Indian expenses, inflation patterns, and retirement realities in mind."
          />
          <FAQ
            q="Does this tool recommend mutual funds or investments?"
            a="No. This tool does not recommend or sell any financial products. It is purely for retirement planning and awareness."
          />
          <FAQ
            q="Can I rely only on this calculator for retirement planning?"
            a="This calculator is a starting point. For personalized advice, it is recommended to consult a certified financial planner."
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-slate-100 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to calculate your retirement corpus?
        </h2>
        <p className="mt-4 text-slate-600">
          Understand where you stand and what changes you may need to make.
        </p>

        <div className="mt-8">
          <Link
            href="/retirement-calculator"
            className="px-10 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Open Retirement Calculator →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        This retirement calculator provides estimates only. Actual financial
        outcomes may vary. Please consult a professional for personalized advice.
      </footer>
    </main>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600 text-sm">{desc}</p>
    </div>
  );
}

function FAQ({ q, a }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold text-slate-900">{q}</h3>
      <p className="mt-2 text-slate-600 text-sm">{a}</p>
    </div>
  );
}
