import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservations',
  standalone: true,
  templateUrl: './reservations.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class ReservationsComponent {
  private fb: FormBuilder = inject(FormBuilder);

  reservationForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    guests: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
    site: ['interior', Validators.required],
  });

  submissionState = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  onSubmit() {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    this.submissionState.set('loading');
    setTimeout(() => {
      this.submissionState.set('success');
      this.reservationForm.reset({ guests: 1, site: 'interior', name:'', phone:'', date:'', time:'' });
      this.reservationForm.markAsPristine();
      this.reservationForm.markAsUntouched();
      
      setTimeout(() => this.submissionState.set('idle'), 5000);
    }, 2000);
  }
}