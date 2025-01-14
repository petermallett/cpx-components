export class CPXFilterItem extends HTMLElement {
    constructor() {
        super();
        this.template = document.createElement('template');
        this._active = false;
        this._inline = false;
        this._bounce = false;
        this.attachShadow({ mode: 'open' });
        this._checkParams = this._checkParams.bind(this);
        this._clearFilters = this._clearFilters.bind(this);
        this._checkChange = this._checkChange.bind(this);
        this._updateFacet = this._updateFacet.bind(this);
        this._updateName = this._updateName.bind(this);
    }
    get html() {
        return `
        <style>
        .list {
            clear: left;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            font-size: 14px;
            height: auto;
            line-height: 1.25em;
            padding: .5em .5em 0 1.1em;
        }
        span { display: none; }
        input[type=checkbox] {
            flex: 0 0 auto;
            margin: .25em 5px 0 0;
            order: 0;
        }
        label {
            margin-left: 0;
            color: #4d4d4d;
            cursor: pointer;
            display: block;
            font-size: .875rem;
            font-weight: 400;
            line-height: 1.5;
            margin-bottom: 0;
        }
        input[type=checkbox]+label,
        input[type=radio]+label {
            display: inline-block;
            margin-bottom: 0;
            margin-left: .5rem;
            margin-right: 1rem;
            vertical-align: baseline;
        }

        @media only screen and (max-width: 768px) {
            .list {
                line-height: 25px;
                padding-left: 0;
                font-size: 16px;
            }
            
            span { display: inline; font-size: 16px; }
            
            input[type=checkbox]{
                height: 0;
                width: 0;
                visibility: hidden;
                order: 2;
            }

            label {
                cursor: pointer;
                text-indent: -1200px;
                width: 50px;
                height: 25px;
                background: grey;
                display: block;
                border-radius: 25px;
                position: absolute;
                right: 0;
            }
    
            label:after {
                content: '';
                position: absolute;
                top: 1px;
                left: 1px;
                width: 23px;
                height: 23px;
                background: #fff;
                border-radius: 20px;
                transition: 0.3s;
            }
    
            input:checked + label {
                background: #08c0fc;;
            }
    
            input:checked + label:after  {
                left: calc(100% - 1px);
                transform: translateX(-100%);
            }
    
            label:active:after {
                width: 33px;
            }
        }
        </style>
        <div class="list">
            <span>${this.name} ${this.count && this.count.length ? `(${this.count})` : ''}</span>
            <input type="checkbox" ${this.active ? 'checked' : ''} id="filter-item-${this.key}" value="${this.key}">
            <label for="filter-item-${this.key}"><slot></slot></label>
        </div>`;
    }
    static get tag() { return 'cpx-filter-item'; }
    get name() {
        return this._name;
    }
    set name(val) {
        if (this._name === val)
            return;
        this._name = val;
        this.setAttribute('name', this._name);
        if (this.shadowRoot.querySelector('span')) {
            this.shadowRoot.querySelector('span').innerText = this._name;
        }
        this.innerHTML = this._name;
    }
    get key() {
        return this._key;
    }
    set key(val) {
        if (this._key === val)
            return;
        this._key = val;
        this.className = `filter-item-${this._key}`;
        this.setAttribute('key', this._key);
    }
    get facet() {
        return this._facet ? this._facet : this.group;
    }
    set facet(val) {
        if (this._facet === val)
            return;
        this._facet = val;
        this.setAttribute('facet', this._facet);
    }
    get group() {
        return this._group;
    }
    set group(val) {
        if (this._group === val)
            return;
        this._group = val;
        this.setAttribute('group', this._group);
    }
    get count() {
        return this._count;
    }
    set count(val) {
        if (this._count === val)
            return;
        this._count = val;
        this.setAttribute('count', this._count);
    }
    get bounce() {
        return this._bounce;
    }
    set bounce(val) {
        if (this._bounce === val)
            return;
        this._bounce = val;
    }
    get active() {
        return this._active;
    }
    set active(val) {
        if (typeof val === 'string') {
            val = true;
        }
        if (val === null) {
            val = false;
        }
        if (this._active === val) {
            return;
        }
        else {
            this._active = val;
            let chkbox = this.shadowRoot.querySelector('input');
            if (this._active) {
                this.setAttribute('active', '');
            }
            else {
                this.removeAttribute('active');
            }
            if (chkbox) {
                chkbox.checked = this._active;
            }
            if (!this.bounce) {
                let evt = { detail: { facet: this }, bubbles: true, composed: true };
                this.bounce = true;
                this.dispatchEvent(new CustomEvent('filter-item-change', evt));
            }
        }
    }
    get value() {
        return this._value.split(',');
    }
    set value(val) {
        if (this._value === val)
            return;
        this._value = val;
        this.setAttribute('value', this.value);
    }
    connectedCallback() {
        this.render();
        this.shadowRoot.addEventListener('change', this._updateFacet);
        top.addEventListener('filter-item-change', this._checkChange);
        top.addEventListener('params-ready', this._checkParams);
        top.addEventListener('clear-filters', this._clearFilters);
        top.addEventListener('search-complete', this._updateName);
    }
    static get observedAttributes() {
        return ['name', 'active', 'value', 'inline', 'key', 'group', 'facet', 'count'];
    }
    attributeChangedCallback(name, oldVal, newVal) {
        this[name] = newVal;
    }
    _updateName(e) {
        if (e.detail && e.detail.facets && e.detail.facets.facet_fields) {
            let facets = e.detail.facets.facet_fields;
            if (facets[this.group] && facets[this.group].indexOf(this.value[0]) >= 0) {
                if (this.name.indexOf('(') > 0) {
                    this.name = this.name.replace(/\([0-9]+\)/, "(" + facets[this.group][facets[this.group].indexOf(this.value[0]) + 1] + ")");
                }
                else {
                    this.name = this.name + " (" + facets[this.group][facets[this.group].indexOf(this.value[0]) + 1] + ")";
                }
            }
            else if (facets[this.facet] && facets[this.facet].indexOf(this.value[0]) >= 0) {
                if (this.name.indexOf('(') > 0) {
                    this.name = this.name.replace(/\([0-9]+\)/, "(" + facets[this.facet][facets[this.facet].indexOf(this.value[0]) + 1] + ")");
                }
                else {
                    this.name = this.name + " (" + facets[this.facet][facets[this.facet].indexOf(this.value[0]) + 1] + ")";
                }
            }
            else {
                this.name = this.name.replace(/\([0-9]+\)/, '');
            }
        }
        else {
            this.name = this.name.replace(/\([0-9]+\)/, '');
        }
    }
    _updateFacet(e) {
        this.bounce = false;
        this.active = !this.active;
    }
    _checkParams(e) {
        if (e.detail && e.detail.filters) {
            this.bounce = true;
            if (e.detail.filters.has(this.group) && e.detail.filters.get(this.group).has(this.key)) {
                this.active = true;
            }
        }
    }
    _checkChange(e) {
        if (e.detail && e.detail.facet) {
            if (this.group === e.detail.facet.group && this.key === e.detail.facet.key) {
                this.active = e.detail.facet.active;
            }
        }
    }
    _clearFilters(e) {
        this.bounce = true;
        this.active = false;
    }
    render() {
        this.shadowRoot.innerHTML = "";
        this.template.innerHTML = this.html;
        this.shadowRoot.appendChild(this.template.content.cloneNode(true));
    }
}
window.customElements.define(CPXFilterItem.tag, CPXFilterItem);
