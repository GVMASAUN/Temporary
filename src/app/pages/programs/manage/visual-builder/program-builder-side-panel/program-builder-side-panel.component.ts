import { Component, OnInit } from '@angular/core';
import { ButtonColor, ButtonIconType, TabsOrientation, TooltipPosition } from '@visa/vds-angular';
import { Field } from 'src/app/shared/detail-view/detail-view.model';
import { EMPTY } from 'src/app/core/constants';
import { PROGRAM_BUILDER_LEVEL_DESC } from '../program-builder-graph/program-builder-graph.model';

@Component({
  selector: 'app-program-builder-side-panel',
  templateUrl: './program-builder-side-panel.component.html',
  styleUrls: ['./program-builder-side-panel.component.scss']
})
export class ProgramBuilderSidePanelComponent implements OnInit {
  TabsOrientation = TabsOrientation;
  ButtonColor = ButtonColor;
  ProgramBuilderLevelDesc = PROGRAM_BUILDER_LEVEL_DESC;
  ButtonIconType = ButtonIconType;
  TooltipPosition = TooltipPosition;

  fields: Field[] = [];

  data: any;

  panelExpended = false;

  panelTitle: string = EMPTY;

  name: string = EMPTY;

  panelTitleIcon!: string;

  actions: any[] = [];

  toggleButtonMenu: boolean = false;

  constructor() { }

  ngOnInit(): void { }

  onActionChange(selectedActions: any[]) {
    const action = selectedActions[0];

    if (action) {
      action.click(this.data);
    }

    this.toggleButtonMenu = false;
  }
}
