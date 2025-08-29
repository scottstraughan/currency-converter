import { ChangeDetectionStrategy, Component, OnDestroy, Signal } from '@angular/core';
import { CurrencyInputComponent } from './shared/currency-input/currency-input.component';
import { Currency, CurrencyPair, CurrencyService } from './shared/services/currency.service';
import { debounceTime, Subject, switchMap, takeUntil } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'sct-root',
  imports: [CurrencyInputComponent, DatePipe],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy{
  private static DEBOUNCE_TIME = 200;

  readonly currencyPair: Signal<CurrencyPair>;
  readonly isChecking: Signal<boolean>;

  private fromCurrencyValueChangeSubject = new Subject<Currency>();
  private toCurrencyValueChangeSubject = new Subject<Currency>();
  private onDestroySubject: Subject<void> = new Subject();

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

  onFromCurrencyValueChanged(
    value: Currency
  ) {
    this.fromCurrencyValueChangeSubject.next(value);
  }

  onToCurrencyValueChanged(
    value: Currency
  ) {
    this.toCurrencyValueChangeSubject.next(value);
  }

  ngOnDestroy(): void {
    this.onDestroySubject.next();
    this.onDestroySubject.complete();
  }
}
