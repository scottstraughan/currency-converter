import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Currency, CurrencyInputComponent } from './shared/currency-input/currency-input.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CurrencyInputComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'currency-converter';
  testCurrency: Currency = {
    symbol: '$',
    flag: 'https://www.svgrepo.com/show/508663/flag-um.svg',
    name: 'USD'
  }
}
