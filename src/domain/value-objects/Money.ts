import { ValidationError } from '@shared/errors';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'KES';

export class Money {
  private readonly amount: number;
  private readonly currency: Currency;

  constructor(amount: number, currency: Currency = 'USD') {
    this.amount = this.validateAmount(amount);
    this.currency = currency;
  }

  private validateAmount(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new ValidationError('Invalid amount', {
        amount: ['Amount must be a valid number'],
      });
    }

    if (amount < 0) {
      throw new ValidationError('Invalid amount', {
        amount: ['Amount cannot be negative'],
      });
    }

    return Math.round(amount * 100) / 100;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError('Currency mismatch', {
        currency: ['Cannot add money with different currencies'],
      });
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError('Currency mismatch', {
        currency: ['Cannot subtract money with different currencies'],
      });
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new ValidationError('Currency mismatch', {
        currency: ['Cannot compare money with different currencies'],
      });
    }
    return this.amount > other.amount;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
