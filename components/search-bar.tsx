"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react"
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

// Custom dropdown component
function CustomDropdown({ 
  value, 
  onChange, 
  options 
}: { 
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLabel = options.find(o => o.value === value)?.label || "Select..."

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground flex items-center justify-between hover:bg-muted transition-colors"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                value === option.value ? "bg-muted text-primary" : "text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Custom date picker component
function CustomDatePicker({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value)
    return new Date()
  })
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const handleDateSelect = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const formatted = selected.toISOString().split("T")[0]
    onChange(formatted)
    setIsOpen(false)
  }

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const displayValue = value ? new Date(value).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  }) : ""

  const days = getDaysInMonth(viewDate)
  const selectedDate = value ? new Date(value) : null

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card border border-border px-3 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center justify-between"
      >
        <span className={displayValue ? "text-foreground" : "text-muted-foreground"}>
          {displayValue || placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-card border border-border shadow-lg p-3 min-w-[240px]">
          {/* Month/Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index}>
                {day !== null ? (
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`w-full aspect-square flex items-center justify-center text-xs transition-colors ${
                      selectedDate &&
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === viewDate.getMonth() &&
                      selectedDate.getFullYear() === viewDate.getFullYear()
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="w-full aspect-square" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
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

  const handleMinValueChange = (val: string) => {
    const num = parseInt(val)
    if (val === "" || (num >= 1)) {
      onFiltersChange({ ...filters, minValue: val })
    }
  }

  const handleMaxValueChange = (val: string) => {
    const num = parseInt(val)
    if (val === "" || (num >= 1)) {
      onFiltersChange({ ...filters, maxValue: val })
    }
  }

  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "value-low", label: "Value: Low to High" },
    { value: "value-high", label: "Value: High to Low" },
    { value: "date-new", label: "Newest First" },
    { value: "date-old", label: "Oldest First" },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search input row */}
      <div className="flex flex-col sm:flex-row gap-2">
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
          className={`w-full sm:w-auto px-4 py-3 border border-border flex items-center gap-2 transition-colors ${
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
              <CustomDropdown
                value={filters.sortBy}
                onChange={(val) => onFiltersChange({ ...filters, sortBy: val as SortOption })}
                options={sortOptions}
              />
            </div>

            {/* Value range */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Value Range (min 1)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Min"
                  value={filters.minValue}
                  onChange={(e) => handleMinValueChange(e.target.value)}
                  className="w-1/2 bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Max"
                  value={filters.maxValue}
                  onChange={(e) => handleMaxValueChange(e.target.value)}
                  className="w-1/2 bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Date Range</label>
              <div className="flex gap-2">
                <CustomDatePicker
                  value={filters.dateFrom}
                  onChange={(val) => onFiltersChange({ ...filters, dateFrom: val })}
                  placeholder="From"
                />
                <CustomDatePicker
                  value={filters.dateTo}
                  onChange={(val) => onFiltersChange({ ...filters, dateTo: val })}
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
