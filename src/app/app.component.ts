import { ChangeDetectionStrategy, Component, OnDestroy, signal, Signal, WritableSignal } from '@angular/core';
import { CurrencyInputComponent } from './shared/currency-input/currency-input.component';
import { CurrencyService } from './shared/services/currency.service';
import { debounceTime, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Currency } from './shared/models/currency';

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
   * Signal to determine if we are checking or not.
   */
  readonly isChecking: Signal<boolean>;

  /**
   * Signal to track if we are initializing or not.
   */
  readonly isInitializing: Signal<boolean>;

  readonly lastUpdateDate: Signal<Date | undefined>;

  /**
   * Signal for 'from' currency.
   */
  readonly fromCurrency: WritableSignal<Currency | undefined> = signal(undefined);

  /**
   * Signal for 'to' currency.
   */
  readonly toCurrency: WritableSignal<Currency | undefined> = signal(undefined);

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

  static rebuildUpdatedCurrency(
    currency: Currency | undefined
  ) {
    return currency == undefined ? undefined : <Currency> {
      name: currency.name,
      value: currency.value,
      symbol: currency.symbol,
    };
  }

  /**
   * Constructor.
   */
  constructor(
    private currencyService: CurrencyService,
  ) {
    this.currencyService.observeFromCurrency()
      .pipe(
        map(from => AppComponent.rebuildUpdatedCurrency(from)),
        tap(currency => this.fromCurrency.set(currency)),
        takeUntil(this.onDestroySubject)
      )
      .subscribe()

    this.currencyService.observeToCurrency()
      .pipe(
        map(to => AppComponent.rebuildUpdatedCurrency(to)),
        tap(currency => this.toCurrency.set(currency)),
        takeUntil(this.onDestroySubject)
      )
      .subscribe()

    this.lastUpdateDate = toSignal(currencyService.observeUpdateDate(), { initialValue: undefined })

    this.isChecking = toSignal(
      currencyService.observeChecking(), { initialValue: false });

    this.isInitializing = toSignal(
      currencyService.observeLoadingCurrencies(), { initialValue: true });

    this.fromCurrencyValueChangeSubject
      .pipe(
        debounceTime(AppComponent.DEBOUNCE_TIME),
        switchMap(value => this.currencyService.updateFrom(value)),
        takeUntil(this.onDestroySubject),
      )
      .subscribe();

    this.toCurrencyValueChangeSubject
      .pipe(
        debounceTime(AppComponent.DEBOUNCE_TIME),
        switchMap(value => this.currencyService.updateTo(value)),
        takeUntil(this.onDestroySubject)
      )
      .subscribe();
  }

  /**
   * @inheritdoc
   */
  ngOnDestroy(): void {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }

  /**
   * Called when the 'from' currency value has changed.
   */
  onFromCurrencyChanged(
    from: Currency
  ) {
    this.fromCurrencyValueChangeSubject.next(from);
  }

  /**
   * Called when the 'to' currency value has changed.
   */
  onToCurrencyChanged(
    to: Currency
  ) {
    this.toCurrencyValueChangeSubject.next(to);
  }
}
