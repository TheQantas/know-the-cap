"use strict";
let currentPage = 0;
const pageCount = 19;
class PageLock {
    constructor(pageIndex, lockedData) {
        this.pageIndex = pageIndex;
        this.advanceAllowed = !lockedData.locked;
        this.reason = 'reason' in lockedData ? lockedData.reason : undefined;
        this.fxn = 'fxn' in lockedData ? lockedData.fxn : undefined;
        this.shake = 'shake' in lockedData ? lockedData.shake : undefined;
    }
    allowAdvance() {
        this.advanceAllowed = true;
        document.getElementsByClassName('side-nav')[1].classList.remove('disabled');
    }
    canAdvance(doFxn = true) {
        if (doFxn && this.fxn && this.advanceAllowed == false) {
            this.fxn();
        }
        if (doFxn && this.shake && this.advanceAllowed == false) {
            document.querySelector(`#element-list > .${this.shake}`).classList.remove('shake');
            document.querySelector(`#element-list > .${this.shake}`).offsetWidth;
            document.querySelector(`#element-list > .${this.shake}`).classList.add('shake');
        }
        return this.advanceAllowed;
    }
}
const pageLockList = [
    new PageLock(0, { locked: false }),
    new PageLock(1, { locked: false }),
    new PageLock(2, { locked: false }),
    new PageLock(3, { locked: false }),
    new PageLock(4, { locked: false }),
    new PageLock(5, {
        locked: true,
        reason: 'Add a base salary into the player\'s contract',
        shake: 'base-salary'
    }),
    new PageLock(6, {
        locked: true,
        reason: 'Add a guaranteed salary into the player\'s contract',
        shake: 'gtd-salary'
    }),
    new PageLock(7, {
        locked: true,
        reason: 'Add a signing bonus into the player\'s contract',
        shake: 'signing-bonus'
    }),
    new PageLock(8, { locked: false }),
    new PageLock(9, { locked: false }),
    new PageLock(10, {
        locked: true,
        reason: 'Add an incentive into the player\'s contract',
        shake: 'incentive'
    }),
    new PageLock(11, { locked: false }),
    new PageLock(12, { locked: false }),
    new PageLock(13, { locked: false }),
    new PageLock(14, { locked: true, reason: 'Restructure part of the player\'s contract to reduce cap hit' }),
    new PageLock(15, { locked: false }),
    new PageLock(16, {
        locked: true,
        reason: 'Release or trade the player',
        shake: 'release-or-trade'
    }),
    new PageLock(17, { locked: false }),
    new PageLock(18, { locked: false }),
];
function changePage(dxn) {
    const nextPage = currentPage + dxn;
    if (nextPage < 0 || nextPage >= pageCount) {
        return;
    }
    const navBtnDOMs = document.getElementsByClassName('side-nav');
    if (dxn == 1 && !pageLockList[currentPage].canAdvance()) {
        return;
    }
    const metroStopDOMs = document.getElementsByClassName('metro-stop');
    metroStopDOMs[currentPage].classList.remove('large');
    metroStopDOMs[nextPage].classList.add('large');
    const summaryDOMs = document.getElementsByClassName('summary-page');
    summaryDOMs[currentPage].classList.remove('expanded');
    summaryDOMs[nextPage].classList.add('expanded');
    const metroCont = document.getElementById('metro-nav');
    if (nextPage == 0) {
        metroCont.style.gridTemplateColumns = `var(--current-stop-width) repeat(${pageCount - 1},1fr)`;
        navBtnDOMs[0].classList.add('disabled');
    }
    else if (nextPage == pageCount - 1) {
        metroCont.style.gridTemplateColumns = `repeat(${pageCount - 1},1fr) var(--current-stop-width)`;
        navBtnDOMs[1].classList.add('disabled');
    }
    else {
        metroCont.style.gridTemplateColumns = `repeat(${nextPage},1fr) var(--current-stop-width) repeat(${pageCount - nextPage - 1},1fr)`;
        navBtnDOMs[0].classList.remove('disabled');
        navBtnDOMs[1].classList.remove('disabled');
    }
    if (!pageLockList[nextPage].canAdvance(false)) {
        navBtnDOMs[1].classList.add('disabled');
    }
    if (nextPage == 5) {
        unlockElement('base-salary');
    }
    else if (nextPage == 6) {
        unlockElement('gtd-salary');
    }
    else if (nextPage == 7) {
        unlockElement('signing-bonus');
    }
    else if (nextPage == 8) {
        unlockElement('option-bonus');
    }
    else if (nextPage == 9) {
        unlockElement('roster-bonus');
        unlockElement('workout-bonus');
    }
    else if (nextPage == 10) {
        unlockElement('incentive');
    }
    else if (nextPage == 16) {
        unlockElement('release-or-trade');
    }
    else if (nextPage == 14) {
        ContractElement.enableSigningConversion();
    }
    currentPage = nextPage;
}
function unlockElement(type) {
    const dom = document.querySelector(`#element-list > .${type}`);
    dom.classList.remove('locked');
    dom.title = '';
}
class ContractElement {
    constructor(type, dom) {
        this.dollarAmounts = [0, 0, 0, 0, 0, 0, 0];
        this.lengthInYears = 0;
        this.id = ContractElement.counter;
        this.type = type;
        this.dom = dom;
        this.dom.id = `element-${this.id}`;
        const inputDOMs = this.dom.querySelectorAll('input');
        for (let i = 0; i < inputDOMs.length; i++) {
            inputDOMs[i].oninput = () => this.updateValue(i, inputDOMs[i]);
        }
        this.dom.querySelector('button.contract-element-delete').onclick = () => this.remove();
        if (this instanceof ReleaseOrTrade) {
            ContractElement.releaseElement = this;
            document.querySelector('#element-list > .contract-element.release-or-trade').classList.add('locked');
            document.querySelector('#element-list > .contract-element.release-or-trade').title =
                'This element cannot be added twice';
        }
        if (this.id == 0) {
            this.dom.querySelector('.contract-element-delete').style.visibility = 'hidden';
        }
        else {
            this.dom.querySelector('.contract-element-delete').style.visibility = 'visible';
        }
        ContractElement.counter++;
        ContractElement.elemMap.set(this.id, this);
        if (this.type == 'base-salary') {
            pageLockList[5].allowAdvance();
        }
        else if (this.type == 'gtd-salary') {
            pageLockList[6].allowAdvance();
        }
        else if (this.type == 'signing-bonus') {
            pageLockList[7].allowAdvance();
        }
        else if (this.type == 'incentive') {
            pageLockList[10].allowAdvance();
        }
        else if (this.type == 'release-or-trade') {
            pageLockList[15].allowAdvance();
        }
        this.addConversionListener();
    }
    updateValue(index, dom) {
        if (dom.value.length == 0) {
            return;
        }
        const dollars = Number(dom.value.replace(/,/g, '').replace(/\$/g, ''));
        if (isNaN(dollars) || dollars < 0) {
            dom.value = '0';
            return;
        }
        this.lengthInYears = Math.max(this.lengthInYears, index + 1);
        this.dollarAmounts[index] = dollars;
        ContractElement.updateAllElements();
    }
    updateOutput() {
        const outputDOMs = this.dom.querySelectorAll('div.contract-element-output');
        const dollarDistr = this.getCapHits(ContractElement.releaseElement?.getReleaseYear(), ContractElement.releaseElement?.getJune1st());
        for (let i = 0; i < outputDOMs.length && i < dollarDistr.length; i++) {
            if (dollarDistr[i] < 0) {
                outputDOMs[i].textContent = '+' + String(Number((-dollarDistr[i]).toFixed(3)));
            }
            else {
                outputDOMs[i].textContent = String(Number(dollarDistr[i].toFixed(3)));
            }
        }
    }
    remove() {
        this.dom.remove();
        if (ContractElement.releaseElement?.id == this.id) {
            ContractElement.releaseElement = null;
        }
        const lockedCloneParent = document.querySelector(`.contract-element.${this.type}.locked`);
        if (lockedCloneParent) {
            lockedCloneParent.classList.remove('locked');
            lockedCloneParent.title = '';
        }
        ContractElement.elemMap.delete(this.id);
        ContractElement.updateAllElements();
    }
    addConversionListener() {
        if (this.type != 'base-salary' || !ContractElement.allowSigninBonusConversion) {
            return;
        }
        const inputDOMs = this.dom.querySelectorAll('input');
        for (const input of inputDOMs) {
            input.ondblclick = (ev) => {
                this.showConversionOptions(ev.clientX, ev.clientY, input);
            };
        }
    }
    showConversionOptions(x, y, input) {
        if (isNaN(Number(input.value))) {
            input.value = '0';
        }
        let inputDOMIndex = -1;
        const inputDOMs = this.dom.querySelectorAll('input');
        for (let i = 0; i < inputDOMs.length; i++) {
            if (input == inputDOMs[i]) {
                inputDOMIndex = i;
                break;
            }
        }
        if (inputDOMIndex == -1) {
            return;
        }
        const valueInCell = Number(input.value);
        const optionsDOM = document.getElementById('conversion-options');
        optionsDOM.style.display = 'block';
        const bottomPixel = y + 250;
        if (bottomPixel > window.innerHeight - 20) {
            optionsDOM.style.top = 'auto';
            optionsDOM.style.bottom = '20px';
        }
        else {
            optionsDOM.style.top = String(y) + 'px';
            optionsDOM.style.bottom = 'auto';
        }
        optionsDOM.style.left = String((x + 10) / window.innerWidth * 100) + '%';
        for (let i = 0; i < optionsDOM.children.length; i++) {
            const listDOM = optionsDOM.children[i];
            const value = Number(listDOM.getAttribute('value'));
            if (value > valueInCell) {
                listDOM.classList.add('disabled');
                listDOM.onclick = null;
            }
            else {
                listDOM.classList.remove('disabled');
                listDOM.onclick = () => this.convertPortionToSigningBonus(inputDOMIndex, listDOM);
            }
        }
    }
    convertPortionToSigningBonus(index, listDOM) {
        if (this.type != 'base-salary') {
            return;
        }
        const value = Number(listDOM.getAttribute('value'));
        if (isNaN(value) || value > this.dollarAmounts[index]) {
            return;
        }
        pageLockList[14].allowAdvance();
        document.getElementById('conversion-options').style.display = 'none';
        const baseInputDOM = this.dom.querySelectorAll('input')[index];
        baseInputDOM.value = String(this.dollarAmounts[index] - value);
        this.updateValue(index, baseInputDOM);
        const clonedSigningDOM = document.querySelector('#element-list > .signing-bonus').cloneNode(true);
        clonedSigningDOM.classList.add('in-contract');
        const signingElement = new SigningBonus(clonedSigningDOM);
        const signingInputDOM = clonedSigningDOM.querySelectorAll('input')[index];
        signingInputDOM.value = String(value);
        signingElement.updateValue(index, signingInputDOM);
        document.getElementById('contract-list').insertBefore(clonedSigningDOM, this.dom.nextSibling);
    }
    static updateAllElements() {
        const capHits = new Array(7).fill(0);
        const payments = new Array(7).fill(0);
        for (const element of ContractElement.elemMap.values()) {
            if (element.type == 'release-or-trade') {
                continue;
            }
            element.updateOutput();
            const elementCapHits = element.getCapHits(ContractElement.releaseElement?.getReleaseYear(), ContractElement.releaseElement?.getJune1st());
            const elementPayments = element.getPayments(ContractElement.releaseElement?.getReleaseYear(), ContractElement.releaseElement?.getJune1st());
            for (let i = 0; i < 7; i++) {
                capHits[i] += elementCapHits[i];
                payments[i] += elementPayments[i];
            }
        }
        const capHitDOMs = document.querySelectorAll('#cap-hit-bar > .contract-element-output');
        const paymentDOMs = document.querySelectorAll('#payment-bar > .contract-element-output');
        for (let i = 0; i < 7; i++) {
            if (capHits[i] < 0) {
                capHitDOMs[i].textContent = '+' + String(Number((-capHits[i]).toFixed(3)));
            }
            else {
                capHitDOMs[i].textContent = String(Number(capHits[i].toFixed(3)));
            }
            if (payments[i] < 0) {
                paymentDOMs[i].textContent = '+' + String(Number((-payments[i]).toFixed(3)));
            }
            else {
                paymentDOMs[i].textContent = String(Number(payments[i].toFixed(3)));
            }
        }
    }
    static delete(id) {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            return;
        }
        ContractElement.elemMap.delete(numericId);
    }
    static getOfType(type, dom) {
        switch (type) {
            case 'base-salary': return new BaseSalary(dom);
            case 'gtd-salary': return new GuaranteedSalary(dom);
            case 'incentive': return new Incentive(dom);
            case 'roster-bonus': return new RosterBonus(dom);
            case 'signing-bonus': return new SigningBonus(dom);
            case 'workout-bonus': return new WorkoutBonus(dom);
            case 'release-or-trade': return new ReleaseOrTrade(dom);
            case 'option-bonus': return new OptionBonus(dom);
        }
    }
    static getCount() { return ContractElement.counter; }
    static enableSigningConversion() {
        ContractElement.allowSigninBonusConversion = true;
        for (const elem of this.elemMap.values()) {
            elem.addConversionListener();
        }
    }
    static getLengthOfContract() {
        let length = 0;
        for (const elem of ContractElement.elemMap.values()) {
            length = Math.max(length, elem.lengthInYears);
        }
        return length;
    }
}
ContractElement.counter = 0;
ContractElement.elemMap = new Map();
ContractElement.releaseElement = null;
ContractElement.allowSigninBonusConversion = false;
class BaseSalary extends ContractElement {
    constructor(dom) {
        super('base-salary', dom);
    }
    getCapHits(releaseYear) {
        if (releaseYear == undefined) {
            return this.dollarAmounts;
        }
        const dollarArray = new Array(7).fill(0);
        for (let i = 0; i < releaseYear; i++) {
            dollarArray[i] = this.dollarAmounts[i];
        }
        return dollarArray;
    }
    getPayments() {
        return this.getCapHits();
    }
}
class GuaranteedSalary extends ContractElement {
    constructor(dom) {
        super('gtd-salary', dom);
    }
    getCapHits(releaseYear, june1st) {
        if (releaseYear == undefined) {
            return this.dollarAmounts;
        }
        const dollarArray = new Array(7).fill(0);
        const accelerateOnto = releaseYear + (june1st == 'pre' ? 0 : 1) - 1;
        for (let i = 0; i < this.dollarAmounts.length; i++) {
            if (i < accelerateOnto) {
                dollarArray[i] += this.dollarAmounts[i];
            }
            else {
                dollarArray[accelerateOnto] += this.dollarAmounts[i];
            }
        }
        return dollarArray;
    }
    getPayments() {
        return this.dollarAmounts;
    }
}
class WorkoutBonus extends ContractElement {
    constructor(dom) {
        super('workout-bonus', dom);
    }
    getCapHits(releaseYear) {
        if (releaseYear == undefined) {
            return this.dollarAmounts;
        }
        const dollarArray = new Array(7).fill(0);
        for (let i = 0; i < releaseYear; i++) {
            dollarArray[i] = this.dollarAmounts[i];
        }
        return dollarArray;
    }
    getPayments() {
        return this.getCapHits();
    }
}
class RosterBonus extends ContractElement {
    constructor(dom) {
        super('roster-bonus', dom);
    }
    getCapHits(releaseYear) {
        if (releaseYear == undefined) {
            return this.dollarAmounts;
        }
        const dollarArray = new Array(7).fill(0);
        for (let i = 0; i < releaseYear; i++) {
            dollarArray[i] = this.dollarAmounts[i];
        }
        return dollarArray;
    }
    getPayments() {
        return this.getCapHits();
    }
}
class SigningBonus extends ContractElement {
    constructor(dom) {
        super('signing-bonus', dom);
    }
    getProratedBonus() {
        const finalAmounts = new Array(7).fill(0);
        for (let i = 0; i < this.dollarAmounts.length; i++) {
            const proratedYears = Math.min(7 - i, 5, ContractElement.getLengthOfContract());
            for (let j = i; j < i + proratedYears; j++) {
                finalAmounts[j] += this.dollarAmounts[i] / proratedYears;
            }
        }
        return finalAmounts;
    }
    getCapHits(releaseYear, june1st) {
        const prorated = this.getProratedBonus();
        if (releaseYear == undefined) {
            return prorated;
        }
        const dollarArray = new Array(7).fill(0);
        const accelerateOnto = releaseYear + (june1st == 'pre' ? 0 : 1) - 1;
        for (let i = 0; i < prorated.length; i++) {
            if (i < accelerateOnto) {
                dollarArray[i] += prorated[i];
            }
            else {
                dollarArray[accelerateOnto] += prorated[i];
            }
        }
        return dollarArray;
    }
    getPayments() {
        return this.dollarAmounts;
    }
}
class OptionBonus extends ContractElement {
    constructor(dom) {
        super('option-bonus', dom);
    }
    getProratedBonus() {
        const finalAmounts = new Array(7).fill(0);
        for (let i = 0; i < this.dollarAmounts.length; i++) {
            const proratedYears = Math.min(7 - i, 5, ContractElement.getLengthOfContract());
            for (let j = i; j < i + proratedYears; j++) {
                finalAmounts[j] += this.dollarAmounts[i] / proratedYears;
            }
        }
        return finalAmounts;
    }
    getCapHits(releaseYear, june1st) {
        const prorated = this.getProratedBonus();
        if (releaseYear == undefined) {
            return prorated;
        }
        const dollarArray = new Array(7).fill(0);
        const accelerateOnto = releaseYear + (june1st == 'pre' ? 0 : 1) - 1;
        for (let i = 0; i < prorated.length; i++) {
            if (i < accelerateOnto) {
                dollarArray[i] += prorated[i];
            }
            else {
                dollarArray[accelerateOnto] += prorated[i];
            }
        }
        return dollarArray;
    }
    getPayments() {
        return this.dollarAmounts;
    }
}
class Incentive extends ContractElement {
    constructor(dom) {
        const selectDOMs = dom.querySelectorAll('select');
        selectDOMs[0].oninput = () => {
            this.year = Number(selectDOMs[0].value);
            this.lengthInYears = this.year;
            this.updateOutput();
            ContractElement.updateAllElements();
        };
        selectDOMs[1].oninput = () => {
            this.status = selectDOMs[1].value;
            this.updateOutput();
            ContractElement.updateAllElements();
        };
        selectDOMs[2].oninput = () => {
            this.achievement = selectDOMs[2].value;
            this.updateOutput();
            ContractElement.updateAllElements();
        };
        super('incentive', dom);
        this.year = 1;
        this.status = 'likely';
        this.achievement = 'achieved';
        this.value = 0;
        dom.querySelector('input').oninput = () => {
            this.value = Number(dom.querySelector('input').value);
            this.updateOutput();
            ContractElement.updateAllElements();
        };
    }
    getCapHits(releaseYear) {
        const zeroArray = new Array(7).fill(0);
        if (releaseYear != undefined && releaseYear - 1 >= this.year) {
            console.log('ret');
            return zeroArray;
        }
        console.log(this.value);
        if (this.status == 'likely' && this.achievement == 'achieved') {
            zeroArray[this.year - 1] = this.value;
        }
        else if (this.status == 'likely' && this.achievement == 'not_achieved') {
            zeroArray[this.year - 1] = this.value;
            zeroArray[this.year] = -this.value;
        }
        else if (this.status == 'not_likely' && this.achievement == 'achieved') {
            zeroArray[this.year] = this.value;
        }
        return zeroArray;
    }
    getPayments(releaseYear) {
        const zeroArray = new Array(7).fill(0);
        if (releaseYear != undefined && releaseYear - 1 >= this.year) {
            return zeroArray;
        }
        if (this.achievement == 'achieved') {
            zeroArray[this.year - 1] = this.value;
            return zeroArray;
        }
        else {
            return zeroArray;
        }
    }
}
class ReleaseOrTrade extends ContractElement {
    constructor(dom) {
        const selectDOMs = dom.querySelectorAll('select');
        selectDOMs[0].oninput = () => {
            this.releaseYear = Number(selectDOMs[0].value);
            ContractElement.updateAllElements();
        };
        selectDOMs[1].oninput = () => {
            this.june1st = selectDOMs[1].value;
            ContractElement.updateAllElements();
        };
        super('release-or-trade', dom);
        this.june1st = 'pre';
    }
    getCapHits() { return new Array(7).fill(0); }
    getPayments() { return new Array(7).fill(0); }
    getReleaseYear() { return this.releaseYear; }
    getJune1st() { return this.june1st; }
    remove() {
        super.remove();
        ContractElement.updateAllElements();
    }
}
function dragStart(ev) {
    const elem = ev.target;
    if (elem == null || elem.classList.contains('locked')) {
        ev.preventDefault();
        return;
    }
    ev.dataTransfer.setData('text', ev.target.classList[1]);
}
function dragOver(ev) {
    ev.preventDefault();
}
function drop(ev) {
    ev.preventDefault();
    const type = ev.dataTransfer.getData('text');
    addElementToContract(type);
}
function addElementToContract(type) {
    const parent = document.querySelector(`.contract-element.${type}`);
    if (parent?.classList.contains('locked')) {
        return;
    }
    const clone = parent?.cloneNode(true);
    clone.classList.remove('locked');
    clone.classList.add('in-contract');
    clone.title = '';
    clone.ondragstart = null;
    clone.draggable = false;
    ContractElement.getOfType(type, clone);
    const contractDOM = document.getElementById('contract-list');
    contractDOM.appendChild(clone);
    contractDOM.scrollTo(0, contractDOM.scrollHeight);
    clone.querySelectorAll('input, select')[0].focus();
}
function hideConversionOptions(ev) {
    let isDOMChildOfConversionMenu = false;
    let iterDOM = ev.target;
    while (iterDOM?.parentElement) {
        if (iterDOM.parentElement.id == 'conversion-options') {
            isDOMChildOfConversionMenu = true;
            break;
        }
        iterDOM = iterDOM.parentElement;
    }
    const conversionMenu = document.getElementById('conversion-options');
    if (!isDOMChildOfConversionMenu) {
        conversionMenu.style.display = 'none';
    }
}
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google-translate-bar');
}
function toggleTranslateBar() {
    const barDOM = document.getElementById('google-translate-bar');
    barDOM.classList.toggle('hide');
    document.getElementById('google-translate-btn').classList.toggle('expanded');
    const translateFrame = document.querySelector('.skiptranslate > iframe');
    if (translateFrame?.parentElement?.classList.contains('hide')) {
        translateFrame.parentElement.classList.remove('hide');
    }
    else {
        translateFrame?.parentElement?.classList.add('hide');
    }
}
let formerValue = 'Contract Elements';
window.onload = () => {
    document.getElementById('first-name-input').oninput = () => {
        const fname = document.getElementById('first-name-input').value;
        if (fname) {
            for (const spanDOM of document.getElementsByClassName('first-name')) {
                spanDOM.textContent = fname;
            }
        }
    };
    document.getElementById('last-name-input').oninput = () => {
        const lname = document.getElementById('last-name-input').value;
        if (lname) {
            for (const spanDOM of document.getElementsByClassName('last-name')) {
                spanDOM.textContent = lname;
            }
        }
    };
    document.body.onclick = (ev) => hideConversionOptions(ev);
    document.getElementById('contract-list').onscroll = (ev) => hideConversionOptions(ev);
    const detectDOM = document.getElementById('google-translate-detector');
    detectDOM.addEventListener("DOMSubtreeModified", translationCallback, false);
    function translationCallback() {
        const currentValue = detectDOM.textContent;
        const barDOM = document.getElementById('google-translate-bar');
        if (currentValue && currentValue != formerValue) {
            formerValue = currentValue;
            document.body.style.top = '0';
            const anchorDOM = document.querySelectorAll('body > div.skiptranslate')[0];
            anchorDOM.classList.add('google-translate-anchor');
            barDOM.classList.add('full');
            barDOM.classList.remove('hide');
            document.getElementById('google-translate-btn').classList.add('expanded');
        }
        if (currentValue == 'Contract Elements') {
            barDOM.classList.remove('full');
        }
    }
};
window.onkeydown = (ev) => {
    if (document.activeElement?.classList.contains('contract-element-input') && (ev.key == 'D' || ev.key == 'd')) {
        let iterDOM = ev.target;
        let contractDOM = null;
        while (iterDOM?.parentElement) {
            if (iterDOM.classList.contains('contract-element')) {
                contractDOM = iterDOM;
                break;
            }
            iterDOM = iterDOM.parentElement;
        }
        if (contractDOM && contractDOM.id != 'element-0') {
            contractDOM.remove();
            ev.preventDefault();
            return;
        }
    }
    if (document.activeElement?.tagName == 'INPUT') {
        return;
    }
    if (ev.key == 'b' || ev.key == 'B') {
        addElementToContract('base-salary');
        ev.preventDefault();
    }
    else if (ev.key == 'g' || ev.key == 'G') {
        addElementToContract('gtd-salary');
        ev.preventDefault();
    }
    else if (ev.key == 's' || ev.key == 'S') {
        addElementToContract('signing-bonus');
        ev.preventDefault();
    }
    else if (ev.key == 'O' || ev.key == 'o') {
        addElementToContract('option-bonus');
        ev.preventDefault();
    }
    else if (ev.key == 'R' || ev.key == 'r') {
        addElementToContract('roster-bonus');
        ev.preventDefault();
    }
    else if (ev.key == 'I' || ev.key == 'i') {
        addElementToContract('incentive');
        ev.preventDefault();
    }
    else if (ev.key == 'T' || ev.key == 't') {
        addElementToContract('release-or-trade');
        ev.preventDefault();
    }
    else if (ev.key == 'ArrowRight') {
        changePage(1);
    }
    else if (ev.key == 'ArrowLeft') {
        changePage(-1);
    }
};
