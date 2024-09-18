import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { config } from '@app/config/config';
import { Category } from '@app/models/category';
import {
  Competition,
  CompetitionFormat,
  CompetitionWithDetails,
} from '@app/models/competition';
import { CompetitionCategory } from '@app/models/competitionCategory';
import { Organization } from '@app/models/organization';
import { CompetitionCategoryService } from '@app/services/api_services/competition-category.service';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';

@Component({
  selector: 'app-competition-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './competition-edit.component.html',
  styleUrl: './competition-edit.component.scss',
})
export class CompetitionEditComponent {
  @Input() competition!: CompetitionWithDetails;
  @Input() organizations!: WritableSignal<Organization[]>;
  @Input() categories!: WritableSignal<Category[]>;

  public imgUrl = config.IMG_URL;
  public competitionForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
    competition: new FormControl('', [Validators.required]),
    format: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    season: new FormControl('', [Validators.required]),
  });

  private _competitionState = inject(CompetitionStateService);
  private _competitionService = inject(CompetitionService);
  private _competitionCategoryService = inject(CompetitionCategoryService);
  private _areFormValuesInitalized = false;
  private _globalModalService = inject(GlobalModalService);

  constructor() {
    effect(() => {
      const competition = this._competitionState.competitions();
      if (this._areFormValuesInitalized === false && competition) {
        const formControls = this.competitionForm.controls;

        formControls.name.setValue(competition.name);
        formControls.organization.setValue(
          String(competition.organization?.id_organization)
        );
        formControls.competition.setValue(
          competition.competitionType?.name || ''
        );

        formControls.format.setValue(competition?.format);
        formControls.category.setValue(
          String(competition.competitionCategory.category?.id_category)
        );
        formControls.season.setValue(
          competition?.competitionCategory?.season || ''
        );
        this._areFormValuesInitalized = true;
        console.log('INITIALIZED');
      }
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    console.log(this.competitionForm.value);

    const competitionCategoryMustBeUpadated =
      this._checkIfCompetitionCategoryMustBeUpdated();
    if (competitionCategoryMustBeUpadated) {
      this._updateCompetitionCategory();
    }

    const competitionMustBeUpdated = this.checkIfOrganizationMustBeUpdated();
    if (competitionMustBeUpdated) {
      this._updateCompetition();
    }
  }

  private _checkIfCompetitionCategoryMustBeUpdated(): boolean {
    const competition = this._competitionState.competitions();
    const season = competition?.competitionCategory?.season;
    const category_id = String(
      competition?.competitionCategory?.category?.id_category
    );
    return (
      season !== this.competitionForm.controls.season.value ||
      category_id !== this.competitionForm.controls.category.value
    );
  }
  private _updateCompetitionCategory() {
    const dataToUpdate: Partial<CompetitionCategory> = {};
    const competition = this._competitionState.competitions();
    const season = competition?.competitionCategory?.season;
    const category_id = String(
      competition?.competitionCategory?.category?.id_category
    );

    const competitionCategoryId =
      this._competitionState.competitions()?.competitionCategory
        .competition_category_id;

    if (season !== this.competitionForm.controls.season.value) {
      dataToUpdate.season =
        this.competitionForm.controls.season.value || undefined;
    }

    if (category_id !== this.competitionForm.controls.category.value) {
      dataToUpdate.category_id = Number(
        this.competitionForm.controls.category.value
      );
    }

    this._competitionCategoryService
      .updateCompetitionCategory(dataToUpdate, Number(competitionCategoryId))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  private checkIfOrganizationMustBeUpdated(): boolean {
    const competition = this._competitionState.competitions();
    const name = competition?.name;
    const format = competition?.format;
    const competition_type_id =
      competition?.competitionType?.id_competition_type;
    const organization_id = String(competition?.organization?.id_organization);

    return (
      name !== this.competitionForm.controls.name.value ||
      format !== this.competitionForm.controls.format.value ||
      competition_type_id !==
        Number(this.competitionForm.controls.competition.value) ||
      organization_id !== this.competitionForm.controls.organization.value
    );
  }

  private _updateCompetition() {
    const dataToUpdate: Partial<Competition> = {};
    const competition = this._competitionState.competitions();

    if (competition?.name) {
      dataToUpdate.name = this.competitionForm.controls.name.value || '';
    }
    if (competition?.format) {
      dataToUpdate.format = this.competitionForm.controls.format
        .value as CompetitionFormat;
    }
    // if (competition?.competitionType?.id_competition_type) {
    //   dataToUpdate.competition_type_id =
    //     competition?.competitionType?.id_competition_type;
    // }
    if (competition?.organization?.id_organization) {
      dataToUpdate.organization_id = competition?.organization?.id_organization;
    }
    console.log({ dataToUpdate });
    if (competition?.id_competition) {
      this._competitionService
        .updateCompetition(dataToUpdate, Number(competition?.id_competition))
        .subscribe({
          next: (res) => {
            console.log(res);
            this._globalModalService.openModal(
              'Competición actualizada correctamente',
              ''
            );
          },
          error: (err) => {
            console.log(err);
            this._globalModalService.openModal('Error', err.error.message);
          },
        });
    }
  }
}
