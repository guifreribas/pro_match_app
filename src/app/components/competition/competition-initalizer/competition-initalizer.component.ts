import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';

@Component({
  selector: 'app-competition-initalizer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, DatepickerComponent],
  templateUrl: './competition-initalizer.component.html',
  styleUrl: './competition-initalizer.component.scss',
})
export class CompetitionInitalizerComponent implements OnInit {
  public competitionSearchInput: FormControl = new FormControl('');
  public searchedPlayers = signal<any[] | null>(null);
  public dynamicClasses: { [key: string]: boolean } = {};

  ngOnInit(): void {}

  onSearchInput(e: Event) {}
  getDorsalControl(playerId: number): FormControl {
    return new FormControl('');
  }

  isInvalidDorsal(playerId: number): boolean {
    return false;
  }

  handleAddPlayer(playerId: number) {}

  onDateChange(event: any) {}
}
