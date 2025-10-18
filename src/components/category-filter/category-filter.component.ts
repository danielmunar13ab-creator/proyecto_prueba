import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  templateUrl: './category-filter.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterComponent {
  categories = input.required<string[]>();
  selectedCategory = input<string | null>(null);
  categorySelected = output<string | null>();

  selectCategory(category: string | null) {
    this.categorySelected.emit(category);
  }
}