"use client"

import { useEffect, useMemo, useState } from "react"
import Script from "next/script"
import { Item, SortOption, Tier } from "@/lib/types"
import { VALUES as SITE_ITEMS } from "@/lib/values"
import { Calculator } from "./calculator"
import { SearchBar } from "./search-bar"
import { TierTabs } from "./tier-tabs"
import { ValueCard } from "./value-card"
import { Calculator as CalcIcon } from "lucide-react"

interface FilterState {
  sortBy: SortOption
  minValue: string
  maxValue: string
  dateFrom: string
  dateTo: string
}

interface DiscordUser {
  id: string
  username: string
  avatar: string | null
}

export function ValueSite() {
  const [items] = useState<Item[]>(SITE_ITEMS)
  const [activeTier, setActiveTier] = useState<Tier | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCalculator, setShowCalculator] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "value-high",
    minValue: "",
    maxValue: "",
    dateFrom: "",
    dateTo: "",
  })
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const DISCORD_AUTH_URL =
    "https://discord.com/oauth2/authorize?client_id=1530289183715889204&response_type=code&redirect_uri=https%3A%2F%2Ffnhvalues-26uevlisb-fnh-demons.vercel.app%2Fdiscord&scope=identify"

  useEffect(() => {
    const storedUser = window.localStorage.getItem("discordUser")
    if (storedUser) {
      try {
        setDiscordUser(JSON.parse(storedUser))
      } catch {
        window.localStorage.removeItem("discordUser")
      }
    }
  }, [])

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesTier = activeTier === "all" || item.tier === activeTier
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())

      const minVal = filters.minValue ? parseInt(filters.minValue) : null
      const maxVal = filters.maxValue ? parseInt(filters.maxValue) : null
      const matchesMinValue = minVal === null || item.value >= minVal
      const matchesMaxValue = maxVal === null || item.value <= maxVal

      const itemDate = item.releaseDate ? new Date(item.releaseDate) : null
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null
      const matchesFromDate = !fromDate || !itemDate || itemDate >= fromDate
      const matchesToDate = !toDate || !itemDate || itemDate <= toDate

      return matchesTier && matchesSearch && matchesMinValue && matchesMaxValue && matchesFromDate && matchesToDate
    })

    switch (filters.sortBy) {
      case "value-low":
        result = [...result].sort((a, b) => a.value - b.value)
        break
      case "default":
      case "value-high":
        result = [...result].sort((a, b) => b.value - a.value)
        break
      case "date-new":
        result = [...result].sort((a, b) => {
          if (!a.releaseDate) return 1
          if (!b.releaseDate) return -1
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        })
        break
      case "date-old":
        result = [...result].sort((a, b) => {
          if (!a.releaseDate) return 1
          if (!b.releaseDate) return -1
          return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
        })
        break
    }

    return result
  }, [items, activeTier, searchQuery, filters])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Script
        id="fnh-value-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'FNH Value',
            url: 'https://fnhvalue.com',
            description:
              'Browse FNH and Five Nights: Hunted item values by tier, search for specific drops, and estimate trade worth with a built-in calculator.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://fnhvalue.com/?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              window.location.href = DISCORD_AUTH_URL
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors font-medium rounded-md"
          >
            {discordUser?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`}
                alt="Discord avatar"
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <img
                src="/discord-icon-svgrepo-com.svg"
                alt="Discord icon"
                className="h-5 w-5"
              />
            )}
            <span>{discordUser ? discordUser.username : "Sign in"}</span>
          </button>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Values n shi 😎</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
           ou shiiii👀👀👀
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-white">
            <div className="inline-flex items-center gap-2">
              <span className="font-bold decoration-white/40 underline-offset-4">Developer:</span>
              <span className="text-white/80 underline">A cool guy</span>
            </div>

            <div className="inline-flex items-center gap-2">
              <span className="font-bold decoration-white/40 underline-offset-4">Value Helpers:</span>
              <span className="text-white/80 underline">Reaper2ww1 · Kurtc84 · waferthingaming__</span>
            </div>
          </div>
        </header>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 transition-colors font-medium rounded-md"
          >
            <CalcIcon size={20} />
            Trade Calculator
          </button>
        </div>

        <div className="mb-6">
          <TierTabs activeTier={activeTier} onTierChange={setActiveTier} />
        </div>

        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} items
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <ValueCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your criteria
          </div>
        )}
      </div>

      {showCalculator && (
        <Calculator items={items} onClose={() => setShowCalculator(false)} />
      )}
    </div>
  )
}
