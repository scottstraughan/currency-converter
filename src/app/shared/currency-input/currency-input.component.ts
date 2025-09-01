import {
  ChangeDetectionStrategy,
  Component, HostListener, model,
  output,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Currency } from '../models/currency';
import { CurrencyService } from '../services/currency.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'sct-currency-input',
  imports: [
    FormsModule
  ],
  templateUrl: './currency-input.component.html',
  standalone: true,
  styleUrl: './currency-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyInputComponent {
  /**
   * Supported currencies.
   */
  readonly currencies: Signal<Currency[] | undefined>;

  readonly currency = model<Currency | undefined>();

  readonly isShowingCurrencySelect: WritableSignal<boolean> = signal(false);

  /**
   * Output to notify consumers of changes to the value.
   */
  readonly currencyChanged = output<Currency>();

  /**
   * Constructor.
   */
  constructor(
    private currencyService: CurrencyService
  ) {
    this.currencies = toSignal(
      this.currencyService.observeCurrencies()
        .pipe(
          // Set the initial currency
          tap(currencies => this.currency.set(currencies[10]))
        ), { initialValue: [] });
  }

  /**
   * Handle keydown on the input. This method is designed to filter out values that are not allowed, mostly ensuring
   * that the input will contain a valid value.
   */
  onKeyDown(
    event: KeyboardEvent
  ) {
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
    ];

    // Always allow control keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow digits
    if (/^[0-9]$/.test(event.key)) {
      return;
    }

    // Allow only one dot (.)
    if (event.key === '.' && !(event.target as HTMLInputElement).value.includes('.')) {
      return;
    }

    // Block
    event.preventDefault();
  }

  /**
   * Called when the input value has changed.
   */
  onValueChanged(
    currency: Currency,
    event: any
  ) {
    const input = event.target as HTMLInputElement;
    currency.value = CurrencyInputComponent.processValue(input.value);

    this.currencyChanged.emit(currency);
  }

  /**
   * Get a flag for a currency.
   * @protected
   */
  protected getCurrencyFlagSrc(
    currency: Currency,
  ) {
    return `https://raw.githubusercontent.com/Lissy93/currency-flags/master/assets/flags_svg/${currency.name.toLowerCase()}.svg`;
  }

  /**
   * Ensure the value is valid.
   * @private
   */
  private static processValue(
    value: any
  ) {
    if (value == null || value == '' || value == undefined) {
      return 0;
    }

    return parseInt(value.toString());
  }

  /**
   * Listen for any clicks to the document to hide the select element.
   */
  @HostListener('document:click')
  protected onHostClick() {
    this.isShowingCurrencySelect.set(false);
  }

  /**
   * Called when a currency has been selected.
   */
  protected onToggleCurrencySelector(
    $event: MouseEvent
  ) {
    const target = $event.target as HTMLElement;

    // We want to stop propagation if the click is on the parent element to avoid the document:click firing
    if (target.closest('.currency')) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    this.isShowingCurrencySelect.set(!this.isShowingCurrencySelect());
  }

  /**
   * Called when a currency select item has been activated.
   */
  protected onSelectCurrency(
    $event: MouseEvent,
    currency: Currency
  ) {
    $event.preventDefault();
    $event.stopPropagation();

    currency.value = this.currency()?.value;
    this.currency.set(currency);

    this.currencyChanged.emit(currency);
    this.isShowingCurrencySelect.set(false);
  }
}
