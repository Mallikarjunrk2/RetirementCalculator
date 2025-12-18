import Link from "next/link";

export default function HomePage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Retirement Calculator for India
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              Use this free retirement calculator to estimate how much money you
              will need after retirement, how your savings grow before
              retirement, and how long your retirement corpus may last
              considering inflation, expenses, and realistic returns.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/retirement-calculator"
                className="inline-flex items-center justify-center rounded-xl
                bg-gradient-to-r from-blue-600 to-indigo-600
                px-7 py-3 text-base font-semibold text-white
                shadow-md transition-all duration-300
                hover:shadow-xl hover:scale-[1.02]"
              >
                Start Retirement Planning →
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Free • No login required • Built for Indian investors
            </p>
          </div>

          {/* Right visual block */}
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  {
                    title: "Inflation-aware planning",
                    desc: "Accounts for rising costs and realistic expense growth.",
                  },
                  {
                    title: "Pre & post retirement",
                    desc: "See how your corpus grows and gets utilized over time.",
                  },
                  {
                    title: "No product pushing",
                    desc: "Pure planning tool, not investment advice or sales.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white p-5 shadow-sm
                    transition-all duration-300
                    hover:-translate-y-1 hover:shadow-lg"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Retirement Planning Calculator – Understand Your Future Financial
            Needs
          </h2>

          <p className="mt-6 text-gray-700 leading-relaxed">
            Retirement planning is one of the most important financial
            decisions you will make in your life. A retirement calculator
            helps you estimate the amount of money you may need after
            retirement based on your current age, retirement age, life
            expectancy, monthly expenses, inflation rate, and expected
            investment returns.
          </p>

          <p className="mt-4 text-gray-700 leading-relaxed">
            This retirement calculator for India is designed to give realistic
            projections by factoring in inflation, lifestyle adjustments,
            medical costs, and both pre-retirement and post-retirement returns.
            It helps you understand whether your current savings and monthly
            investments are sufficient to maintain your desired lifestyle
            after retirement.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-8">
            {[
              {
                q: "How accurate is this retirement calculator?",
                a: "This calculator provides estimates based on the inputs you provide and commonly accepted financial assumptions. Actual outcomes may vary depending on market performance, lifestyle changes, and unforeseen expenses.",
              },
              {
                q: "Does this calculator provide investment advice?",
                a: "No. This is a planning and estimation tool only. It does not recommend specific investment products or strategies.",
              },
              {
                q: "Can I rely on this calculator for final retirement decisions?",
                a: "The calculator is meant to help you understand your retirement readiness. For personalized advice, you should consult a certified financial planner.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border p-6 transition-all duration-300
                hover:shadow-md hover:border-blue-200"
              >
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white">
            Start planning your retirement with confidence
          </h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Understand your future financial needs clearly and take informed
            decisions today.
          </p>

          <div className="mt-8">
            <Link
              href="/retirement-calculator"
              className="inline-flex items-center justify-center rounded-xl
              bg-white px-8 py-3 text-base font-semibold text-blue-600
              shadow transition-all duration-300
              hover:bg-blue-50 hover:scale-[1.03]"
            >
              Open Retirement Calculator →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
