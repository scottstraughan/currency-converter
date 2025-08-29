import { Component, input } from '@angular/core';
import { Currency } from '../services/currency.service';

@Component({
  selector: 'sct-currency-input',
  imports: [],
  templateUrl: './currency-input.component.html',
  standalone: true,
  styleUrl: './currency-input.component.scss'
})
export class CurrencyInputComponent {
  readonly value = input.required<number>();
  readonly currency = input.required<Currency>();
}
