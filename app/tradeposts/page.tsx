import type { Metadata } from 'next'
import { TradepostBoard } from '@/components/tradepost-board'

export const metadata: Metadata = {
  title: 'Tradepost Board | FNH Value',
  description: 'Browse the community tradepost board.',
  alternates: {
    canonical: '/tradeposts',
  },
}

export default function TradepostsRoutePage() {
  return <TradepostBoard />
}
