import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { subscriptionApi, paymentApi } from '../api/services'
import { useTheme } from '../context/ThemeContext'

function loadRazorpay(): Promise<boolean> {
  return new Promise(resolve => {
    if ((window as any).Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const hasFeature = (plan: string, feature: string) => {
  if (plan === 'ANNUAL') return true
  if (plan === 'PREMIUM') return feature !== 'Save 30%'
  return ['Community forum', 'Basic notes access', 'Limited free courses'].includes(feature)
}

const allFeatures = ['Community forum', 'Basic notes access', 'Limited free courses', 'All premium courses', 'Mock tests & practice', 'Live classes', 'Priority support', 'Year-long access', 'Save 30%', 'Exclusive webinars']

export default function PricingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const [paying, setPaying] = useState<string | null>(null)

  const { data: plans = [] } = useQuery('subscription-plans', subscriptionApi.getPlans, { select: (res: any) => res.data })
  const { data: currentSubscription } = useQuery('my-subscription', subscriptionApi.getMySubscription, {
    enabled: isAuthenticated, retry: false, select: (res: any) => res.data
  })

  const displayPlans = useMemo(() => ['FREE', 'PREMIUM', 'ANNUAL'].map(plan => {
    const apiPlan = (plans as any[]).find((item: any) => item.plan === plan)
    return { ...apiPlan, plan, price: plan === 'PREMIUM' ? 299 : plan === 'ANNUAL' ? 2499 : 0 }
  }), [plans])

  const handleSubscribe = async (plan: string) => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (plan === 'FREE') { navigate('/dashboard'); return }
    setPaying(plan)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway. Please try again.'); setPaying(null); return }

      const { data } = await paymentApi.createOrder(plan)
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Tassy Point',
        description: `${plan} Subscription`,
        order_id: data.orderId,
        prefill: {
          name: user ? `${(user as any).firstName} ${(user as any).lastName}` : '',
          email: (user as any)?.email || '',
        },
        theme: { color: '#194552' },
        handler: async (response: any) => {
          try {
            await paymentApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              plan,
            })
            alert(`Payment successful! Your ${plan} plan is now active.`)
            window.location.reload()
          } catch {
            alert('Payment verification failed. Please contact support.')
          }
        },
        modal: { ondismiss: () => setPaying(null) },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', (resp: any) => {
        alert(`Payment failed: ${resp.error.description}`)
        setPaying(null)
      })
      rzp.open()
    } catch {
      alert('Could not initiate payment. Please try again.')
      setPaying(null)
    }
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: text, marginBottom: '8px' }}>Choose your plan</h1>
          <p style={{ color: muted, maxWidth: '600px', margin: '0 auto 16px' }}>Unlock premium courses, practice tools, and year-round savings.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {['🟢 GPay', '📱 PhonePe', '💛 Paytm', '🔵 BHIM UPI', '💳 Cards'].map(m => (
              <span key={m} style={{ fontSize: '12px', backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '999px', padding: '4px 12px', color: muted }}>{m}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {displayPlans.map((plan: any) => {
            const isPopular = plan.plan === 'PREMIUM'
            const isCurrent = (currentSubscription as any)?.plan === plan.plan && (currentSubscription as any)?.status === 'ACTIVE'
            const isLoading = paying === plan.plan
            return (
              <div key={plan.plan} style={{ position: 'relative', backgroundColor: cardBg, border: `2px solid ${isPopular ? '#2563eb' : border}`, borderRadius: '24px', padding: '28px', boxShadow: isPopular ? '0 20px 40px rgba(37,99,235,0.12)' : 'none' }}>
                {isPopular && <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}>Most Popular</div>}
                {isCurrent && <div style={{ position: 'absolute', top: isPopular ? '44px' : '16px', right: '16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '999px', padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}>Current Plan</div>}

                <div style={{ fontSize: '14px', fontWeight: 700, color: muted, letterSpacing: '0.05em' }}>{plan.plan}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '10px', color: text }}>
                  <span style={{ fontSize: '36px', fontWeight: 900 }}>{plan.plan === 'FREE' ? '₹0' : `₹${plan.price}`}</span>
                  <span style={{ fontSize: '13px', color: muted }}>{plan.plan === 'FREE' ? '/ forever' : plan.plan === 'ANNUAL' ? '/ year' : '/ month'}</span>
                </div>
                {plan.plan === 'ANNUAL' && <div style={{ color: '#16a34a', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>Save 30% with yearly billing</div>}

                <div style={{ margin: '20px 0', borderTop: `1px solid ${border}` }} />

                <div style={{ display: 'grid', gap: '9px' }}>
                  {allFeatures.map(feature => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, backgroundColor: hasFeature(plan.plan, feature) ? '#dcfce7' : '#fee2e2', color: hasFeature(plan.plan, feature) ? '#16a34a' : '#dc2626' }}>
                        {hasFeature(plan.plan, feature) ? '✓' : '✗'}
                      </span>
                      <span style={{ fontSize: '14px', color: hasFeature(plan.plan, feature) ? text : muted }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.plan)}
                  disabled={isLoading || isCurrent}
                  style={{ width: '100%', marginTop: '24px', backgroundColor: isCurrent ? '#9ca3af' : isPopular ? '#2563eb' : '#194552', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 16px', fontWeight: 700, cursor: isCurrent ? 'default' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s', opacity: isLoading ? 0.8 : 1 }}
                >
                  {isLoading ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Opening Checkout…</>
                  ) : isCurrent ? '✓ Active Plan' : plan.plan === 'FREE' ? 'Get Started Free' : `Pay ₹${plan.price} →`}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: muted }}>
          🔒 Powered by Razorpay · 256-bit SSL · Cancel anytime
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}