import { AfterViewInit, Component, OnInit } from '@angular/core';
import { State } from "../../state";
import ForceGraph3D, { ForceGraph3DInstance } from "3d-force-graph";
import * as THREE from "three";
import SpriteText from "three-spritetext";

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements AfterViewInit {
  state: State;
  g: ForceGraph3DInstance;
  highlightNodes: Set<any>;
  highlightLinks: Set<any>;
  hoverNode: any;
  public constructor(state: State) {
    this.state = state;
    // this.g = ForceGraph3D();
    // this.changeForce(-400); // Spread nodes a little wider
    this.highlightNodes = new Set();
    this.highlightLinks = new Set();
    this.hoverNode = null;
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