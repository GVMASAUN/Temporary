import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Edge, Layout, Orientation } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout } from './dagre-nodes-only-layout';
import * as shape from 'd3-shape';
import { MenuData, SiteMapLevel, SiteMapNode, SiteMapNodeDTO } from './site-map.model';
import { ButtonColor, ButtonIconType } from '@visa/vds-angular';
import { Utils } from 'src/app/services/utils';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY } from 'src/app/core/constants';
import { Router } from '@angular/router';
import { merge } from 'lodash';
import { NavStatusService } from 'src/app/services/nav-status/nav-status.service';

@Component({
  selector: 'app-site-map',
  templateUrl: './site-map.component.html',
  styleUrls: ['./site-map.component.scss']
})

export class SiteMapComponent implements OnInit {
  menuData!: MenuData[];

  ButtonColor = ButtonColor;
  ButtonIconType = ButtonIconType;
  NODE_LEVEL = SiteMapLevel;

  layout: Layout = new DagreNodesOnlyLayout();

  layoutSettings = {
    orientation: Orientation.TOP_TO_BOTTOM,
    rankPadding: 100,
  };

  graphData: any = {};

  center$: Subject<boolean> = new Subject();
  update$: Subject<boolean> = new Subject();

  nodes: SiteMapNode[] = [];
  links: Edge[] = [];

  curve: any = shape.curveLinear;

  private randomNodeId: number = Utils.generateNumberId();

  private rootNode: SiteMapNode = this.createNode(
    this.getIncrementedNodeId(),
    EMPTY,
    {
      nodeLevel: SiteMapLevel.ROOT,
      path: EMPTY,
      navIndex: 0
    },
  );

  @HostListener("window:keyup.esc")
  onKeyUp(): void {
    this.close();
  }

  constructor(
    private router: Router,
    private navStatus: NavStatusService,
    private dialogRef: MatDialogRef<SiteMapComponent>,
    @Inject(MAT_DIALOG_DATA) private dialogConfig: any
  ) { }

  ngOnInit(): void {
    this.init();
  }

  private init() {
    this.menuData = this.dialogConfig.menuData;

    this.setRootNode();
    this.parseTemplateSiteMap();
  }

  private setRootNode() {
    this.menuData.forEach((menu: any) => {

      if (menu.root) {
        this.rootNode = this.createNode(
          this.getIncrementedNodeId(),
          menu.title,
          {
            nodeLevel: SiteMapLevel.CHILD,
            path: menu.url,
            navIndex: 0
          });
      }
    })
  }

  private addNodeInGraph(sourceNode: SiteMapNode, destinationNode: SiteMapNode) {
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

  private parseTemplateSiteMap() {
    this.nodes = [this.rootNode];
    this.links = [];

    this.menuData.forEach((menu: any, index: number) => {

      if (!menu.root) {
        const node = this.createNode(
          this.getIncrementedNodeId(),
          menu.title,
          {
            nodeLevel: SiteMapLevel.CHILD,
            path: menu.url,
            navIndex: index
          });
    
        this.addNodeInGraph(this.rootNode, node);
    
        if (menu.childData) {
          menu.childData.forEach((child: any) => {
            const childNode = this.createNode(
              this.getIncrementedNodeId(),
              child.title,
              {
                nodeLevel: SiteMapLevel.LEAF,
                path: child.url,
                navIndex: index
              })
    
            this.addNodeInGraph(node, childNode);
          });
        }
      }
    })
  }

  private getIncrementedNodeId(): string {
    this.randomNodeId++;

    return this.randomNodeId.toString();
  }

  handleNodeClick(currentNode: SiteMapNode) {
    const path = currentNode.data.path;
    const navIndex = currentNode.data.navIndex!;

    if (path) {
      this.close();
      this.navStatus.setTabIndex(navIndex);
      this.router.navigate([path], {queryParamsHandling: 'merge'});
    }
  }

  close() {
    this.dialogRef.close();
  }

}
