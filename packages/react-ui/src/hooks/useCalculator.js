import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  evaluateTokens,
  formatRefFromScrap,
  isInProgressNumberToken,
  isCloseParen,
  isMetalToken,
  isNumberToken,
  isOpenParen,
  isOperator,
  isValueToken,
  toMetalBreakdown,
} from '@tf2calc/core'

export function useCalculator() {
  const [expressionTokens, setExpressionTokens] = useState([])
  const [resultScrap, setResultScrap] = useState(0)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [materialValueView, setMaterialValueView] = useState('ref-value')

  const resultText = useMemo(() => formatRefFromScrap(resultScrap), [resultScrap])
  const breakdown = useMemo(() => toMetalBreakdown(resultScrap), [resultScrap])

  const pushDigit = useCallback((digit) => {
    setExpressionTokens((prev) => {
      const next = [...prev]
      const last = next.at(-1)

      if (digit === '.') {
        if (isInProgressNumberToken(last) && !last.includes('.')) {
          next[next.length - 1] = `${last}.`
          return next
        }

        if (!last || isOperator(last) || isOpenParen(last)) {
          next.push('0.')
          return next
        }

        if (isCloseParen(last) || isMetalToken(last)) {
          next.push('*')
          next.push('0.')
          return next
        }

        return next
      }

      if (isInProgressNumberToken(last)) {
        if (last.endsWith('.')) {
          if (digit === '9') {
            return next
          }

          next[next.length - 1] = `${last}${digit}${digit}`
          return next
        }

        if (isNumberToken(last)) {
          if (/^\d+\.\d{2}$/.test(last)) {
            next.push('*')
            next.push(digit)
            return next
          }

          next[next.length - 1] = `${last}${digit}`
          return next
        }

        if (/^\d+\.\d$/.test(last)) {
          const firstDecimal = last.at(-1)
          next[next.length - 1] = `${last.slice(0, -1)}${firstDecimal}${firstDecimal}`
          return next
        }

        return next
      }

      if (isCloseParen(last) || isMetalToken(last)) {
        next.push('*')
      }

      next.push(digit)
      return next
    })
    setError('')
  }, [])

  const pushOperator = useCallback((operator) => {
    setExpressionTokens((prev) => {
      if (!prev.length) {
        return prev
      }

      const next = [...prev]
      const last = next.at(-1)

      if (isOperator(last)) {
        next[next.length - 1] = operator
        return next
      }

      if (isOpenParen(last)) {
        return prev
      }

      next.push(operator)
      return next
    })
    setError('')
  }, [])

  const pushParen = useCallback((paren) => {
    setExpressionTokens((prev) => {
      const next = [...prev]
      const last = next.at(-1)

      if (paren === '(') {
        if (isValueToken(last)) {
          next.push('*')
        }
        next.push('(')
        return next
      }

      const openCount = next.filter(isOpenParen).length
      const closeCount = next.filter(isCloseParen).length
      if (openCount <= closeCount) {
        return prev
      }
      if (!last || isOperator(last) || isOpenParen(last)) {
        return prev
      }

      next.push(')')
      return next
    })
    setError('')
  }, [])

  const insertMetal = useCallback((metal) => {
    setExpressionTokens((prev) => {
      const next = [...prev]
      const last = next.at(-1)

      if (isNumberToken(last)) {
        next.push('*')
      } else if (isCloseParen(last) || isMetalToken(last)) {
        next.push('+')
      }

      next.push('(')
      next.push(metal)
      next.push(')')
      return next
    })
    setError('')
  }, [])

  const clearAll = useCallback(() => {
    setExpressionTokens([])
    setResultScrap(0)
    setError('')
  }, [])

  const backspace = useCallback(() => {
    setExpressionTokens((prev) => {
      if (!prev.length) {
        return prev
      }

      const next = [...prev]
      const last = next.at(-1)

      if (isInProgressNumberToken(last) && last.length > 1) {
        next[next.length - 1] = last.slice(0, -1)
        return next
      }

      next.pop()
      return next
    })
  }, [])

  const calculate = useCallback(() => {
    try {
      const scrap = evaluateTokens(expressionTokens)
      const formatted = formatRefFromScrap(scrap)

      setResultScrap(scrap)
      setError('')
      setHistory((prev) =>
        [{ expressionTokens: [...expressionTokens], result: formatted }, ...prev].slice(0, 8),
      )
    } catch (err) {
      setError(err.message)
    }
  }, [expressionTokens])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (/^[0-9]$/.test(event.key)) {
        pushDigit(event.key)
        return
      }
      if (event.key === '.') {
        pushDigit('.')
        return
      }
      if (['+', '-', '*'].includes(event.key)) {
        pushOperator(event.key)
        return
      }
      if (event.key === '(') {
        event.preventDefault()
        pushParen('(')
        return
      }
      if (event.key === ')') {
        event.preventDefault()
        pushParen(')')
        return
      }
      if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault()
        calculate()
        return
      }
      if (event.key === 'Backspace') {
        event.preventDefault()
        backspace()
        return
      }
      if (event.key === 'Escape') {
        clearAll()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [backspace, calculate, clearAll, pushDigit, pushOperator, pushParen])

  return {
    breakdown,
    calculate,
    clearAll,
    darkMode,
    error,
    expressionTokens,
    history,
    materialValueView,
    resultText,
    setDarkMode,
    setMaterialValueView,
    actions: {
      backspace,
      calculate,
      clearAll,
      insertMetal,
      pushDigit,
      pushOperator,
      pushParen,
    },
  }
}
