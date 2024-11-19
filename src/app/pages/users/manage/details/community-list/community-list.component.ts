import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { SearchTableColumn, SearchTableColumnType, SortType } from 'src/app/shared/search-table/search-table.model';
import { VisaIcon } from 'src/app/core/constants';
import { CommunityLevel } from '../../../user.model';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrls: ['./community-list.component.scss']
})
export class CommunityListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  VisaIcon = VisaIcon;
  SortType = SortType;

  bid!: string;


  communityList: CommunityLevel[] = [];

  tableColumns: SearchTableColumn[] = [
    {
      key: 'parentCommunityCode',
      label: 'Community Group',
      fixed: true
    },
    {
      key: 'communityCode',
      label: 'Community Code'
    },
    {
      key: 'communityDescription',
      label: 'Description'
    },
    {
      key: 'refreshedTimestamp',
      label: 'Effective Date',
      type: SearchTableColumnType.DATE
    }
  ];

  constructor(
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<CommunityListComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => { this.close(); }
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private init() {
    const data = this.dialogConfig;

    if (data) {
      this.communityList = data?.communityLevels;
      this.bid = data?.bid;
    }
  }

  ngOnInit(): void {
    this.init();
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
