import { ChangeDetectionStrategy, Component, OnDestroy, Signal } from '@angular/core';
import { CurrencyInputComponent } from './shared/currency-input/currency-input.component';
import { CurrencyService } from './shared/services/currency.service';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Currency, CurrencyPair } from './shared/models/currency';

@Component({
  selector: 'sct-root',
  imports: [CurrencyInputComponent, DatePipe],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  /**
   * Time to debounce input changes.
   * @private
   */
  private static DEBOUNCE_TIME = 200;

  /**
   * Signal for the current currency pair.
   */
  readonly currencyPair: Signal<CurrencyPair>;

  /**
   * Signal to determine if we are checking or not.
   */
  readonly isChecking: Signal<boolean>;

  /**
   * Subject to track changes to the 'from' currency component.
   * @private
   */
  private fromCurrencyValueChangeSubject = new Subject<Currency>();

  /**
   * Subject to track changes to the 'to' currency component.
   * @private
   */
  private toCurrencyValueChangeSubject = new Subject<Currency>();

  /**
   * On destroy subject, not really needed, good practice.
   * @private
   */
  private onDestroySubject: Subject<void> = new Subject();

  /**
   * Constructor.
   */
  constructor(
    private currencyService: CurrencyService,
  ) {
    this.currencyPair = toSignal(
      currencyService.observeCurrencyPair(), { initialValue: CurrencyService.DEFAULT_CURRENCY_PAIR });

    this.isChecking = toSignal(
      currencyService.observeChecking(), { initialValue: true });

    this.fromCurrencyValueChangeSubject
      .pipe(
        debounceTime(AppComponent.DEBOUNCE_TIME),
        switchMap(() => this.currencyService.fromValueUpdated()),
        takeUntil(this.onDestroySubject),
      )
      .subscribe();

    this.toCurrencyValueChangeSubject
      .pipe(
        debounceTime(AppComponent.DEBOUNCE_TIME),
        switchMap(() => this.currencyService.toValueUpdated()),
        takeUntil(this.onDestroySubject)
      )
      .subscribe();
  }

  /**
   * Called when the 'from' currency component has changed value, fires immediately.
   */
  onFromCurrencyValueChanged(
    value: Currency
  ) {
    this.fromCurrencyValueChangeSubject.next(value);
  }

  /**
   * Called when the 'to' currency component has changed value, fires immediately.
   */
  onToCurrencyValueChanged(
    value: Currency
  ) {
    this.toCurrencyValueChangeSubject.next(value);
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }
}
