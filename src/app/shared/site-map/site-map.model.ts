import { Node } from '@swimlane/ngx-graph';

export enum SiteMapLevel {
    ROOT,
    CHILD,
    LEAF
}

export interface SiteMapNodeDTO {
    path: string | null;

    nodeLevel?: SiteMapLevel;
    navIndex: number; // Added the navIndex variable to select the navigation 'tab' when the URL changes from the site-map node.

    icon?: string;

    nodeEntityData?: any;
    name?: string | null;
}

export interface SiteMapNode extends Node {
    data: SiteMapNodeDTO;
}