export class CPXUrl extends HTMLElement {
    static get tag() { return 'cpx-url'; }

    // https://developers.redhat.com/search/?q=term+term1+term2&f=a+b+c&s=sort&r=100
    _uri = new URL(window.location.href); 
    get uri() { return this._uri; }
    set uri(val) {
        if (this._uri === val) return;
        this._uri = val;
        // https://developers.redhat.com/search/?q=term+term1+term2&f=a~1+2&f=b~2&f=c~1+4&s=sort&r=100
    }

    _term = this.uri.searchParams.get('t');
    get term() { return this._term; }
    set term(val) {
        if (this._term === val) return;
        this._term = val;
        this.uri.searchParams.set('t', this._term);
        this.setAttribute('term', this.term);
    }

    _filters: Map<string, Set<string>> = this._setFilters(this.uri.searchParams.getAll('f'));
    get filters() { return this._filters; }
    set filters(val) {
        this._filters = val;
        this.uri.searchParams.delete('f');
        this._filters.forEach((val, key) => {
            this.uri.searchParams.append('f',`${key}~${Array.from(val).reduce((acc, curr) => acc+' '+curr)}`)
        });
        // Object.keys(this._filters).forEach(group => {
        //     this.uri.searchParams.append('f',`${group}~${this._filters[group].join(' ')}`)
        // });
    }

    _sort = this.uri.searchParams.get('s') || 'relevance';
    get sort() { return this._sort; }
    set sort(val) {
        if (this._sort === val) return;
        this._sort = val;
        this.uri.searchParams.set('s', this._sort);
        this.setAttribute('sort', this._sort);
    }

    _qty = this.uri.searchParams.get('r');
    get qty() { return this._qty; }
    set qty(val) {
        if (this._qty === val) return;
        this._qty = val;
        this.setAttribute('qty', this._sort);
    }

    _init = true;
    get init() { return this._init; }
    set init(val) {
        if (this._init === val) return;
        this._init = val;
    }

    _params;
    _history;

    //history.pushState({}, `Red Hat Developer Program Search: ${this.term}`, `?q=${decodeURIComponent(this.term).replace(' ', '+')}`);

    constructor() {
        super();

        this._changeAttr = this._changeAttr.bind(this);
        this._popState = this._popState.bind(this);
    }

    connectedCallback() {
        top.addEventListener('search-complete', this._changeAttr);
        top.addEventListener('clear-filters', this._changeAttr);
        top.window.addEventListener('popstate', this._popState);
        this._paramsReady();
    }

    static get observedAttributes() { 
        return ['sort', 'term', 'qty']; 
    }

    attributeChangedCallback(name, oldVal, newVal) {
        this[name] = newVal;
    }

    _getValueArray(vals: Set<string>) {
        let str = '';

    }

    _popState(e) {
        this.uri = new URL(document.location.href); // https://developers.redhat.com/search/?q=term+term1+term2&f=a+b+c&s=sort&r=100
        this.term = this.uri.searchParams.get('t') || null;
        this.filters = this._setFilters(this.uri.searchParams.getAll('f'));
        this.sort = this.uri.searchParams.get('s');
        this.qty = this.uri.searchParams.get('r');
        this._paramsReady();
    }

    _paramsReady() {
        let evt = {
            detail: { 
                term: this.term,
                filters: this.filters,
                sort: this.sort,
                qty: this.qty
            }, 
            bubbles: true,
            composed: true
        }
        this.dispatchEvent(new CustomEvent('params-ready', evt));
    }

    _setFilters(filtersQS): Map<string, Set<string>> {
        return new Map(filtersQS.map(o => [o.split('~')[0], new Set(o.split('~')[1].split(' '))]));
    }

    _changeAttr(e) {
        switch (e.type) {
            case 'clear-filters':
                this.uri.searchParams.delete('f');
                this.filters.clear();
                break;
            case 'load-more': // detail.qty
                break;
            case 'search-complete': // build querystring params
                // Term Change
                if (e.detail && typeof e.detail.term !== 'undefined' && e.detail.term.length > 0) {
                    this.term = e.detail.term;
                } else {
                    this.term = '';
                    this.uri.searchParams.delete('t');
                }
                // Filter Change
                if (e.detail && e.detail.filters) {
                    this.filters = e.detail.filters;
                }
                // Sort Change
                if (e.detail && typeof e.detail.sort !== 'undefined') {
                    this.sort = e.detail.sort;
                }
        }
        if(e.detail && typeof e.detail.invalid === 'undefined') {
            history.pushState({}, `RHD Search: ${this.term ? this.term : ''}`, `${this.uri.pathname}${this.uri.search}`);
        } else {
            this.term = '';
            this.filters.clear();
            this.sort = 'relevance';
            this.uri.searchParams.delete('t');
            this.uri.searchParams.delete('f');
            this.uri.searchParams.delete('s');
            history.replaceState({}, 'RHD Search Error', `${this.uri.pathname}${this.uri.search}`);
        }
    }
}

window.customElements.define(CPXUrl.tag,CPXUrl);