export interface FormatNumberAdvancedOptions extends Intl.NumberFormatOptions {
  /**
   * Maximum number of fraction digits to use (alias for maximumFractionDigits)
   */
  maxDecimals?: number

  /**
   * Sets exact number of fraction digits (both min and max)
   */
  decimals?: number

  /**
   * Enable compact notation (e.g., 1.2K, 5M)
   */
  abbreviate?: boolean

  /**
   * Control thousands separator (true/false/custom character)
   */
  separator?: string | boolean
}

// Formatter cache to avoid creating new instances repeatedly
const formatterCache = new Map<string, Intl.NumberFormat>()

/**
 * Creates a cache key for the formatter options
 */
function createFormatterKey(options: Intl.NumberFormatOptions): string {
  return JSON.stringify({
    notation:              options.notation,
    compactDisplay:        options.compactDisplay,
    useGrouping:           options.useGrouping,
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
    roundingMode:          options.roundingMode,
  })
}

/**
 * Gets or creates a cached formatter
 */
function getFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = createFormatterKey(options)
  let formatter = formatterCache.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      ...options,
      roundingMode: 'trunc',
    })
    formatterCache.set(key, formatter)
  }

  return formatter
}

/**
 * Safely converts value to number without external dependencies
 */
function safeToNumber(value: any): number | null {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return null

    const parsed = Number(trimmed)
    return isNaN(parsed) ? null : parsed
  }

  if (value && typeof value.toNumber === 'function') {
    try {
      return value.toNumber()
    } catch {
      return null
    }
  }

  if (value && typeof value.toString === 'function') {
    return safeToNumber(value.toString())
  }

  return null
}

/**
 * Count decimal places in a string representation
 */
function countDecimals(str: string): number {
  const match = str.match(/\.(\d+)/)
  return match ? match[1].length : 0
}

/**
 * Formats a number using Intl.NumberFormat with optimized performance
 *
 * @param value Number or string to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export const formatNumberAdvanced = (
  value: string | number | any | null | undefined,
  options: FormatNumberAdvancedOptions = {},
): string => {
  // Early return for null/undefined/empty values
  if (value === null || value === undefined || value === '') {
    return ''
  }

  // Convert to number safely
  const num = safeToNumber(value)
  if (num === null || !isFinite(num)) {
    return String(value)
  }

  // Extract custom options and build Intl options efficiently
  const { maxDecimals, decimals, abbreviate, separator, ...baseOptions } =
    options

  // Handle abbreviation
  if (abbreviate && !baseOptions.notation) {
    baseOptions.notation = 'compact'
    if (!baseOptions.compactDisplay) {
      baseOptions.compactDisplay = 'short'
    }
  }

  // Handle separator
  if (baseOptions.useGrouping === undefined) {
    if (typeof separator === 'boolean') {
      baseOptions.useGrouping = separator
    } else if (typeof separator === 'string') {
      baseOptions.useGrouping = !!separator
    } else {
      baseOptions.useGrouping = true
    }
  }

  // Handle decimal precision
  let minDigits = baseOptions.minimumFractionDigits
  let maxDigits = baseOptions.maximumFractionDigits

  if (typeof decimals === 'number' && decimals >= 0) {
    minDigits = decimals
    maxDigits = decimals
  } else if (typeof maxDecimals === 'number' && maxDecimals >= 0) {
    maxDigits = maxDecimals
    if (minDigits !== undefined && minDigits > maxDigits) {
      minDigits = maxDigits
    }
  } else if (minDigits === undefined && maxDigits === undefined) {
    // Preserve original decimal places for strings
    if (typeof value === 'string') {
      const originalDecimals = countDecimals(value)
      if (originalDecimals > 0) {
        minDigits = originalDecimals
        maxDigits = originalDecimals
      }
    }
  }

  if (minDigits !== undefined) baseOptions.minimumFractionDigits = minDigits
  if (maxDigits !== undefined) baseOptions.maximumFractionDigits = maxDigits

  // Special handling for compact notation
  if (baseOptions.notation === 'compact') {
    const compactDigits = maxDigits ?? minDigits ?? (abbreviate ? 2 : undefined)
    if (compactDigits !== undefined) {
      baseOptions.maximumFractionDigits = compactDigits
      if (typeof decimals !== 'number') {
        delete baseOptions.minimumFractionDigits
      } else {
        baseOptions.minimumFractionDigits = Math.min(
          baseOptions.minimumFractionDigits ?? compactDigits,
          compactDigits,
        )
      }
    }
  }

  try {
    const formatter = getFormatter(baseOptions)
    return formatter.format(num)
  } catch (error) {
    // Fallback without formatter
    try {
      if (maxDigits !== undefined) {
        return num.toFixed(maxDigits)
      }
      if (minDigits !== undefined) {
        return num.toFixed(minDigits)
      }
    } catch {
      // Ignore fallback formatting errors
    }
    return num.toString()
  }
}
