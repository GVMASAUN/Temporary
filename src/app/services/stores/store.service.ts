import { Observable, BehaviorSubject } from "rxjs";

export const Stores: Store<any>[] = [];

export class Store<T> {
  private _state$: BehaviorSubject<T>;

  constructor(private initialState: T) {
    this._state$ = new BehaviorSubject(initialState);

    Stores.push(this);
  }

  get state$(): Observable<T> {
    return this._state$.asObservable();
  }

  get state(): T {
    return this._state$.getValue();
  }

  setState(state: T): void {
    this._state$.next({
      ...(this.state as any),
      ...(state as any)
    });
  }

  setItem(key: string, value: any): void {
    this._state$.next({
      ...(this.state as any),
      [key]: value
    });
  }

  getItem(key: string): any {
    return (this.state as any)[key];
  }

  removeItem(key: string): void {
    this._state$.next({
      ...(this.state as any),
      [key]: (this.initialState as any)[key]
    });
  }

  clear(): void {
    this._state$.next(this.initialState);
  }
}
