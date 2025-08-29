import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private static endpoint = 'https://free.ratesdb.com/v1/rates';

  constructor(
    private httpClient: HttpClient,
  ) {

  }

  convert(
    currentPair: CurrencyPair
  ) {
    const params = new HttpParams()
      .set('from', currentPair.from.name)
      .set('to', currentPair.to.name)
      .set('amount', currentPair.from.value);

    return this.httpClient.get(CurrencyService.endpoint, { params })
      .pipe(
        tap(result => console.log(result))
      );
  }
}

export type Currency = {
  name: string
  symbol: string
  flag: string
  value: number
}

export type CurrencyPair = {
  from: Currency
  to: Currency
}
