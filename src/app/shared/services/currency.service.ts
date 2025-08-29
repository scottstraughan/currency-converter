import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Currency, CurrencyPair } from '../models/currency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  /**
   * Default currency pair, loaded from environments.
   */
  public static DEFAULT_CURRENCY_PAIR = environment.defaultCurrencyPair;

  /**
   * Current currency pair subject.
   * @private
   */
  private currencyPair$: BehaviorSubject<CurrencyPair>
    = new BehaviorSubject<CurrencyPair>(environment.defaultCurrencyPair);

  /**
   * Checking subject.
   * @private
   */
  private checking$: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(true);

  /**
   * Constructor.
   */
  constructor(
    private httpClient: HttpClient
  ) {
    // Load an initial value
    this.fromValueUpdated()
      .pipe(take(1))
      .subscribe()
  }

  /**
   * Observe changes to the current currency pair.
   */
  observeCurrencyPair(): Observable<CurrencyPair> {
    return this.currencyPair$.asObservable();
  }

  /**
   * Observe changes to if we are checking for currency values or not.
   */
  observeChecking(): Observable<boolean> {
    return this.checking$.asObservable();
  }

  /**
   * The 'from' value has changed, updated the 'to' currency.
   */
  fromValueUpdated() {
    const currentPair = this.currencyPair$.value;

    return this.fetchConvertedCurrencyRate(currentPair.from, currentPair.to)
      .pipe(
        tap(() =>
          currentPair.updated = new Date()),
        tap(value =>
          this.currencyPair$.next({ ...currentPair, to: { ...currentPair.to, value }}))
      )
  }

  /**
   * The 'to' value has changed, updated the 'from' currency.
   */
  toValueUpdated() {
    const currentPair = this.currencyPair$.value;

    return this.fetchConvertedCurrencyRate(currentPair.to, currentPair.from)
      .pipe(
        tap(() =>
          currentPair.updated = new Date()),
        tap(value =>
          this.currencyPair$.next({ ...currentPair, from: { ...currentPair.from, value }}))
      )
  }

  /**
   * Fetch the latest version value from the backend.
   * @private
   */
  private fetchConvertedCurrencyRate(
    from: Currency,
    to: Currency
  ): Observable<number> {
    const fromValue = from.value != undefined ? from.value : 0;

    const params = new HttpParams()
      .set('from', from.name)
      .set('to', to.name)
      .set('amount', fromValue);

    this.checking$.next(true);

    return this.httpClient.get<ApiResult>(environment.apiEndpoint, { params })
      .pipe(
        map(result =>
          result.rates[to.name]),
        delay(200),
        tap(() =>
          this.checking$.next(false))
      );
  }
}


/**
 * An API response from the backend.
 */
type ApiResult = {
  amount: number
  base: string
  date: string
  rates: {
    [currency: string]: number;
  }
}