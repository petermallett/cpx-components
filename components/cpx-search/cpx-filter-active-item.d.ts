export declare class CPXFilterActiveItem extends HTMLElement {
    get html(): string;
    static get tag(): string;
    template: HTMLTemplateElement;
    _key: any;
    _name: any;
    _active: boolean;
    _value: any;
    _inline: boolean;
    _bubble: boolean;
    _bounce: boolean;
    _group: any;
    get name(): any;
    set name(val: any);
    get key(): any;
    set key(val: any);
    get group(): any;
    set group(val: any);
    get inline(): boolean;
    set inline(val: boolean);
    get bubble(): boolean;
    set bubble(val: boolean);
    get bounce(): boolean;
    set bounce(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    get value(): any;
    set value(val: any);
    constructor();
    connectedCallback(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: any, oldVal: any, newVal: any): void;
    _updateFacet(e: any): void;
    _checkParams(e: any): void;
    _checkChange(e: any): void;
    _clearFilters(e: any): void;
    render(): void;
}
