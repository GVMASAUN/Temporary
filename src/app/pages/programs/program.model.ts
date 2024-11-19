import { EventGroup } from './event-group.model';

export enum DialogMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  SUMMARY = 'SUMMARY'
}


export enum ProgramType {
  REAL_TIME = 1,
  BATCH = 3
}

export enum ProgramTypeDesc {
  REAL_TIME = 'Real Time',
  BATCH = 'Batch'
}

export enum ProgramStep {
  SUMMARY = 'Summary',
  BASICS = 'Basics',
  EVENT_GROUPS = 'Event Groups',
  VISUAL_BUILDER = 'Visual Builder'
}











export class Program {
  communityCode: null | string = null;
  programStageId: null | number = null;
  programId: null | number = null;
  programName: null | string = null;
  programType: null | string = null;
  programDescription: null | string = null;
  generalEligibleAccountsId: null | number = null;
  programBudget = null;
  segmentEnabled = null;
  eligibleAccountsSegmentId: null | number = null;
  programLevelActionEnabled = null;
  epmResponseFlowEnabled = null;
  programStructureMapId: null | number = null;
  programStructureMap: null | any = null;
  programStartDate: null | any = null;
  programEndDate: null | any = null;
  createdDate: null | any = null;
  modifiedDate: null | any = null;
  versionNumber: null | number = null;
  startDate: null | any = null;
  endDate: null | any = null;
  programTypeName: null | string = null;

  eventGroupList: EventGroup[] = [];

  // for UI Only
  programStructureMapName: null | number = null;

  constructor() {
    this.programStructureMapId = 2;
  }
}


