import type { Metadata } from 'next'
import { ValueSite } from '@/components/value-site'

export const metadata: Metadata = {
  title: 'FNH and Five Nights: Hunted Values',
  description:
    'Browse FNH and Five Nights: Hunted item values by tier, search by name, and calculate trade estimates with a simple calculator.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FNH and Five Nights: Hunted Values',
    description:
      'Browse FNH and Five Nights: Hunted item values by tier, search by name, and calculate trade estimates with a simple calculator.',
    url: 'https://fnhvalue.com/',
    type: 'website',
  },
  twitter: {
    title: 'FNH and Five Nights: Hunted Values',
    description:
      'Browse FNH and Five Nights: Hunted item values by tier, search by name, and calculate trade estimates with a simple calculator.',
  },
}

export default function Page() {
  return <ValueSite />
}
