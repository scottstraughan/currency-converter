import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private static endpoint = 'https://api.frankfurter.app/latest';

  public static DEFAULT_CURRENCY_PAIR = {
    from: {
      symbol: '$',
      flag: 'https://www.svgrepo.com/show/508663/flag-um.svg',
      name: 'USD',
      value: 4213.33,
    },
    to: {
      symbol: '£',
      flag: 'https://www.svgrepo.com/show/508663/flag-um.svg',
      name: 'GBP',
      value: 4213.33,
    }
  };

  private currencyPair$: BehaviorSubject<CurrencyPair>
    = new BehaviorSubject<CurrencyPair>(CurrencyService.DEFAULT_CURRENCY_PAIR);

  private httpClient: HttpClient = inject(HttpClient);

  observeCurrencyPair(): Observable<CurrencyPair> {
    return this.currencyPair$.asObservable();
  }

  fromValueUpdated() {
    const currentPair = this.currencyPair$.value;

    return this.fetchConvertedCurrencyRate(currentPair.from, currentPair.to)
      .pipe(
        tap(value =>
          this.currencyPair$.next({ ...currentPair, to: { ...currentPair.to, value }}))
      )
  }

  toValueUpdated() {
    const currentPair = this.currencyPair$.value;

    return this.fetchConvertedCurrencyRate(currentPair.to, currentPair.from)
      .pipe(
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

    return this.httpClient.get<ApiResult>(CurrencyService.endpoint, { params })
      .pipe(
        map(result => result.rates[to.name]),
      );
  }
}

export type Currency = {
  name: string
  symbol: string
  flag: string
  value?: number
}

export type CurrencyPair = {
  from: Currency
  to: Currency
}

type ApiResult = {
  amount: number
  base: string
  date: string
  rates: {
    [currency: string]: number;
  }
}