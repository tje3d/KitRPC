import { formatNumberAdvanced as formatNumber } from '$lib/helpers/FormatNumber.helper'

// Interfaces
interface OnlyNumberProps {
  enable?:              boolean
  max?:                 number
  maxDecimals?:         number
  thousandSeparator?:   boolean
  allowLeadingZero?:    boolean
  leadingZeroLimit?:    number
  convertLeadingZeros?: boolean
}

// Constants
const DEFAULT_CONFIG: Readonly<Required<OnlyNumberProps>> = {
  enable:              true,
  thousandSeparator:   false,
  allowLeadingZero:    false,
  leadingZeroLimit:    Number.MAX_SAFE_INTEGER,
  convertLeadingZeros: false,
  max:                 Number.MAX_SAFE_INTEGER,
  maxDecimals:         Number.MAX_SAFE_INTEGER,
}

// Optimized regex patterns (compiled once)
const PERSIAN_ARABIC_REGEX = /[۰-۹٠-٩]/g
const NON_DIGIT_REGEX = /[^0-9]/g
const LEADING_ZEROS_REGEX = /^0+/
const COMMA_REGEX = /,/g

// Optimized character map for Persian/Arabic digits
const DIGIT_MAP = new Map([
  ['۰', '0'], ['٠', '0'], ['۱', '1'], ['١', '1'], ['۲', '2'], ['٢', '2'],
  ['۳', '3'], ['٣', '3'], ['۴', '4'], ['٤', '4'], ['۵', '5'], ['٥', '5'],
  ['۶', '6'], ['٦', '6'], ['۷', '7'], ['٧', '7'], ['۸', '8'], ['٨', '8'],
  ['۹', '9'], ['٩', '9']
])

// Optimized digit replacement using Map for O(1) lookup
function replacePersianDigits(str: string): string {
  return str.replace(PERSIAN_ARABIC_REGEX, (char) => DIGIT_MAP.get(char) || char)
}

export default function OnlyNumber(
  node: HTMLInputElement | HTMLTextAreaElement,
  props: OnlyNumberProps = {},
) {
  let config: Required<OnlyNumberProps> = { ...DEFAULT_CONFIG, ...props }

  // Helper functions
  const getValueWithoutSeparators = (value: string): string => {
    if (!config.thousandSeparator) return value
    return value.replace(COMMA_REGEX, '')
  }

  const handleDecimalLimits = (value: string): string => {
    if (config.maxDecimals === 0) {
      return value.split('.')[0]
    }
    const [intPart, decPart] = value.split('.')
    if (!decPart || config.maxDecimals === Number.MAX_SAFE_INTEGER) {
      return value
    }
    if (decPart.length > config.maxDecimals) {
      return `${intPart}.${decPart.slice(0, config.maxDecimals)}`
    }
    return value
  }

  const handleLeadingZeros = (integerPart: string): string => {
    if (config.allowLeadingZero) {
      if (config.convertLeadingZeros) {
        const num = parseInt(integerPart, 10)
        return isNaN(num) ? '' : String(num)
      }

      const maxLeadingZeros = config.leadingZeroLimit
      // If leadingZeroLimit is unlimited (Number.MAX_SAFE_INTEGER), allow any number of leading zeros
      if (maxLeadingZeros === Number.MAX_SAFE_INTEGER) {
        return integerPart
      }

      if (integerPart.length > 1) {
        const match = integerPart.match(LEADING_ZEROS_REGEX)
        const leadingZeros = match ? match[0].length : 0
        if (leadingZeros > maxLeadingZeros) {
          return '0'.repeat(maxLeadingZeros) + integerPart.slice(leadingZeros)
        }
      }
      return integerPart
    }

    // Remove leading zeros when not allowed
    const result = integerPart.replace(LEADING_ZEROS_REGEX, '')
    return result === '' ? '0' : result
  }

  const applyThousandSeparator = (value: string): string => {
    if (!config.thousandSeparator) return value
    const parts = value.split('.')
    parts[0] = formatNumber(parts[0], { separator: ',' })
    return parts.join('.')
  }

  const calculateCursorOffset = (
    originalValue: string,
    newValue: string,
    cursorPos: number | null,
  ): number => {
    if (!cursorPos || !config.thousandSeparator) return 0

    const originalBeforeCursor = originalValue.slice(0, cursorPos)
    const newBeforeCursor = newValue.slice(0, cursorPos)

    const origSeparatorMatches = originalBeforeCursor.match(COMMA_REGEX)
    const newSeparatorMatches = newBeforeCursor.match(COMMA_REGEX)

    const origSeparatorCount = origSeparatorMatches ? origSeparatorMatches.length : 0
    const newSeparatorCount = newSeparatorMatches ? newSeparatorMatches.length : 0

    return newSeparatorCount - origSeparatorCount
  }

  const processNumber = (
    valueWithoutSeparator: string,
    endsWithDecimal: boolean,
  ): string => {
    let [integerPart, decimalPart] = valueWithoutSeparator.split('.')

    // Process integer part
    integerPart = replacePersianDigits(integerPart).replace(NON_DIGIT_REGEX, '')
    if (!integerPart && !decimalPart) return ''

    integerPart = handleLeadingZeros(integerPart)

    // Process decimal part
    if (decimalPart) {
      decimalPart = replacePersianDigits(decimalPart).replace(NON_DIGIT_REGEX, '')
      if (config.maxDecimals !== Number.MAX_SAFE_INTEGER) {
        decimalPart = decimalPart.slice(0, config.maxDecimals)
      }
    }

    // Construct new value
    let newValue = integerPart
    if (decimalPart) {
      newValue += '.' + decimalPart
    } else if (endsWithDecimal && parseFloat(integerPart) !== config.max) {
      newValue += '.'
    }

    // Check max value
    const numValue = parseFloat(newValue)
    if (!isNaN(numValue) && numValue > config.max) {
      newValue = config.max.toString()
    }

    return newValue
  }

  function onInput(event: Event) {
    if (!config.enable) return
    const originalValue = node.value
    if (!originalValue) return

    const cursorPos = node.selectionStart
    const hadFocus = node === document.activeElement

    let valueWithoutSeparator = getValueWithoutSeparators(originalValue)
    valueWithoutSeparator = handleDecimalLimits(valueWithoutSeparator)

    const endsWithDecimal = valueWithoutSeparator.endsWith('.')
    const newValue = processNumber(valueWithoutSeparator, endsWithDecimal)

    // Apply thousand separator
    const nextValue = applyThousandSeparator(newValue)
    if (nextValue === originalValue) return
    node.value = nextValue

    // Adjust cursor position
    if (hadFocus && cursorPos !== null) {
      const cursorOffset = calculateCursorOffset(
        originalValue,
        node.value,
        cursorPos,
      )
      const newPosition = cursorPos + cursorOffset

      requestAnimationFrame(() => {
        node.setSelectionRange(newPosition, newPosition)
      })
    }
  }

  // Initialize
  node.addEventListener('input', onInput)
  node.setAttribute('inputmode', 'decimal')
  onInput(new Event('input'))

  return {
    update(newProps: OnlyNumberProps) {
      config = { ...DEFAULT_CONFIG, ...newProps }
      onInput(new Event('input'))
    },
    destroy() {
      node.removeEventListener('input', onInput)
      node.removeAttribute('inputmode')
    },
  }
}
