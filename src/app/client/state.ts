import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})

export class State {
    subjects: Array<string>;
    ctxMenuSubj: BehaviorSubject<Array<any>>;
    query: string;
    querySubj: BehaviorSubject<string>;
    makeQuerySubj: BehaviorSubject<number>;
    queryPromiseSubj: BehaviorSubject<Promise<any>>;
    shortestPathSubj: BehaviorSubject<number>;
    shortestPathPromiseSubj: BehaviorSubject<Promise<any>>;
    sourceNodes: Array<string>;
    presentSummarySubj: BehaviorSubject<any>;
    constructor(private logger: NGXLogger) {
        this.logger.info("State Object constructing");
        this.subjects = ['Wikipedia'];
        this.ctxMenuSubj = new BehaviorSubject(['']);
        this.query = '';
        this.querySubj = new BehaviorSubject('');
        this.makeQuerySubj = new BehaviorSubject(1);
        this.queryPromiseSubj = new BehaviorSubject(new Promise((resolve, reject) => { }));
        this.shortestPathSubj = new BehaviorSubject(1);
        this.shortestPathPromiseSubj = new BehaviorSubject(new Promise((resolve, reject) => { }));
        this.sourceNodes = [];
        this.presentSummarySubj = new BehaviorSubject('');
    }

    getSubjects(): Array<string> {
        return this.subjects;
    }

    setSubjects(subjects: Array<string>): void {
        this.logger.info("Subjects list set: {}", subjects);
        this.subjects = subjects;
    }

    showCtxMenu(nodeAndEvt: Array<any>): void {
        this.logger.info("Sending message to show context menu for {}", nodeAndEvt);
        this.ctxMenuSubj.next(nodeAndEvt);
    }

    ctxMenuObs(): Observable<Array<any>> {
        return this.ctxMenuSubj.asObservable();
    }

    setCurrentQuery(query: string): void {
        this.logger.info("Sending message updating the current query to: {}", query);
        this.querySubj.next(query);
    }

    queryObs(): Observable<any> {
        return this.querySubj.asObservable();
    }

    makeQuery(): void {
        this.logger.info("Sending generic message to make a query");
        this.makeQuerySubj.next(1);
    }

    makeQueryObs(): Observable<number> {
        return this.makeQuerySubj.asObservable();
    }

    makeQueryPromise(promise: Promise<any>): void {
        this.logger.info("Sending query Promise to Observable");
        this.queryPromiseSubj.next(promise);
    }

    queryPromiseObs(): Observable<Promise<any>> {
        return this.queryPromiseSubj.asObservable();
    }

    // shortestPath(): void {
    //     this.shortestPathSubj.next(1);
    // }

    // shortestPathObs(): Observable<number> {
    //     return this.shortestPathSubj.asObservable();
    // }

    makeShortestPathPromise(promise: Promise<any>): void {
        this.logger.info("Sending shortest path Promise to Observable");
        this.shortestPathPromiseSubj.next(promise);
    }

    shortestPathPromiseObs(): Observable<Promise<any>> {
        return this.shortestPathPromiseSubj.asObservable();
    }

    getSourceNodes(): Array<string> {
        return this.sourceNodes;
    }

    resetSourceNodes(): void {
        this.sourceNodes = [];
    }

    presentSummary(data: any): void {
        this.presentSummarySubj.next(data);
    }

    presentSummaryObs(): Observable<any> {
        return this.presentSummarySubj.asObservable();
    }
}