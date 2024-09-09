import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { CompetitionService } from '@app/services/api_services/competition.service';

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

  private _competitionService = inject(CompetitionService);

  ngOnInit(): void {
    this._competitionService.getCompetitions().subscribe({
      next: (res) => {
        console.log(res);
        this.searchedPlayers.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

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
