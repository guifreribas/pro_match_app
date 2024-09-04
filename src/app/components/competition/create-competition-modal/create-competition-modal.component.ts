import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Organization } from '@app/models/organization';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { catchError, firstValueFrom } from 'rxjs';
import { CompetitionTypes } from '../../../config/constants';

@Component({
  selector: 'app-create-competition-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-competition-modal.component.html',
  styleUrl: './create-competition-modal.component.scss',
})
export class CreateCompetitionModalComponent implements OnInit {
  @Input() organizations!: WritableSignal<Organization[]>;
  @ViewChild('formatSelect') formatSelect!: ElementRef;

  public isSelectDisabled = true;

  public competitionForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
    competition: new FormControl('', [Validators.required]),
    format: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    season: new FormControl('', [Validators.required]),
  });

  private _competitionService = inject(CompetitionService);

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log(
      'ngAfterViewInit',
      this.competitionForm.controls['competition'].valueChanges
    );
    this.formatSelect.nativeElement.disabled =
      this.competitionForm.controls['competition'].value !== '';
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log(this.organizations());
    console.log(this.competitionForm.value);
    console.log(
      'Competition type',
      this.competitionForm.controls['competition'].value
    );
    const formatControl = this.competitionForm.controls['competition']
      .value as keyof typeof CompetitionTypes;
    console.log({ formatControl });
    const competitionTypeId = CompetitionTypes[formatControl];

    const { organization, ...rest } = this.competitionForm.value;
    const formWithoutOrganization = rest;

    const competition = {
      competition_type_id: competitionTypeId,
      organization_id: Number(this.competitionForm.value.organization),
      ...formWithoutOrganization,
    };

    console.log({ competition });
    console.log({ competitionTypeId });

    this._competitionService.createCompetitionFull(competition).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });

    // const competition = this.competitionForm.value;
    // const competitionCreateResponse = await this.createCompetition(competition);
    // console.log(competitionCreateResponse);
  }

  // async createCompetition(competition: any): Promise<any> {

  // }
}
