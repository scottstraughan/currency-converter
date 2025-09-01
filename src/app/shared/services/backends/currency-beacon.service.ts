import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Currency } from '../../models/currency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyBeaconService {
  /**
   * Default endpoint version.
   * @private
   */
  private static BASE_URL = 'https://api.currencybeacon.com/v1';

  /**
   * Inject the HTTP client.
   * @private
   */
  private httpClient: HttpClient = inject(HttpClient);

  /**
   * Convert from a currency to a currency.
   */
  convertCurrencyAmount(
    from: Currency,
    to: Currency,
  ): Observable<ConvertResponse> {
    const fromValue = from.value != undefined ? from.value : 0;

    const params = new HttpParams()
      .set('from', from.name)
      .set('to', to.name)
      .set('amount', parseInt(fromValue.toString()));

    return this.httpClient.get<ConvertResponse>(`${CurrencyBeaconService.BASE_URL}/convert`, {
      headers: CurrencyBeaconService.getDefaultHeaders(),
      params
    });
  }

  /**
   * Get all the supported currencies.
   */
  getSupportedCurrencies(): Observable<CurrenciesResponse> {
    return this.httpClient.get<CurrenciesResponse>(`${CurrencyBeaconService.BASE_URL}/currencies`, {
      headers: CurrencyBeaconService.getDefaultHeaders()
    });
  }

  /**
   * Get the default request headers.
   * @private
   */
  private static getDefaultHeaders() {
    return {
      'Authorization': 'Bearer ' + environment.currencyBeacon.apiToken
    };
  }
}

/**
 * Type for the currency response.
 */
export type CurrenciesResponseCurrency = {
  id: number
  name: string
  short_code: string
  code: string
  precision: number
  subunit: number
  symbol: string
  symbol_first: boolean
  decimal_mark: string
  thousands_separator: string
}

/**
 * Response from the /currencies endpoint.
 */
export type CurrenciesResponse = {
  response: CurrenciesResponseCurrency[]
}

/**
 * Response from the /convert endpoint.
 */
export type ConvertResponse = {
  meta: {
    code: number
    disclaimer: string
  }

  response: {
    timestamp: number
    date: string
    from: string
    to: string
    amount: number
    value: number
  }

  timestamp: number
  date: string
  from: string
  to: string
  amount: number
  value: number
}