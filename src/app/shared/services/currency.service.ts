import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, delay, map, Observable, take, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  public static DEFAULT_CURRENCY_PAIR = {
    from: {
      symbol: '$',
      name: 'USD',
      value: 6239.21,
    },
    to: {
      symbol: '£',
      name: 'GBP',
      value: 0,
    }
  };

  private currencyPair$: BehaviorSubject<CurrencyPair>
    = new BehaviorSubject<CurrencyPair>(CurrencyService.DEFAULT_CURRENCY_PAIR);

  private checking$: BehaviorSubject<boolean>
    = new BehaviorSubject<boolean>(true);

  constructor(
    private httpClient: HttpClient
  ) {
    // Load an initial value
    this.fromValueUpdated()
      .pipe(take(1))
      .subscribe()
  }

  observeCurrencyPair(): Observable<CurrencyPair> {
    return this.currencyPair$.asObservable();
  }

  observeChecking(): Observable<boolean> {
    return this.checking$.asObservable();
  }

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

export type Currency = {
  name: string
  symbol: string
  value?: number
}

export type CurrencyPair = {
  from: Currency
  to: Currency
  updated?: Date
}

type ApiResult = {
  amount: number
  base: string
  date: string
  rates: {
    [currency: string]: number;
  }
}