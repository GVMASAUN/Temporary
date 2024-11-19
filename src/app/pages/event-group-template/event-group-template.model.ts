import { EventGroup, EventGroupStep } from "../programs/event-group.model";
import { CriteriaValues, Event } from "../programs/event.model";
import { DialogMode } from "../programs/program.model";

export enum EventGroupTemplateWorkflowAutomationType {
  None,
  AutoApprove,
  AutoApproveAndPublish
}

export const EventGroupTemplateWorkflowAutomationTypeDesc = {
  [EventGroupTemplateWorkflowAutomationType.None]: 'None',
  [EventGroupTemplateWorkflowAutomationType.AutoApprove]: 'Auto Approve',
  [EventGroupTemplateWorkflowAutomationType.AutoApproveAndPublish]: 'Auto Approve & Publish',
}

export interface EventGroupByTemplateDialogConfig {
  dialogMode: DialogMode,
  programStageId: number,
  eventGroupId: number,
  eventGroupTemplateId: number | null,
  workflowVersionNumber?: number,
  isPublished?: boolean,
  expandEvents?: boolean,
  expandedEventIndex?: number,
  viewId?: string,
  selectTab?: EventGroupStep
}

export class EventGroupTemplate extends EventGroup {
  previouslyApproved: boolean = false;
  workflowType: EventGroupTemplateWorkflowAutomationType | null = null;

  eventTemplateList: EventTemplate[] = [];
}

export class EventGroupTemplateMessage {
  communityCode: string | null = null;
  communityBID: string | null = null;
  id: number | null = null;
  entityId: number | null = null;
  parentEntityId: number | null = null;
  entityType: number | null = null;
  comment: string | null = null;
  workflowVersionNumber: number | null = null;
  commentCreatedDate: string | null = null;
  createdUserId: string | null = null;
  createdUserFullName: string | null = null;
  createdDate: string | null = null;
}

export class EventTemplate extends Event {
  eventGroupTemplateId: number | null = null;
  eventDependentRuleValue: string | null = null;
  eventDependentDeadline: string | null = null;
  reuseDependency: any = null;
  eventDependentDeadlineDTO?: EventDependentDeadlineDto
}

export class EventConditionTemplate {
  communityCode: string | null = null;
  communityBID: any = null;
  id: number | null = null;
  eventTemplateId: number | null = null;
  eventAttributeId: number | null = null;
  eventRuleOperator: string | null = null;
  eventRuleOperatorLocked: boolean = false;
  eventRulePropertyValLocked: boolean = false
  createdDateAsString: string | null = null;
  attributeCategory: string | null = null;
  attributeDisplayName: string | null = null;
  attributeType: string | null = null;
  requiredAttributeIds?: string | null = null;
  compoundField: boolean = false;
  criteriaValues: CriteriaValues | null = null;
}

export class CriteriaValue {
  id: string | null = null;
  value?: string | null = null;
  label: string | null = null;
  category: any = null;
  subCategory: any = null;
  referenceData: boolean = false;
}

export class EventAction {
  communityCode: string | null = null;
  communityBID: any = null;
  id: number | null = null;
  eventTemplateId: number | null = null;
  eventActionName: string | null = null;
  eventActionTypeId: number | null = null;
  eventActionType: any = null;
  endpointMessageId?: string | null = null;
  endpointMessageName: any = null;
  endpointMessageNameLocked?: boolean
  endpointUrlName?: string | null = null;
  notifyMessageFirst?: string | null = null;
  notifyMessageEvery: any = null;
  notifyMessageMax: any = null;
  fulfillmentMonetaryType?: string | null = null;
  fulfillmentMonetaryValue?: string | null = null;
  fulfillmentCurrency?: string | null = null;
  fulfillmentConstraint?: string | null = null;
  fulfillmentConstraintCurrency?: string | null = null;
  merchantCity?: string | null = null;
  merchantDescriptor?: string | null = null;
  amountType?: string | null = null;
  activeIndicator: boolean = false;
  uiStructurePos: number | null = null;
  versionNumber: number | null = null;
  formattedLastModifiedDate: string | null = null;
  notificationDelayValue?: NotificationDelayValue
  epmSystemDefinedFields?: string | null = null;
  customFieldValueList: CustomFieldValueList[] = [];
}

export class NotificationDelayValue {
  days: number | null = null;
  hours: number | null = null;
  minutes: number | null = null;
}

export class CustomFieldValueList {
  key: string | null = null;
  value: string | null = null;
}

export class EventDependentDeadlineDto {
  communityCode: string | null = null;
  communityBID: any = null;
  eventStageId: number | null = null;
  eventName: any = null;
  eventGroupId: number | null = null;
  eventTypeId: number | null = null;
  eventTypeName: any = null;
  executeActionIf: string | null = null;
  executeActionIfNumber: number | null = null;
  hasEventPrerequisiteDeadline: boolean = false;
  eventDependentDeadline: EventDependentDeadline | null = null;
  eventPrerequisites: EventPrerequisite[] = [];
}

export class EventDependentDeadline {
  days: number | null = null;
  hours: number | null = null;
  minutes: number | null = null;
}

export class EventPrerequisite {
  dependentEventStageId: number | null = null;
  dependentEventName: string | null = null;
  dependentEventTypeId: number | null = null;
  dependentEventTypeName: string | null = null;
  prerequisite: boolean = false
  reuseDependency: boolean = false;
  eventStageId: number | null = null;
  eventName: any = null;
}
