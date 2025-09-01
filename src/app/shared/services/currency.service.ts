import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of, take, tap } from 'rxjs';
import { Currency } from '../models/currency';
import { CurrencyBeaconService } from './backends/currency-beacon.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  /**
   * Observe the supported currency pairs.
   * @private
   */
  private currencies$: BehaviorSubject<Currency[]> = new BehaviorSubject<any>([]);

  /**
   * Observable to track if we are converting or not.
   * @private
   */
  private isConverting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Observable to track if we are loading currencies or not.
   * @private
   */
  private isLoadingCurrencies$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /**
   * Observable for the 'from' currency.
   * @private
   */
  private fromCurrency: BehaviorSubject<Currency | undefined> = new BehaviorSubject<any>(undefined);

  /**
   * Observable for the 'to' currency.
   * @private
   */
  private toCurrency: BehaviorSubject<Currency | undefined> = new BehaviorSubject<any>(undefined);

  /**
   * Observable for last update Date.
   * @private
   */
  private lastUpdateDate: BehaviorSubject<Date | undefined> = new BehaviorSubject<any>(undefined);

  /**
   * Constructor.
   */
  constructor(
    private currencyBeaconService: CurrencyBeaconService
  ) {
    this.loadCurrencyPairs()
      .pipe(
        tap(() => {
          this.fromCurrency.next(this.currencies$.value[48])
          this.toCurrency.next(this.currencies$.value[146])
        })
      )
      .subscribe();

  }

  /**
   * Observe currencies.
   */
  observeCurrencies(): Observable<Currency[]> {
    return this.currencies$.asObservable();
  }

  /**
   * Observe 'from' currency.
   */
  observeFromCurrency(): Observable<Currency | undefined> {
    return this.fromCurrency.asObservable()
  }

  /**
   * Observe 'to' currency.
   */
  observeToCurrency(): Observable<Currency | undefined> {
    return this.toCurrency.asObservable()
  }

  /**
   * Observe last update date for a conversion.
   */
  observeUpdateDate(): Observable<Date | undefined> {
    return this.lastUpdateDate.asObservable()
  }

  /**
   * Observe changes to if we are checking for currency values or not.
   */
  observeChecking(): Observable<boolean> {
    return this.isConverting$.asObservable();
  }

  /**
   * Observe if we are loading the currencies.
   */
  observeLoadingCurrencies(): Observable<boolean> {
    return this.isLoadingCurrencies$.asObservable();
  }

  /**
   * Update the 'from' currency. Call the API backend and update any required values.
   */
  updateFrom(
    currency: Currency
  ): Observable<any> {
    this.fromCurrency.next(currency);

    const fromCurrency = this.fromCurrency.value;
    const toCurrency = this.toCurrency.value;

    if (!fromCurrency || !toCurrency) {
      return of(toCurrency);
    }

    return this.fetchLatestCurrencyEvaluation(fromCurrency, toCurrency)
      .pipe(
        tap(value =>
          this.toCurrency.next(value)),
        take(1),
      )
  }

  /**
   * Update the 'to' currency. Call the API backend and update any required values.
   */
  updateTo(
    currency: Currency
  ) {
    this.toCurrency.next(currency);

    const fromCurrency = this.toCurrency.value;
    const toCurrency = this.fromCurrency.value;

    if (!fromCurrency || !toCurrency) {
      return of(fromCurrency);
    }

    return this.fetchLatestCurrencyEvaluation(fromCurrency, toCurrency)
      .pipe(
        tap(value =>
          this.fromCurrency.next(value)),
        take(1),
      )
  }

  /**
   * Fetch the latest currency evaluation.
   * @private
   */
  private fetchLatestCurrencyEvaluation(
    from: Currency,
    to: Currency
  ): Observable<Currency> {
    this.isConverting$.next(true);

    return this.currencyBeaconService.convertCurrencyAmount(from, to)
      .pipe(
        map(response => {
          to.value = parseFloat(Number(response.value).toFixed(2));
          return to;
        }),
        tap(() =>
          this.isConverting$.next(false)),
        tap(() =>
          this.lastUpdateDate.next(new Date())),
      )
  }

  /**
   * Load the supported currencies.
   * @private
   */
  private loadCurrencyPairs(): Observable<Currency[]> {
    this.isLoadingCurrencies$.next(true);

    return this.currencyBeaconService.getSupportedCurrencies()
      .pipe(
        map(response =>
          Object.values(response.response).map(currencyResponse => <Currency> {
            name: currencyResponse.short_code,
            symbol: currencyResponse.symbol,
          })),
        tap(currencies =>
          this.currencies$.next(currencies)),
        tap(() =>
          this.isLoadingCurrencies$.next(false))
      )
  }
}
