import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function Hello() {
  return <h1>Ciao Vitest</h1>
}

describe('Hello', () => {
  it('mostra il titolo', () => {
    render(<Hello />)
    expect(screen.getByText('Ciao Vitest')).toBeInTheDocument()
  })
})

describe('Smoke test', () => {
  it('verifica che l\'ambiente di test sia configurato', () => {
    expect(1 + 1).toBe(2)
  })
})
