import type { Metadata } from 'next'
import { TradepostPage } from '@/components/tradepost-page'

export const metadata: Metadata = {
  title: 'Tradepost | FNH Value',
  description: 'Build a tradepost offer with the same item selector as the calculator.',
  alternates: {
    canonical: '/tradepost',
  },
}

export default function TradepostRoutePage() {
  return <TradepostPage />
}
