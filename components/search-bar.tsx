"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, X } from "lucide-react"
import { SortOption } from "@/lib/types"

interface FilterState {
  sortBy: SortOption
  minValue: string
  maxValue: string
  dateFrom: string
  dateTo: string
}

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function SearchBar({ value, onChange, filters, onFiltersChange }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = 
    filters.sortBy !== "default" ||
    filters.minValue !== "" ||
    filters.maxValue !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""

  const clearFilters = () => {
    onFiltersChange({
      sortBy: "default",
      minValue: "",
      maxValue: "",
      dateFrom: "",
      dateTo: ""
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search items..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-secondary border border-border pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border border-border flex items-center gap-2 transition-colors ${
            hasActiveFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-muted"
          }`}
        >
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-2 p-4 bg-secondary border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sort by */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as SortOption })}
                className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="default">Default</option>
                <option value="value-low">Value: Low to High</option>
                <option value="value-high">Value: High to Low</option>
                <option value="date-new">Newest First</option>
                <option value="date-old">Oldest First</option>
              </select>
            </div>

            {/* Value range */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Value Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minValue}
                  onChange={(e) => onFiltersChange({ ...filters, minValue: e.target.value })}
                  className="w-1/2 bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxValue}
                  onChange={(e) => onFiltersChange({ ...filters, maxValue: e.target.value })}
                  className="w-1/2 bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="w-1/2 bg-card border border-border px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="w-1/2 bg-card border border-border px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
