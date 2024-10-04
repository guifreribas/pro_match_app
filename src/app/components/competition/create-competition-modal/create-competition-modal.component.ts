import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
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
import { CompetitionTypes } from '../../../config/constants';
import { CategoryService } from '@app/services/api_services/category.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { CategoriesGetResponse, Category } from '@app/models/category';
import { GlobalModalService } from '@app/services/global-modal.service';
import { firstValueFrom } from 'rxjs';
import { Competition } from '@app/models/match';
import { postResponse } from '@app/models/api';
import { CompetitionWithDetails } from '@app/models/competition';

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
  public categoriesResponse = signal<CategoriesGetResponse | null>(null);
  public categories = signal<Category[]>([]);
  public isSubmitted = false;
  public isCreatingCompetition = signal(false);

  public competitionForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
    competition: new FormControl('', [Validators.required]),
    format: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    season: new FormControl('', [Validators.required]),
  });

  private _competitionService = inject(CompetitionService);
  private _categoryService = inject(CategoryService);
  private _userState = inject(UserStateService);
  private _globalModalService = inject(GlobalModalService);

  constructor() {}

  ngOnInit(): void {
    this._categoryService
      .getCategories({ user_id: this._userState.me()!.id_user, limit: 100 })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.categories.set(res.data.items);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  ngAfterViewInit(): void {
    this.formatSelect.nativeElement.disabled =
      this.competitionForm.controls['competition'].value !== '';
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    this.isCreatingCompetition.set(true);
    if (this.competitionForm.invalid) {
      this.isCreatingCompetition.set(false);
      return;
    }

    const formatControl = this.competitionForm.controls['competition']
      .value as keyof typeof CompetitionTypes;
    const competitionTypeId = CompetitionTypes[formatControl];

    const { organization, ...rest } = this.competitionForm.value;
    const formWithoutOrganization = rest;

    const competition = {
      competition_type_id: competitionTypeId,
      organization_id: Number(this.competitionForm.value.organization),
      is_initialized: false,
      category_id: this.competitionForm.value['category'],
      ...formWithoutOrganization,
    };

    await this.createCompetition(competition);
    this._globalModalService.openModal('Competición creada', '');
    this.competitionForm.reset();
    this.isCreatingCompetition.set(false);
  }

  async createCompetition(
    competition: any
  ): Promise<postResponse<CompetitionWithDetails> | null> {
    try {
      return await firstValueFrom(
        this._competitionService.createCompetitionFull(competition)
      );
    } catch (error) {
      console.log(error);
      this._globalModalService.openModal('Error', 'Ha ocurrido un error');
      this.isCreatingCompetition.set(false);

      return null;
    }
  }
}
