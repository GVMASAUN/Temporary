import { DAY_END_TIME, DAY_START_TIME } from "src/app/core/constants"
import { StatusCode } from "src/app/core/models/status.model"
import { Event } from "./event.model"
import { DialogMode, Program } from "./program.model"
import { Data } from "@angular/router";


export enum EventGroupStep {
    SUMMARY = 'Summary',
    BASICS = 'Basics',
    EVENTS = 'Events',
    HISTORY = 'History',
    DETAILS = 'Details'
}

export enum EventGroupType {
    PUBLISHED = 'Published',
    UNPUBLISHED = 'Unpublished'
}

export enum EntityType {
    Event_Group = 2,
    Event,
    Action
}

export enum EventGroupHistoryActionType {
    Create = 'Create',
    Update = 'Update'
}

export enum EntityDesc {
    Event_Group = 'Event Group',
    Event = 'Event',
    Action = 'Action'
}

export const ENTITY_DESC = {
    [EntityType.Event_Group]: EntityDesc.Event_Group,
    [EntityType.Event]: EntityDesc.Event,
    [EntityType.Action]: EntityDesc.Action
}

export class EventGroupDialogConfig {
    dialogMode!: DialogMode;
    eventGroup!: EventGroup;
    program!: Program;
    selectedEventGroupVersion!: EventGroupVersion | null;
    isDraftAvailable?: boolean;

    constructor(
        dialogMode: DialogMode,
        eventGroup: EventGroup,
        program: Program,
        selectedEventGroupVersion: EventGroupVersion | null,
        isDraftAvailable?: boolean
    ) {
        this.dialogMode = dialogMode;
        this.eventGroup = eventGroup;
        this.program = program;
        this.selectedEventGroupVersion = selectedEventGroupVersion;
        this.isDraftAvailable = isDraftAvailable;
    }
}

export interface EventGroupVersion {
    eventGroupId: number
    workflowVersionNumber: number
    vopOfferId: number
    eventGroupName: string
    eventGroupDescription: any
    eventGroupType: string
    startDate: any
    endDate: any
    eventGroupStatusCode: number
    statusName: string
    modifiedDate: string
    hasDraft: boolean
    publishedVersion: boolean
}


export class EventGroup {
    communityCode: null | string = null;
    communityBID: null | string = null;
    eventGroupId: null | number = null;
    eventGroupTemplateId: null | number = null;
    vopOfferId: null | number = null;
    eventGroupName: null | string = null;
    eventGroupDescription: null | string = null;
    eventGroupType: null | any = null;
    eventGroupStartDate: null | any = null;
    eventGroupEndDate: null | any = null;
    eventGroupStatusCode: StatusCode = StatusCode.DRAFT;
    eventGroupStatus: null | string = null;
    isReusable = null;
    uiStructurePos: null | number = null;
    createdDate: null | string = null;
    modifiedDate: null | string = null;
    workflowVersionNumber: null | number = null;
    versionNumber: null | number = null;
    startDate: null | string = null;
    endDate: null | string = null;
    statusName: null | string = null;
    programStageId: null | number = null;
    hasDraft: null | boolean = null;
    publishedStatus: null | StatusCode = null;
    publishedVersion: null | boolean = null;
    modifiedUserId: null | string = null;
    archived: boolean = false;

    errorMessages: errorMessage[] = [];
    eventStageList: Event[] = [];

    // for UI only
    formattedStartDate: null | any = null;
    formattedEndDate: null | any = null;

    startTime: any = DAY_START_TIME;
    endTime: any = DAY_END_TIME;
}

export class errorMessage {
    errorCode: string | null = null;
    errorMessage: string | null = null;
    targetId: string | null = null;
    responseStatusDetails: string | null = null;
}

export class EventGroupHistory {
    communityCode: null | string = null;
    communityBID: null | string = null;
    id: null | number = null;
    entityId: null | number = null;
    parentEntityId: null | number = null;
    entityType!: EntityType;
    actionType: null | string = null;
    entityName: null | string = null;
    workflowVersionNumber: null | number = null;
    modifiedUserId: null | string = null;
    modifiedUseFullName: null | string = null;
    modefiedDate: null | Data = null;
    historyMessages: null | string[] = [];
}