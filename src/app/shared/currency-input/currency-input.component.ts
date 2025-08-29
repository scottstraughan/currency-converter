import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Currency } from '../models/currency';

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
   * Input for the current to handle.
   */
  readonly currency = input.required<Currency>();

  /**
   * Output to notify consumers of changes to the value.
   */
  readonly valueChanged = output<Currency>();

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
    event: any
  ) {
    const input = event.target as HTMLInputElement;
    this.currency().value= CurrencyInputComponent.processValue(input.value);

    this.valueChanged.emit(this.currency());
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
}
