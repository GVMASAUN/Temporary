import { Node } from '@swimlane/ngx-graph';
import { VisaImage } from 'src/app/core/constants';

export type ProgramVisualBuilderNodeSelection = { eventGroupNode: ProgramVisualBuilderNode | null, parentNode: ProgramVisualBuilderNode, currentNode: ProgramVisualBuilderNode };

export enum ProgramBuilderNodeType {
    ROOT,
    CHILD,
    LEAF
}

export enum ProgramBuilderLevel {
    EVENT_GROUP = 1,
    EVENTS,
    ACTIONS
}

export const PROGRAM_BUILDER_LEVEL_DESC = {
    [ProgramBuilderLevel.EVENT_GROUP]: 'Event Group',
    [ProgramBuilderLevel.EVENTS]: 'Event',
    [ProgramBuilderLevel.ACTIONS]: 'Action'
};

export const PROGRAM_BUILDER_TEMPLATE_NODE_NAME = {
    [ProgramBuilderLevel.EVENT_GROUP]: 'Setup',
    [ProgramBuilderLevel.EVENTS]: 'Setup Event',
    [ProgramBuilderLevel.ACTIONS]: 'Setup Action'
};

export const PROGRAM_BUILDER_LEVEL_ICON = {
    [ProgramBuilderLevel.EVENT_GROUP]: VisaImage.FOLDER_2X,
    [ProgramBuilderLevel.EVENTS]: VisaImage.SCHEDULE_2X,
    [ProgramBuilderLevel.ACTIONS]: VisaImage.CONNECT_2X
};

export interface ProgramVisualBuilderNodeDTO {
    nodeType: ProgramBuilderNodeType;
    icon: VisaImage;

    nodeLevel?: ProgramBuilderLevel;
    nodeEntityData?: any;
    name?: string | null;
    fullName?: string;
    description?: string | null;
    type?: string | null;

    structureConfig?: any;
}

export interface ProgramVisualBuilderNode extends Node {
    data: ProgramVisualBuilderNodeDTO;
}