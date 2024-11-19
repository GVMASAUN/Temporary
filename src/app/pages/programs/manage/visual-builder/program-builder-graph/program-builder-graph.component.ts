import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Edge, Layout, Orientation } from '@swimlane/ngx-graph';
import { ButtonColor, TooltipPosition } from '@visa/vds-angular';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { ELLIPSIS, EMPTY, VisaImage } from 'src/app/core/constants';
import { ProgramService } from 'src/app/services/program/program.service';
import { FunctionsService } from 'src/app/services/util/functions.service';
import { Utils } from 'src/app/services/utils';
import { EventActionFulfillmentMonetaryType, EventActionType } from '../../../event.model';
import { Program } from '../../../program.model';
import { DagreNodesOnlyLayout } from './dagre-nodes-only-layout';
import { PROGRAM_BUILDER_LEVEL_DESC, PROGRAM_BUILDER_LEVEL_ICON, PROGRAM_BUILDER_TEMPLATE_NODE_NAME, ProgramBuilderLevel, ProgramBuilderNodeType, ProgramVisualBuilderNode, ProgramVisualBuilderNodeDTO, ProgramVisualBuilderNodeSelection } from './program-builder-graph.model';

@Component({
  selector: 'app-program-builder-graph',
  templateUrl: './program-builder-graph.component.html',
  styleUrls: ['./program-builder-graph.component.scss']
})
export class ProgramBuilderGraphComponent implements OnInit {
  @Input()
  panning: boolean = true;

  @Input()
  zoomLevel: number = 1.0;

  @Input()
  programData!: Program;

  @Output()
  onNodeClick: EventEmitter<ProgramVisualBuilderNodeSelection> = new EventEmitter<ProgramVisualBuilderNodeSelection>();

  ButtonColor = ButtonColor;
  NODE_TYPE = ProgramBuilderNodeType;
  NODE_LEVEL = ProgramBuilderLevel;
  TOOLTIP_POSITION = TooltipPosition;
  VisaImage = VisaImage;

  MAX_DESCRIPTION_LENGTH = 25;

  graphData: any = {};

  center$: Subject<boolean> = new Subject();
  update$: Subject<boolean> = new Subject();


  nodes: ProgramVisualBuilderNode[] = [];
  links: Edge[] = [];

  curve: any = shape.curveLinear;
  layout: Layout = new DagreNodesOnlyLayout();

  layoutSettings = {
    orientation: Orientation.LEFT_TO_RIGHT,
    rankPadding: 80,
  };

  private programStructureMap: any = {};

  private randomNodeId: number = Utils.generateNumberId();


  private readonly rootNode: ProgramVisualBuilderNode = this.createNode(
    this.getIncrementedNodeId(),
    EMPTY,
    {
      nodeType: ProgramBuilderNodeType.ROOT,
      icon: VisaImage.FLAG,
    },
  );

  constructor(
    private programService: ProgramService,
    private functionService: FunctionsService
  ) { }

  ngOnInit(): void {
    this.setProgramStructureMap();

    this.parseTemplateGraphData();
    this.parseGraphData();
  }

  private setProgramStructureMap() {
    this.programStructureMap = JSON.parse(this.programData?.programStructureMap);
  }

  private addNodeInGraph(sourceNode: ProgramVisualBuilderNode, destinationNode: ProgramVisualBuilderNode) {
    this.nodes.push(destinationNode);

    this.links.push(this.createEdge(sourceNode.id, destinationNode.id));
  }

  private parseTemplateGraphData() {
    this.nodes = [this.rootNode];
    this.links = [];

    const eventGroupGraphStructureList: any[] = this.programStructureMap?.audience_segment?.event_groups || [];

    eventGroupGraphStructureList.forEach((groupStructure: any) => {
      const eventGroupNode = this.getNewNodeByLevel(ProgramBuilderLevel.EVENT_GROUP, groupStructure);

      this.addNodeInGraph(this.rootNode, eventGroupNode);



      const eventGraphStructureList: any[] = groupStructure.events || [];

      eventGraphStructureList.forEach((eventStructure: any) => {
        const eventNode = this.getNewNodeByLevel(ProgramBuilderLevel.EVENTS, eventStructure);

        this.addNodeInGraph(eventGroupNode, eventNode);



        const eventActionGraphStructureList: any[] = eventStructure.actions || [];

        eventActionGraphStructureList.forEach((eventActionStructure: any) => {
          const actionNode = this.getNewNodeByLevel(ProgramBuilderLevel.ACTIONS, eventActionStructure);

          this.addNodeInGraph(eventNode, actionNode);
        });
      });
    });

    this.updateGraphState();
  }

  private removeTemplateNode() {
    const eventGroupGraphStructureList: any[] = this.programStructureMap?.audience_segment?.event_groups || [];

    const eventGroups = this.programData?.eventGroupList;

    if (eventGroupGraphStructureList.length < eventGroups.length) {
      const removableTemplateNodeIds = this.nodes.filter(node => [ProgramBuilderLevel.EVENTS, ProgramBuilderLevel.ACTIONS].includes(node.data.nodeLevel!) &&
        !node.data?.nodeEntityData &&
        node.data.nodeType !== ProgramBuilderNodeType.LEAF)
        .map(node => node.id);

      this.links = this.links.filter(link => !(removableTemplateNodeIds.includes(link.source) || removableTemplateNodeIds.includes(link.target)));
      this.nodes = this.nodes.filter(node => !removableTemplateNodeIds.includes(node.id));
    }
  }

  private insertNodes(
    identityKey: string,
    level: ProgramBuilderLevel,
    sourceNode: ProgramVisualBuilderNode,
    entities: any[],
    updateNodeData: Function,
    callback: (sourceNode: ProgramVisualBuilderNode, entity: any) => any
  ) {
    if (sourceNode && Utils.isNotNull(entities)) {
      entities = Utils.sortArray(entities, identityKey);

      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        entity.uiStructurePos = index;

        let targetNode: ProgramVisualBuilderNode | undefined = this.getNodeByStructurePosition(
          level,
          entity.uiStructurePos,
          sourceNode
        );

        if (!targetNode) {
          targetNode = this.getNewNodeByLevel(level);

          this.addNodeInGraph(sourceNode, targetNode);
        }

        updateNodeData(entity, targetNode);

        if (index === (entities.length - 1)) {
          this.addPlusNode(sourceNode!, level);
        }

        callback(targetNode, entity);
      }
    } else {
      if (!this.links.some(link => link.source === sourceNode!.id)) {
        this.addNodeInGraph(sourceNode, this.getNewNodeByLevel(level));
      }
    }
  }

  private parseGraphData() {
    if (!!this.programData) {
      this.insertNodes(
        "eventGroupName",
        ProgramBuilderLevel.EVENT_GROUP,
        this.rootNode,
        this.programData?.eventGroupList,
        (eventGroup: any, targetNode: ProgramVisualBuilderNode) => {
          targetNode.data.nodeEntityData = eventGroup;

          targetNode.data.name = eventGroup.eventGroupName;
        },
        (eventGroupSourceNode: ProgramVisualBuilderNode, eventGroup: any) => {
          this.insertNodes(
            "eventName",
            ProgramBuilderLevel.EVENTS,
            eventGroupSourceNode,
            eventGroup?.eventStageList,
            (event: any, targetNode: ProgramVisualBuilderNode) => {
              targetNode.data.nodeEntityData = event;

              targetNode.data.type = event.eventType;
              targetNode.data.name = event.eventName;
              targetNode.data.description = event.eventDescription;
            },
            (eventSourceNode: ProgramVisualBuilderNode, event: any) => {
              this.insertNodes(
                "eventActionName",
                ProgramBuilderLevel.ACTIONS,
                eventSourceNode,
                event?.eventActions,
                (action: any, targetNode: ProgramVisualBuilderNode) => {

                  targetNode.data.nodeEntityData = action;

                  targetNode.data.name = action.eventActionName;
                  targetNode.data.type = action.eventActionType;

                  targetNode.data.description = action.eventActionType !== EventActionType.StatementCredit
                    ? action.endpointMessageName
                    : EventActionFulfillmentMonetaryType.Pct === action.fulfillmentMonetaryType
                      ? 'Percent'
                      : action.fulfillmentMonetaryType === EventActionFulfillmentMonetaryType.Fixed
                        ? 'Fixed'
                        : null;
                },
                (sourceNode: ProgramVisualBuilderNode, entity: any) => { }
              );
            }
          );
        }
      );
    }

    this.decorateNodes();

    this.updateGraphState();
  }

  private getNewNodeByLevel(level: ProgramBuilderLevel, structureConfig: any = null): ProgramVisualBuilderNode {
    return this.createNode(
      this.getIncrementedNodeId(),
      PROGRAM_BUILDER_LEVEL_DESC[level],
      {
        nodeType: ProgramBuilderNodeType.CHILD,
        nodeLevel: level,
        name: PROGRAM_BUILDER_TEMPLATE_NODE_NAME[level],
        icon: PROGRAM_BUILDER_LEVEL_ICON[level],
        structureConfig: structureConfig
      }
    );
  }

  private createNode(id: string, label: string, nodeData: ProgramVisualBuilderNodeDTO): ProgramVisualBuilderNode {
    return (
      {
        id: id,
        label: label,
        data: nodeData,
      }
    );
  }

  private createEdge(sourceId: string, destinationId: string): Edge {
    return (
      {
        source: sourceId,
        target: destinationId
      }
    );
  }

  private updateGraphState() {
    this.update$.next(true);
    this.center$.next(true);
  }

  private getIncrementedNodeId(): string {
    this.randomNodeId++;

    return this.randomNodeId.toString();
  }

  private addPlusNode(targetNode: ProgramVisualBuilderNode, level: ProgramBuilderLevel) {
    if ([ProgramBuilderLevel.EVENTS, ProgramBuilderLevel.ACTIONS].includes(level)
      && (
        (!!targetNode?.data?.nodeEntityData?.eventTemplateId) ||
        (!!targetNode?.data?.nodeEntityData?.eventGroupTemplateId)
      )
    ) {
      return;
    }


    const plusNode = this.createNode(
      this.getIncrementedNodeId(),
      EMPTY,
      {
        nodeLevel: level,
        nodeType: ProgramBuilderNodeType.LEAF,
        icon: VisaImage.PLUS
      }
    )

    this.addNodeInGraph(targetNode, plusNode);
  }

  private decorateNodes() {
    this.nodes.forEach(programVisualBuilderNode => {
      programVisualBuilderNode.data.fullName = programVisualBuilderNode.data.name!;
      programVisualBuilderNode.data.name = this.functionService.truncateString(programVisualBuilderNode.data.name || EMPTY, this.MAX_DESCRIPTION_LENGTH, ELLIPSIS);
      programVisualBuilderNode.data.description = this.functionService.truncateString(programVisualBuilderNode.data.description || EMPTY, 20, ELLIPSIS);
      programVisualBuilderNode.data.type = this.functionService.truncateString(programVisualBuilderNode.data.type || EMPTY, 12, ELLIPSIS);
    });
  }

  private getNodeByStructurePosition(
    level: ProgramBuilderLevel,
    uiStructurePos: number | null,
    sourceNode: ProgramVisualBuilderNode
  ): ProgramVisualBuilderNode | undefined {
    const destinationNodeIds = this.links?.filter(l => l.source === sourceNode.id)?.map(l => l.target);

    return this.nodes
      .find(programVisualBuilderNode => programVisualBuilderNode.data.nodeLevel === level &&
        programVisualBuilderNode?.data?.structureConfig?.display_index === uiStructurePos &&
        destinationNodeIds.includes(programVisualBuilderNode.id)
      );
  }

  isNodeDisabled(node: ProgramVisualBuilderNode): boolean {
    const sourceNodeId = this.links.find(link => link.target === node.id)?.source;

    const sourceNode: ProgramVisualBuilderNode = this.nodes
      .find(node => node.id === sourceNodeId &&
        [ProgramBuilderLevel.EVENT_GROUP, ProgramBuilderLevel.EVENTS].includes(node.data.nodeLevel!))!;

    if (!sourceNode?.data?.nodeEntityData && node?.data?.nodeLevel !== this.NODE_LEVEL.EVENT_GROUP) {
      return true;
    }

    return false;
  }

  handleNodeClick(currentNode: ProgramVisualBuilderNode) {
    const sourceNodeId = this.links.find(link => link.target === currentNode.id)?.source;

    const sourceNode: ProgramVisualBuilderNode = this.nodes
      .find(node => node.id === sourceNodeId &&
        [ProgramBuilderLevel.EVENT_GROUP, ProgramBuilderLevel.EVENTS].includes(node.data.nodeLevel!))!;

    const grandParentNodeId = sourceNode ? this.links.find(link => link.target === sourceNode.id)?.source : null;
    this.onNodeClick.emit(
      {
        eventGroupNode: !!grandParentNodeId
          ? this.nodes
            .find(node => node.id === grandParentNodeId)!
          : null,
        parentNode: sourceNode,
        currentNode: currentNode
      }
    );
  }
}
