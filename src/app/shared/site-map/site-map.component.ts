import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Edge, Layout, Orientation } from '@swimlane/ngx-graph';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import * as shape from 'd3-shape';
import { Subject, takeUntil } from 'rxjs';
import { EMPTY, VisaIcon } from 'src/app/core/constants';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { IMenuItem } from 'src/app/services/interfaces/menu.model';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';
import { Utils } from 'src/app/services/utils';
import { DagreNodesOnlyLayout } from './dagre-nodes-only-layout';
import { SiteMapLevel, SiteMapNode, SiteMapNodeDTO } from './site-map.model';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss']
})

export class SiteMapComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private randomNodeId: number = Utils.generateNumberId();

  private rootNode: SiteMapNode = this.createNode(
    this.getIncrementedNodeId(),
    'Home',
    {
      nodeLevel: SiteMapLevel.ROOT,
      path: EMPTY,
      navIndex: 0
    },
  );

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  NODE_LEVEL = SiteMapLevel;
  VisaIcon = VisaIcon;

  layout: Layout = new DagreNodesOnlyLayout();
  curve: any = shape.curveLinear;

  layoutSettings = {
    orientation: Orientation.TOP_TO_BOTTOM,
    rankPadding: 100,
  };

  graphData: any = {};

  center$: Subject<boolean> = new Subject();
  update$: Subject<boolean> = new Subject();

  menuData!: IMenuItem[];
  nodes: SiteMapNode[] = [];
  links: Edge[] = [];

  constructor(
    private router: Router,
    private navStatus: NavStatusService,
    private dialogService: DialogService,
    private dialogRef: MatDialogRef<SiteMapComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) {
    this.dialogService.setDialogEventListeners(
      this.dialogRef,
      () => this.close()
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private init(): void {
    this.menuData = this.dialogConfig.menuData;

    this.parseTemplateSiteMap();
  }

  private addNodeInGraph(sourceNode: SiteMapNode, destinationNode: SiteMapNode): void {
    this.nodes.push(destinationNode);

    this.links.push(this.createEdge(sourceNode.id, destinationNode.id));
  }

  private createNode(id: string, label: string, nodeData: SiteMapNodeDTO): SiteMapNode {
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

  private parseTemplateSiteMap(): void {
    this.nodes = [this.rootNode];
    this.links = [];

    this.menuData.forEach((menu: IMenuItem, index: number) => {
      const node = this.createNode(
        this.getIncrementedNodeId(),
        menu.module.uiName,
        {
          nodeLevel: SiteMapLevel.CHILD,
          path: menu.module.baseUrl,
          navIndex: index
        });

      this.addNodeInGraph(this.rootNode, node);

      if (menu.module.siteMapData) {
        menu.module.siteMapData.forEach((child: { pageTitle: string, pageUrl: string }) => {
          const childNode = this.createNode(
            this.getIncrementedNodeId(),
            child.pageTitle,
            {
              nodeLevel: SiteMapLevel.LEAF,
              path: child.pageUrl,
              navIndex: index
            })

          this.addNodeInGraph(node, childNode);
        });
      }
    });
  }

  private getIncrementedNodeId(): string {
    this.randomNodeId++;

    return this.randomNodeId.toString();
  }

  ngOnInit(): void {
    this.init();
  }

  handleNodeClick(currentNode: SiteMapNode): void {
    const path = currentNode.data.path;
    const navIndex = currentNode.data.navIndex!;

    if (path) {
      this.close();
      this.navStatus.setTabIndex(navIndex);
      this.router.navigate([path], { queryParamsHandling: 'merge' });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
