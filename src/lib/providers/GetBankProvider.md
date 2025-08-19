# GetBankProvider Component Guide

## Overview

The `GetBankProvider` component is a Svelte component that automatically detects and provides Iranian bank information based on a card number. It acts as a data provider that wraps other components and supplies bank-specific details through Svelte's slot props pattern.

## Purpose

This component serves as a bridge between card numbers and bank information, enabling:
- Automatic bank detection from card numbers
- Consistent bank branding across the application
- Centralized bank data management
- Enhanced user experience with visual bank identification

## How It Works

1. **Input**: Takes a card number as a prop
2. **Processing**: Uses the `detectIranianBank` helper to identify the bank
3. **Output**: Provides bank information to child components via slot props
4. **Reactivity**: Updates automatically when the card number changes

## Component Structure

```svelte
<GetBankProvider cardNumber={cardNumber} let:bank>
  <!-- Your content here -->
  <!-- bank object is available here -->
</GetBankProvider>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cardNumber` | `string` | Yes | The card number to detect bank information from |
| `onBankFound` | `function` | No | Callback function called when bank is detected |

## Slot Props

| Prop | Type | Description |
|------|------|-------------|
| `bank` | `IranianBankData \| null` | Bank information object or null if not detected |

### Bank Object Properties

When a bank is successfully detected, the `bank` object contains:

```typescript
interface IranianBankData {
  id: string;        // Bank identifier (e.g., "mellat", "melli")
  name: string;      // Bank display name (e.g., "بانک ملت")
  color: string;     // Bank brand color (hex code)
  // ... other properties
}
```

## Usage Examples

### Basic Usage

```svelte
<script>
  let cardNumber = "6037991234567890";
</script>

<GetBankProvider cardNumber={cardNumber} let:bank>
  {#if bank}
    <div>
      <h3>{bank.name}</h3>
      <p>Bank ID: {bank.id}</p>
      <p style="color: {bank.color}">Brand Color: {bank.color}</p>
    </div>
  {:else}
    <p>Bank not detected</p>
  {/if}
</GetBankProvider>
```

### Card Display with Bank Branding

```svelte
<GetBankProvider cardNumber={card.cardNumber} let:bank>
  <div 
    class="card"
    style="background: {bank ? `linear-gradient(135deg, ${bank.color}08, ${bank.color}15)` : '#f9fafb'};"
  >
    <div class="card-header">
      {#if bank}
        <img 
          src="/img/banks/{bank.id}.svg" 
          alt={bank.name}
          class="bank-logo"
        />
        <span style="color: {bank.color}">{bank.name}</span>
      {:else}
        <span class="icon-[heroicons--credit-card]"></span>
        <span>Unknown Bank</span>
      {/if}
    </div>
    
    <div class="card-number">
      {card.cardNumber}
    </div>
  </div>
</GetBankProvider>
```

### Bank Icon with Colored Background

```svelte
<GetBankProvider cardNumber={cardNumber} let:bank>
  <div 
    class="bank-icon-container"
    style="background: {bank ? `linear-gradient(135deg, ${bank.color}, ${bank.color}dd)` : '#6b7280'};"
  >
    {#if bank}
      <img 
        src="/img/banks/{bank.id}.svg" 
        alt={bank.name}
        class="bank-icon"
      />
    {:else}
      <span class="icon-[heroicons--credit-card] text-white"></span>
    {/if}
  </div>
</GetBankProvider>
```

### Multiple Cards with Bank Information

```svelte
<script>
  let cards = [
    { id: 1, cardNumber: "6037991234567890" },
    { id: 2, cardNumber: "6274121234567890" },
    { id: 3, cardNumber: "6393461234567890" }
  ];
</script>

<div class="cards-grid">
  {#each cards as card}
    <GetBankProvider cardNumber={card.cardNumber} let:bank>
      <div 
        class="card-item"
        style="border-color: {bank ? `${bank.color}30` : '#d1d5db'};"
      >
        <div class="bank-info">
          {#if bank}
            <img src="/img/banks/{bank.id}.svg" alt={bank.name} />
            <span style="color: {bank.color}">{bank.name}</span>
          {:else}
            <span>Unknown Bank</span>
          {/if}
        </div>
        
        <div class="card-number">
          {card.cardNumber}
        </div>
      </div>
    </GetBankProvider>
  {/each}
</div>
```

### With Callback Function

```svelte
<script>
  let detectedBank = null;
  
  function handleBankDetection(bank) {
    detectedBank = bank;
    console.log('Bank detected:', bank);
  }
</script>

<GetBankProvider 
  cardNumber={cardNumber} 
  onBankFound={handleBankDetection}
  let:bank
>
  <!-- Component content -->
</GetBankProvider>
```

## Real-World Implementation

In the KitRPC project, `GetBankProvider` is used in:

1. **Panel Dashboard** (`/panel/+page.svelte`): Displays connected bank cards with bank branding
2. **Cards Management** (`/panel/cards/+page.svelte`): Shows detailed card information with bank styling

## Best Practices

1. **Always handle null bank**: Not all card numbers may be recognized
2. **Use fallback styling**: Provide default styles when bank is not detected
3. **Optimize images**: Ensure bank logo SVGs are optimized and available
4. **Consistent branding**: Use bank colors consistently across the application
5. **Accessibility**: Always provide alt text for bank logos

## Styling Guidelines

- Use bank colors with appropriate opacity for backgrounds (e.g., `${bank.color}08` for subtle backgrounds)
- Apply bank colors to text and icons for brand consistency
- Provide smooth transitions when bank information loads
- Use gradients with bank colors for enhanced visual appeal

## Dependencies

- `detectIranianBank` helper function
- Bank logo SVG files in `/static/img/banks/`
- Iranian banks data configuration

This component provides a clean, reusable way to integrate bank branding throughout your application while maintaining consistency and enhancing user experience.