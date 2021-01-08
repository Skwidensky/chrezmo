import ForceGraph3D, { ForceGraph3DInstance } from "3d-force-graph";
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import * as THREE from "three";
import SpriteText from "three-spritetext";
import { State } from "../../state";

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements AfterViewInit, OnDestroy {
  g: ForceGraph3DInstance;
  highlightNodes: Set<any>;
  highlightLinks: Set<any>;
  hoverNode: any;
  querySub: Subscription;
  sPathSub: Subscription;
  public constructor(private logger: NGXLogger, private state: State) {
    var self = this;
    this.state = state;
    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;
    // Double-click anywhere to center camera on graph
    window.ondblclick = function (evt: any) {
      self.centerCamera();
    }
  }
  ngOnDestroy(): void {
    this.querySub.unsubscribe();
    this.sPathSub.unsubscribe();
  }
  // #region Private methods
  // Triggers some animated effects on a node and its links
  private updateHighlight(): void {
    // trigger update of highlighted objects in scene
    this.g
      .nodeColor(this.g.nodeColor())
      .linkWidth(this.g.linkWidth())
      .linkDirectionalParticles(this.g.linkDirectionalParticles())
      .linkDirectionalParticleSpeed(0.004);
  }
  // #endregion Private methods
  // #region Public methods
  // Load the Force Graph after the DOM is finished, otherwise it gets upset
  ngAfterViewInit(): void {
    this.initForceGraph();
    // Subscribe to Promises for normal queries
    this.querySub = this.state.queryPromiseObs().subscribe(p => { this.onPromise(p) });
    // Subscribe to shortest-path Promises
    this.sPathSub = this.state.shortestPathPromiseObs().subscribe(p => { this.onPromise(p) });
  }
  private onPromise(promise: Promise<any>) {
    this.logger.info("Promise received {}", promise);
    this.showLoader();
    this.drawGraphResult(promise);
  }
  // Draws query result --should probably go in graph.component.ts
  private drawGraphResult(result: Promise<any>) {
    var self = this;
    result.then(function (result: any) {
      const nodes = result.nodes;
      self.state.resetSourceNodes();
      Object.entries(nodes).forEach((key: any, value: any) => {
        if (self.state.getSubjects().includes(value.title)) {
          self.state.getSourceNodes().push(value.id);
        }
      });
      const links = result.links;
      const gData = { nodes: Object.values(nodes), links: links }
      self.graphData(gData);
      // Set the text for the query input
      self.state.setCurrentQuery(self.state.getSubjects()[0]);
      self.hideLoader();
    }).catch(function (error) {
      console.log(error);
    });
  }
  private hideLoader() {
    $("#loading").removeClass("loading-dot");
  }
  private showLoader() {
    $("#loading").addClass("loading-dot")
  }
  // Build and draw the graph based on the passed-in data
  graphData(data: any): void {
    // Cross-link node objects
    data.links.forEach((link: any) => {
      const a = data.nodes.find((node: any) => node.id == link.source);
      const b = data.nodes.find((node: any) => node.id == link.target);
      if (a != undefined && b != undefined) {
        !a.neighbors && (a.neighbors = []);
        !b.neighbors && (b.neighbors = []);
        a.neighbors.push(b);
        b.neighbors.push(a);

        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
      }
    });
    if (this.g == undefined) {
      this.initForceGraph();
    }
    this.g.graphData(data);
    this.changeForce(-400);
    this.setCooldownTicks(100);
  }
  // Center the rendered graph in the camera
  centerCamera(): void {
    this.g.zoomToFit();
  }
  // Change the d3 link force of the graph
  private changeForce(force: number): void {
    // This compile error is bullshit
    // @ts-ignore
    this.g.d3Force('charge').strength(force);
  }
  // How many frames the 3D-graph will use to settle in to place
  setCooldownTicks(ticks: number): void {
    this.g.cooldownTicks(ticks);
  }
  // #endregion Public methods
  // 3D-Force-Graph settings
  initForceGraph(): void {
    // #region Graph setup
    const elem = <HTMLElement>document.getElementById('3d-graph');
    var self = this;
    this.g = ForceGraph3D()(elem)
      .linkWidth(link => this.highlightLinks.has(link) ? 2 : 1)
      .linkDirectionalParticles(link => this.highlightLinks.has(link) ? 2 : 0)
      .linkDirectionalParticleWidth(2)
      .linkDirectionalArrowLength(3.5)
      .linkDirectionalArrowRelPos(1)
      .linkOpacity(0.05)
      .nodeAutoColorBy('neighbors')
      .onNodeHover((node: any) => {
        elem.style.cursor = node ? 'pointer' : 'default'
        // no state change
        if ((!node && !self.highlightNodes.size) || (node && self.hoverNode === node)) return;
        self.highlightNodes.clear();
        self.highlightLinks.clear();
        if (node) {
          self.highlightNodes.add(node);
          node.neighbors.forEach((neighbor: any) => self.highlightNodes.add(neighbor));
          node.links.forEach((link: any) => self.highlightLinks.add(link));
        }
        self.hoverNode = node || null;
        self.updateHighlight();
      })
      .nodeThreeObject((node: any) => {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(10),
          new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );
        // add text sprite as child
        const sprite = new SpriteText(node.title);
        sprite.color = node.color;
        sprite.textHeight = 8;
        obj.add(sprite);
        return obj;
      })
      .onNodeClick((node: any) => {
        // Aim at node from outside it
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        self.g.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          1000  // ms transition duration
        )
      })
      .onNodeRightClick((node, evt) => {
        self.state.showCtxMenu([node, evt]);
      })
      .onNodeDrag(() => this.g.cooldownTicks(0))
      .onNodeDragEnd((node: any) => { // lock nodes in place on drag end
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
        self.g.cooldownTicks(0)
      })
      .nodeVisibility(function (node: any) {
        return true;
      })
      .linkVisibility(function (link: any) {
        // return self.state.getSourceNodes().includes(link.target);
        return true;
      })
      .onLinkHover((link: any) => {
        self.highlightNodes.clear();
        self.highlightLinks.clear();
        if (link) {
          self.highlightLinks.add(link);
          self.highlightNodes.add(link.source);
          self.highlightNodes.add(link.target);
        }
        self.updateHighlight();
      })
      .onLinkClick((link: any) => {
        // Aim at target node from outside it
        var tarNode = link.target;
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(tarNode.x, tarNode.y, tarNode.z);
        this.g.cameraPosition(
          { x: tarNode.x * distRatio, y: tarNode.y * distRatio, z: tarNode.z * distRatio }, // new position
          tarNode, // lookAt ({ x, y, z })
          1000  // ms transition duration
        )
      })
      .onLinkRightClick((link: any) => {
        // Aim at source node from outside it
        var srcNode = link.source;
        const distance = 100;
        const distRatio = 1 + distance / Math.hypot(srcNode.x, srcNode.y, srcNode.z);
        self.g.cameraPosition(
          { x: srcNode.x * distRatio, y: srcNode.y * distRatio, z: srcNode.z * distRatio }, // new position
          srcNode, // lookAt ({ x, y, z })
          1000  // ms transition duration
        )
      })
      .linkLabel((link: any) => "Source:  " + `${link.sourceTitle}` + "<br>Target: " + `${link.targetTitle}`)
      .linkAutoColorBy((link: any) => link.sourceTitle)
      .cooldownTicks(100);
    // #endregion Graph setup
  }
}