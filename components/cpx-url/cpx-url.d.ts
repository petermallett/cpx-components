export declare class CPXUrl extends HTMLElement {
  static get tag(): string;
  _uri: URL;
  get uri(): URL;
  set uri(val: URL);
  _term: string;
  get term(): string;
  set term(val: string);
  _filters: Map<string, Set<string>>;
  get filters(): Map<string, Set<string>>;
  set filters(val: Map<string, Set<string>>);
  _sort: string;
  get sort(): string;
  set sort(val: string);
  _qty: string;
  get qty(): string;
  set qty(val: string);
  _init: boolean;
  get init(): boolean;
  set init(val: boolean);
  _params: any;
  _history: any;
  constructor();
  connectedCallback(): void;
  static get observedAttributes(): string[];
  attributeChangedCallback(name: any, oldVal: any, newVal: any): void;
  _getValueArray(vals: Set<string>): void;
  _popState(e: any): void;
  _paramsReady(): void;
  _setFilters(filtersQS: any): Map<string, Set<string>>;
  _changeAttr(e: any): void;
}
