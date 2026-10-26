import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PricingPlan } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export function PricingPage() {
  const { navigate } = useRouter();
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Checkout modal
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    api.getPricingPlans()
      .then(res => setPlans(res.plans))
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user) {
      setNameOnCard(user.name);
    }
  }, [user]);

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }
    if (plan.price === 0) {
      navigate('/courses');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setProcessing(true);

    try {
      await api.checkout({
        type: 'plan_subscription',
        plan: selectedPlan.billingCycle as 'monthly' | 'yearly',
        cardNumber,
      });

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });

      await refreshUser();
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setSelectedPlan(null);
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Membership
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Invest in Effortless Fluency
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Gain unlimited access to 8 languages, weekly live Zoom classes, and verified CEFR certificates. Cancel anytime with a single click.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                billingCycle === 'monthly'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20 items-stretch">
          {plans.map(plan => {
            const isUserActivePlan = user?.plan === plan.billingCycle && user?.planStatus === 'active';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 border flex flex-col justify-between transition relative ${
                  plan.highlighted
                    ? 'border-violet-600 shadow-xl shadow-violet-100 ring-2 ring-violet-600/20'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 right-6 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-xs text-slate-500">
                      {plan.billingCycle === 'yearly' ? '/ year' : plan.billingCycle === 'monthly' ? '/ month' : ''}
                    </span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs text-slate-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isUserActivePlan}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isUserActivePlan
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : plan.highlighted
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isUserActivePlan ? 'Current Active Plan' : plan.buttonText}
                    {!isUserActivePlan && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-5xl mx-auto mb-16">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Detailed Plan Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-slate-500 font-semibold">Features</th>
                  <th className="pb-3 text-slate-900 font-bold">Starter Free</th>
                  <th className="pb-3 text-violet-700 font-bold">Pro Monthly</th>
                  <th className="pb-3 text-indigo-700 font-bold">Pro Annual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 text-slate-700">All 8 Languages Curriculum</td>
                  <td className="py-3 text-slate-400">Previews Only</td>
                  <td className="py-3 text-emerald-600 font-bold">Full Access</td>
                  <td className="py-3 text-emerald-600 font-bold">Full Access</td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">Weekly Live Zoom Speaking Labs</td>
                  <td className="py-3 text-slate-400">✕</td>
                  <td className="py-3 text-emerald-600 font-bold">Unlimited</td>
                  <td className="py-3 text-emerald-600 font-bold">Unlimited + Priority</td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">Verified CEFR Certificates</td>
                  <td className="py-3 text-slate-400">✕</td>
                  <td className="py-3 text-emerald-600 font-bold">Included</td>
                  <td className="py-3 text-emerald-600 font-bold">Included</td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">Native Audio Pronunciation Drill</td>
                  <td className="py-3 text-slate-500">Basic</td>
                  <td className="py-3 text-emerald-600 font-bold">Advanced</td>
                  <td className="py-3 text-emerald-600 font-bold">Advanced</td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">Downloadable Offline Study Guides</td>
                  <td className="py-3 text-slate-400">✕</td>
                  <td className="py-3 text-emerald-600 font-bold">Included</td>
                  <td className="py-3 text-emerald-600 font-bold">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Checkout Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Confirm Subscription</h3>
                  <p className="text-xs text-slate-500">Upgrade to {selectedPlan.name}</p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {checkoutSuccess ? (
                <div className="py-8 text-center text-emerald-600 space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <h4 className="font-bold text-lg text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-500">Redirecting to your student dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{selectedPlan.name}</p>
                      <p className="text-slate-500 text-[11px]">Billed {selectedPlan.billingCycle}</p>
                    </div>
                    <p className="text-lg font-extrabold text-slate-900">${selectedPlan.price}</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      required
                      value={nameOnCard}
                      onChange={e => setNameOnCard(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Expires</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CVC</label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>256-bit encrypted checkout. Money-back guarantee.</span>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md transition text-xs"
                    >
                      {processing ? 'Processing Payment...' : `Confirm & Pay $${selectedPlan.price}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
