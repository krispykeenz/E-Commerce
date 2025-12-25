import { Pipe, PipeTransform } from '@angular/core';

const ZAR_FORMATTER: Intl.NumberFormat | null = (() => {
  try {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return null;
  }
})();

@Pipe({
  name: 'zarCurrency',
})
export class ZarCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const numericValue = typeof value === 'string' ? Number(value) : value;
    const amount = Number.isFinite(numericValue) ? (numericValue as number) : 0;

    if (ZAR_FORMATTER) {
      return ZAR_FORMATTER.format(amount);
    }

    // Fallback for environments without Intl support.
    return `R ${amount.toFixed(2)}`;
  }
}
