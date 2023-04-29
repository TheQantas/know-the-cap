let currentPage: number = 0;
const pageCount: number = 19;
// const canAdvanceToPage: boolean[] = new Array(pageCount).fill(true);
// canAdvanceToPage[6] = false;
// canAdvanceToPage[7] = false;
// canAdvanceToPage[8] = false;
// canAdvanceToPage[11] = false;
// canAdvanceToPage[15] = false;
// canAdvanceToPage[17] = false;

type LockedPage = {locked:false};
type UnlockedPage = {locked:true,reason:string,fxn?: () => void,shake?: ElementType};
class PageLock {
  private readonly pageIndex: number;
  private advanceAllowed: boolean;
  private readonly reason?: string;
  private readonly fxn?: () => void
  private readonly shake?: ElementType;

  public constructor(pageIndex: number,lockedData: LockedPage | UnlockedPage) {
    this.pageIndex = pageIndex;
    this.advanceAllowed = !lockedData.locked;
    this.reason = 'reason' in lockedData?lockedData.reason:undefined;
    this.fxn = 'fxn' in lockedData?lockedData.fxn:undefined;
    this.shake = 'shake' in lockedData?lockedData.shake:undefined;
  }

  public allowAdvance(): void {
    this.advanceAllowed = true;
    (document.getElementsByClassName('side-nav')[1] as HTMLElement).classList.remove('disabled');
  }
  public canAdvance(doFxn: boolean = true): boolean {
    if (doFxn && this.fxn && this.advanceAllowed == false) {
      this.fxn();
    }
    if (doFxn && this.shake && this.advanceAllowed == false) {
      (document.querySelector(`#element-list > .${this.shake}`) as HTMLDivElement).classList.remove('shake');
      (document.querySelector(`#element-list > .${this.shake}`) as HTMLDivElement).offsetWidth;
      (document.querySelector(`#element-list > .${this.shake}`) as HTMLDivElement).classList.add('shake');
    }
    return this.advanceAllowed;
  }
}

const pageLockList: ReadonlyArray<PageLock> = [
  new PageLock(0,{locked:false}), //intro
  new PageLock(1,{locked:false}), //about the cap
  new PageLock(2,{locked:false}), //why a cap?
  new PageLock(3,{locked:false}), //cap calc
  new PageLock(4,{locked:false}), //signing players
  new PageLock(5,{
    locked: true,
    reason: 'Add a base salary into the player\'s contract',
    shake: 'base-salary'
  }), //paragraph 5 salary; locked until base salary is added
  new PageLock(6,{
    locked: true,
    reason: 'Add a guaranteed salary into the player\'s contract',
    shake: 'gtd-salary'
  }), //locked until guaranteed money is added
  new PageLock(7,{
    locked: true,
    reason: 'Add a signing bonus into the player\'s contract',
    shake: 'signing-bonus'
  }), //locked until signing bonus is added
  new PageLock(8,{locked:false}), //option bonuses, not required
  new PageLock(9,{locked:false}), //workout & roster bonuses, not required
  new PageLock(10,{
    locked: true,
    reason: 'Add an incentive into the player\'s contract',
    shake: 'incentive'
  }), //locked until incentive is added
  new PageLock(11,{locked:false}), //franchise tags
  new PageLock(12,{locked:false}), //rookie contracts
  new PageLock(13,{locked:false}), //staying under the cap
  new PageLock(14,{locked:true,reason:'Restructure part of the player\'s contract to reduce cap hit'}), //locked until base sal is changed to signing bonus
  new PageLock(15,{locked:false}), //releasing/trading a player
  new PageLock(16,{
    locked: true,
    reason: 'Release or trade the player',
    shake: 'release-or-trade'
  }), //cannot advance until the player is released or traded
  new PageLock(17,{locked:false}), //conclusion
  new PageLock(18,{locked:false}), //references
];

function changePage(dxn: 1 | -1): void {
  const nextPage: number = currentPage + dxn;
  if (nextPage < 0 || nextPage >= pageCount) {
    return;
  }
  const navBtnDOMs: HTMLCollection = document.getElementsByClassName('side-nav');
  // if (navBtnDOMs[dxn * 0.5 + 0.5].classList.contains('disabled')) {
  //   return;
  // }
  if (dxn == 1 && !pageLockList[currentPage].canAdvance()) {
    return;
  }
  const metroStopDOMs: HTMLCollection = document.getElementsByClassName('metro-stop');
  metroStopDOMs[currentPage].classList.remove('large');
  metroStopDOMs[nextPage].classList.add('large');
  const summaryDOMs: HTMLCollection = document.getElementsByClassName('summary-page');
  summaryDOMs[currentPage].classList.remove('expanded');
  summaryDOMs[nextPage].classList.add('expanded');
  const metroCont = document.getElementById('metro-nav') as HTMLDivElement;
  if (nextPage == 0) {
    metroCont.style.gridTemplateColumns = `var(--current-stop-width) repeat(${pageCount-1},1fr)`;
    navBtnDOMs[0].classList.add('disabled');
  } else if (nextPage == pageCount - 1) {
    metroCont.style.gridTemplateColumns = `repeat(${pageCount-1},1fr) var(--current-stop-width)`;
    navBtnDOMs[1].classList.add('disabled');
  } else {
    metroCont.style.gridTemplateColumns = `repeat(${nextPage},1fr) var(--current-stop-width) repeat(${pageCount-nextPage-1},1fr)`;
    navBtnDOMs[0].classList.remove('disabled');
    navBtnDOMs[1].classList.remove('disabled');
  }
  // if (canAdvanceToPage[nextPage + 1] === false) {
  //   navBtnDOMs[1].classList.add('disabled');
  // }

  if (!pageLockList[nextPage].canAdvance(false)) {
    navBtnDOMs[1].classList.add('disabled');
  }

  if (nextPage == 5) {
    unlockElement('base-salary');
  } else if (nextPage == 6) {
    unlockElement('gtd-salary');
  } else if (nextPage == 7) {
    unlockElement('signing-bonus');
  } else if (nextPage == 8) {
    unlockElement('option-bonus');
  } else if (nextPage == 9) {
    unlockElement('roster-bonus');
    unlockElement('workout-bonus');
  } else if (nextPage == 10) {
    unlockElement('incentive');
  } else if (nextPage == 16) {
    unlockElement('release-or-trade');
  } else if (nextPage == 14) {
    ContractElement.enableSigningConversion();
  }

  currentPage = nextPage;
}

function unlockElement(type: ElementType): void {
  const dom = document.querySelector(`#element-list > .${type}`) as HTMLDivElement;
  dom.classList.remove('locked');
  dom.title = '';
}

// function unlockPage(index: number): void {
//   canAdvanceToPage[index] = true;
//   (document.getElementsByClassName('side-nav')[1] as HTMLElement).classList.remove('disabled');
// }

type ElementType = 'base-salary' | 'gtd-salary' | 'workout-bonus' | 'roster-bonus' |
  'signing-bonus' | 'incentive' | 'release-or-trade' | 'option-bonus';
type June1st = 'pre' | 'post';

abstract class ContractElement {
  private static counter: number = 0;
  private static readonly elemMap: Map<number,ContractElement> = new Map();
  public readonly id: number;
  public readonly type: ElementType;
  protected readonly dollarAmounts: number[] = [0,0,0,0,0,0,0];
  protected lengthInYears: number = 0;
  private readonly dom: HTMLDivElement;
  private static releaseElement: ReleaseOrTrade | null = null;
  private static allowSigninBonusConversion: boolean = false;

  public constructor(type: ElementType,dom: HTMLDivElement) {
    this.id = ContractElement.counter;
    this.type = type;
    this.dom = dom;
    this.dom.id = `element-${this.id}`;
    const inputDOMs = this.dom.querySelectorAll('input');
    for (let i = 0; i < inputDOMs.length; i++) {
      (inputDOMs[i] as HTMLInputElement).oninput = () => this.updateValue(i,inputDOMs[i] as HTMLInputElement);
    }
    (this.dom.querySelector('button.contract-element-delete') as HTMLButtonElement).onclick = () => this.remove();
    if (this instanceof ReleaseOrTrade) {
      ContractElement.releaseElement = this;
      (document.querySelector('#element-list > .contract-element.release-or-trade') as HTMLElement).classList.add('locked');
      (document.querySelector('#element-list > .contract-element.release-or-trade') as HTMLElement).title = 
        'This element cannot be added twice';
    }
    if (this.id == 0) {
      (this.dom.querySelector('.contract-element-delete') as HTMLElement).style.visibility = 'hidden';
    } else {
      (this.dom.querySelector('.contract-element-delete') as HTMLElement).style.visibility = 'visible';
    }
    ContractElement.counter++;
    ContractElement.elemMap.set(this.id,this);
    if (this.type == 'base-salary') {
      // unlockPage(6);
      pageLockList[5].allowAdvance();
    } else if (this.type == 'gtd-salary') {
      // unlockPage(7);
      pageLockList[6].allowAdvance();
    } else if (this.type == 'signing-bonus') {
      // unlockPage(8);
      pageLockList[7].allowAdvance();
    } else if (this.type == 'incentive') {
      // unlockPage(11);
      pageLockList[10].allowAdvance();
    } else if (this.type == 'release-or-trade') {
      // unlockPage(16);
      pageLockList[15].allowAdvance();
    }
    this.addConversionListener();
  }

  public abstract getCapHits(releaseYear: number | undefined,june1st?: June1st): number[];
  public abstract getPayments(releaseYear: number | undefined,june1st?: June1st): number[];

  private updateValue(index: number,dom: HTMLInputElement): void {
    if (dom.value.length == 0) {
      return;
    }
    const dollars = Number(dom.value.replace(/,/g,'').replace(/\$/g,''));
    if (isNaN(dollars) || dollars < 0) {
      dom.value = '0';
      return;
    }
    this.lengthInYears = Math.max(this.lengthInYears,index+1);
    this.dollarAmounts[index] = dollars;
    ContractElement.updateAllElements();
  }
  protected updateOutput(): void {
    const outputDOMs = this.dom.querySelectorAll('div.contract-element-output');
    const dollarDistr = this.getCapHits(
      ContractElement.releaseElement?.getReleaseYear(),
      ContractElement.releaseElement?.getJune1st()
    );
    for (let i = 0; i < outputDOMs.length && i < dollarDistr.length; i++) {
      if (dollarDistr[i] < 0) {
        outputDOMs[i].textContent = '+' + String(Number((-dollarDistr[i]).toFixed(3)));
      } else {
        outputDOMs[i].textContent = String(Number(dollarDistr[i].toFixed(3)));
      }
    }
  }
  protected remove(): void {
    this.dom.remove();
    if (ContractElement.releaseElement?.id == this.id) {
      ContractElement.releaseElement = null;
    }
    const lockedCloneParent = document.querySelector(`.contract-element.${this.type}.locked`) as HTMLDivElement;
    if (lockedCloneParent) {
      lockedCloneParent.classList.remove('locked');
      lockedCloneParent.title = '';
    }
    ContractElement.elemMap.delete(this.id);
    ContractElement.updateAllElements();
  }
  private addConversionListener(): void {
    if (this.type != 'base-salary' || !ContractElement.allowSigninBonusConversion) {
      return;
    }
    const inputDOMs = this.dom.querySelectorAll('input');
    for (const input of inputDOMs) {
      input.ondblclick = (ev: MouseEvent) => {
        this.showConversionOptions(ev.clientX,ev.clientY,input);
      }
    }
  }
  private showConversionOptions(x: number,y: number,input: HTMLInputElement): void {
    if (isNaN(Number(input.value))) {
      input.value = '0';
    }
    let inputDOMIndex: number = -1;
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
    const optionsDOM = document.getElementById('conversion-options') as HTMLElement;
    optionsDOM.style.display = 'block';
    const bottomPixel = y + 250;
    if (bottomPixel > window.innerHeight - 20) {
      optionsDOM.style.top = 'auto';
      optionsDOM.style.bottom = '20px';
    } else {
      optionsDOM.style.top = String(y) + 'px';
      optionsDOM.style.bottom = 'auto';
    }
    optionsDOM.style.left = String( (x + 10) / window.innerWidth * 100 ) + '%';
    for (let i = 0; i < optionsDOM.children.length; i++) {
      const listDOM = optionsDOM.children[i] as HTMLElement;
      const value = Number(listDOM.getAttribute('value'));
      if (value > valueInCell) {
        listDOM.classList.add('disabled');
        listDOM.onclick = null;
      } else {
        listDOM.classList.remove('disabled');
        listDOM.onclick = () => this.convertPortionToSigningBonus(inputDOMIndex,listDOM);
      }
    }
  }
  private convertPortionToSigningBonus(index: number,listDOM: HTMLElement): void {
    if (this.type != 'base-salary') {
      return;
    }
    const value = Number(listDOM.getAttribute('value'));
    if (isNaN(value) || value > this.dollarAmounts[index]) {
      return;
    }
    // unlockPage(15);
    pageLockList[14].allowAdvance();
    (document.getElementById('conversion-options') as HTMLElement).style.display = 'none';
    const baseInputDOM = (this.dom.querySelectorAll('input')[index] as HTMLInputElement);
    baseInputDOM.value = String(this.dollarAmounts[index] - value);
    this.updateValue(index,baseInputDOM);
    const clonedSigningDOM = (document.querySelector('#element-list > .signing-bonus') as HTMLElement).cloneNode(true) as HTMLDivElement;
    clonedSigningDOM.classList.add('in-contract');
    const signingElement = new SigningBonus(clonedSigningDOM);
    const signingInputDOM = (clonedSigningDOM.querySelectorAll('input')[index] as HTMLInputElement);
    signingInputDOM.value = String(value);
    signingElement.updateValue(index,signingInputDOM);
    (document.getElementById('contract-list') as HTMLDivElement).insertBefore(clonedSigningDOM,this.dom.nextSibling);
  }

  protected static updateAllElements(): void {
    const capHits: number[] = new Array(7).fill(0);
    const payments: number[] = new Array(7).fill(0);
    for (const element of ContractElement.elemMap.values()) {
      if (element.type == 'release-or-trade') {
        continue;
      }
      element.updateOutput();
      const elementCapHits = element.getCapHits(
        ContractElement.releaseElement?.getReleaseYear(),
        ContractElement.releaseElement?.getJune1st()
      );
      const elementPayments = element.getPayments(
        ContractElement.releaseElement?.getReleaseYear(),
        ContractElement.releaseElement?.getJune1st()
      );
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
      } else {
        capHitDOMs[i].textContent = String(Number(capHits[i].toFixed(3)));
      }
      if (payments[i] < 0) {
        paymentDOMs[i].textContent = '+' + String(Number((-payments[i]).toFixed(3)));
      } else {
        paymentDOMs[i].textContent = String(Number(payments[i].toFixed(3)));
      }
    }
  }
  public static delete(id: string): void {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return;
    }
    ContractElement.elemMap.delete(numericId);
  }
  public static getOfType(type: ElementType,dom: HTMLDivElement): ContractElement {
    switch(type) {
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
  public static getCount(): number { return ContractElement.counter; }
  public static enableSigningConversion(): void {
    ContractElement.allowSigninBonusConversion = true;
    for (const elem of this.elemMap.values()) {
      elem.addConversionListener();
    }
  }
  protected static getLengthOfContract(): number {
    let length = 0;
    for (const elem of ContractElement.elemMap.values()) {
      length = Math.max(length,elem.lengthInYears);
    }
    return length;
  }
}

class BaseSalary extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('base-salary',dom);
  }
  public getCapHits(releaseYear?: number): number[] {
    if (releaseYear == undefined) {
      return this.dollarAmounts;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    for (let i = 0; i < releaseYear; i++) {
      dollarArray[i] = this.dollarAmounts[i];
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.getCapHits();
  }
}

class GuaranteedSalary extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('gtd-salary',dom);
  }
  public getCapHits(releaseYear?: number,june1st?: June1st): number[] {
    if (releaseYear == undefined) {
      return this.dollarAmounts;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    const accelerateOnto: number = releaseYear + (june1st=='pre'?0:1) - 1;
    for (let i = 0; i < this.dollarAmounts.length; i++) {
      if (i < accelerateOnto) {
        dollarArray[i] += this.dollarAmounts[i];
      } else {
        dollarArray[accelerateOnto] += this.dollarAmounts[i];
      }
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.dollarAmounts;
  }
}

class WorkoutBonus extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('workout-bonus',dom);
  }
  public getCapHits(releaseYear?: number): number[] {
    if (releaseYear == undefined) {
      return this.dollarAmounts;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    for (let i = 0; i < releaseYear; i++) {
      dollarArray[i] = this.dollarAmounts[i];
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.getCapHits();
  }
}

class RosterBonus extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('roster-bonus',dom);
  }
  public getCapHits(releaseYear?: number): number[] {
    if (releaseYear == undefined) {
      return this.dollarAmounts;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    for (let i = 0; i < releaseYear; i++) {
      dollarArray[i] = this.dollarAmounts[i];
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.getCapHits();
  }
}

class SigningBonus extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('signing-bonus',dom);
  }
  private getProratedBonus(): number[] {
    const finalAmounts: number[] = new Array(7).fill(0);
    for (let i = 0; i < this.dollarAmounts.length; i++) {
      const proratedYears = Math.min(7-i,5,ContractElement.getLengthOfContract());
      for (let j = i; j < i + proratedYears; j++) {
        finalAmounts[j] += this.dollarAmounts[i] / proratedYears;
      }
    }
    return finalAmounts;
  }
  public getCapHits(releaseYear?: number,june1st?: June1st): number[] {
    const prorated: number[] = this.getProratedBonus();
    if (releaseYear == undefined) {
      return prorated;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    const accelerateOnto: number = releaseYear + (june1st=='pre'?0:1) - 1;
    for (let i = 0; i < prorated.length; i++) {
      if (i < accelerateOnto) {
        dollarArray[i] += prorated[i];
      } else {
        dollarArray[accelerateOnto] += prorated[i];
      }
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.dollarAmounts;
  }
}

class OptionBonus extends ContractElement {
  public constructor(dom: HTMLDivElement) {
    super('option-bonus',dom);
  }
  private getProratedBonus(): number[] {
    const finalAmounts: number[] = new Array(7).fill(0);
    for (let i = 0; i < this.dollarAmounts.length; i++) {
      const proratedYears = Math.min(7-i,5,ContractElement.getLengthOfContract());
      for (let j = i; j < i + proratedYears; j++) {
        finalAmounts[j] += this.dollarAmounts[i] / proratedYears;
      }
    }
    return finalAmounts;
  }
  public getCapHits(releaseYear?: number,june1st?: June1st): number[] {
    const prorated: number[] = this.getProratedBonus();
    if (releaseYear == undefined) {
      return prorated;
    }
    const dollarArray: number[] = new Array(7).fill(0);
    const accelerateOnto: number = releaseYear + (june1st=='pre'?0:1) - 1;
    for (let i = 0; i < prorated.length; i++) {
      if (i < accelerateOnto) {
        dollarArray[i] += prorated[i];
      } else {
        dollarArray[accelerateOnto] += prorated[i];
      }
    }
    return dollarArray;
  }
  public getPayments(): number[] {
    return this.dollarAmounts;
  }
}

class Incentive extends ContractElement {
  private year: number = 1;
  private status: 'likely' | 'not_likely' = 'likely';
  private achievement: 'achieved' | 'not_achieved' = 'achieved';
  private value: number = 0;

  public constructor(dom: HTMLDivElement) {
    const selectDOMs = dom.querySelectorAll('select');
    selectDOMs[0].oninput = (): void => {
      this.year = Number(selectDOMs[0].value);
      this.lengthInYears = this.year;
      this.updateOutput();
      ContractElement.updateAllElements();
    }
    selectDOMs[1].oninput = (): void => {
      this.status = selectDOMs[1].value as 'likely' | 'not_likely';
      this.updateOutput();
      ContractElement.updateAllElements();
    }
    selectDOMs[2].oninput = (): void => {
      this.achievement = selectDOMs[2].value as 'achieved' | 'not_achieved';
      this.updateOutput();
      ContractElement.updateAllElements();
    }
    super('incentive',dom);
    (dom.querySelector('input') as HTMLInputElement).oninput = (): void => {
      this.value = Number((dom.querySelector('input') as HTMLInputElement).value);
      this.updateOutput();
      ContractElement.updateAllElements();
    }
  }
  public getCapHits(releaseYear?: number): number[] {
    const zeroArray: number[] = new Array(7).fill(0);
    if (releaseYear != undefined && releaseYear - 1 >= this.year) {
      console.log('ret');
      return zeroArray;
    }
    console.log(this.value);
    if (this.status == 'likely' && this.achievement == 'achieved') {
      zeroArray[this.year - 1] = this.value;
    } else if (this.status == 'likely' && this.achievement == 'not_achieved') {
      zeroArray[this.year - 1] = this.value;
      zeroArray[this.year] = -this.value;
    } else if (this.status == 'not_likely' && this.achievement == 'achieved') {
      zeroArray[this.year] = this.value;
    }
    return zeroArray;
  }
  public getPayments(releaseYear?: number): number[] {
    const zeroArray: number[] = new Array(7).fill(0);
    if (releaseYear != undefined && releaseYear - 1 >= this.year) {
      return zeroArray;
    }
    if (this.achievement == 'achieved') {
      zeroArray[this.year - 1] = this.value;
      return zeroArray;
    } else {
      return zeroArray;
    }
  }
}

class ReleaseOrTrade extends ContractElement {
  private releaseYear?: number;
  private june1st: June1st = 'pre';

  public constructor(dom: HTMLDivElement) {
    const selectDOMs = dom.querySelectorAll('select');
    selectDOMs[0].oninput = (): void => {
      this.releaseYear = Number(selectDOMs[0].value);
      ContractElement.updateAllElements();
    }
    selectDOMs[1].oninput = (): void => {
      this.june1st = selectDOMs[1].value as June1st;
      ContractElement.updateAllElements();
    }
    super('release-or-trade',dom);
  }
  public getCapHits(): number[] { return new Array(7).fill(0); }
  public getPayments(): number[] { return new Array(7).fill(0); }
  public getReleaseYear(): number | undefined { return this.releaseYear; }
  public getJune1st(): June1st { return this.june1st; }

  protected remove(): void {
    super.remove();
    ContractElement.updateAllElements();
  }
}

function dragStart(ev: DragEvent): void {
  const elem = ev.target as HTMLElement | null;
  if (elem == null || elem.classList.contains('locked')) {
    ev.preventDefault();
    return;
  }
  (ev.dataTransfer as DataTransfer).setData('text',(ev.target as HTMLElement).classList[1]);
}

function dragOver(ev: Event): void {
  ev.preventDefault();
}

function drop(ev: DragEvent): void {
  ev.preventDefault();
  const type = (ev.dataTransfer as DataTransfer).getData('text');
  addElementToContract(type as ElementType);
  // const parent = document.querySelector(`.contract-element.${type}`);
  // const clone = parent?.cloneNode(true) as HTMLDivElement;
  // clone.classList.remove('locked');
  // clone.classList.add('in-contract');
  // clone.title = '';
  // clone.ondragstart = null;
  // clone.draggable = false;
  // ContractElement.getOfType(type as ElementType,clone);
  // (document.getElementById('contract-list') as HTMLDivElement).appendChild(clone);
}

function addElementToContract(type: ElementType): void {
  const parent = document.querySelector(`.contract-element.${type}`);
  if (parent?.classList.contains('locked')) {
    return;
  }
  const clone = parent?.cloneNode(true) as HTMLDivElement;
  clone.classList.remove('locked');
  clone.classList.add('in-contract');
  clone.title = '';
  clone.ondragstart = null;
  clone.draggable = false;
  ContractElement.getOfType(type,clone);
  const contractDOM = document.getElementById('contract-list') as HTMLDivElement;
  contractDOM.appendChild(clone);
  contractDOM.scrollTo(0,contractDOM.scrollHeight);
  (clone.querySelectorAll('input, select') as NodeListOf<HTMLSelectElement | HTMLInputElement>)[0].focus();
}

function hideConversionOptions(ev: Event): void {
  let isDOMChildOfConversionMenu: boolean = false;
  let iterDOM = ev.target as HTMLElement | null;
  while (iterDOM?.parentElement) {
    if (iterDOM.parentElement.id == 'conversion-options') {
      isDOMChildOfConversionMenu = true;
      break;
    }
    iterDOM = iterDOM.parentElement;
  }
  const conversionMenu = document.getElementById('conversion-options') as HTMLElement;
  if (!isDOMChildOfConversionMenu) {
    conversionMenu.style.display = 'none';
  }
}

declare const google: any;

function googleTranslateElementInit(): void {
  new google.translate.TranslateElement(
    {
      pageLanguage:'en',
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    },
    'google-translate-bar'
  );
}

function toggleTranslateBar(): void { //from html
  const barDOM = document.getElementById('google-translate-bar') as HTMLDivElement;
  barDOM.classList.toggle('hide');
  (document.getElementById('google-translate-btn') as HTMLButtonElement).classList.toggle('expanded');
  const translateFrame = document.querySelector('.skiptranslate > iframe');
  if (translateFrame?.parentElement?.classList.contains('hide')) {
    translateFrame.parentElement.classList.remove('hide');
  } else {
    translateFrame?.parentElement?.classList.add('hide');
  }
}

let formerValue: string = 'Contract Elements';

window.onload = (): void => {
  (document.getElementById('first-name-input') as HTMLInputElement).oninput = () => {
    const fname = (document.getElementById('first-name-input') as HTMLInputElement).value;
    if (fname) {
      for (const spanDOM of document.getElementsByClassName('first-name')) {
        spanDOM.textContent = fname;
      }
    }
  }
  (document.getElementById('last-name-input') as HTMLInputElement).oninput = () => {
    const lname = (document.getElementById('last-name-input') as HTMLInputElement).value;
    if (lname) {
      for (const spanDOM of document.getElementsByClassName('last-name')) {
        spanDOM.textContent = lname;
      }
    }
  }
  document.body.onclick = (ev: MouseEvent) => hideConversionOptions(ev);
  (document.getElementById('contract-list') as HTMLElement).onscroll = (ev: Event) => hideConversionOptions(ev);
  //google translate
  const detectDOM = document.getElementById('google-translate-detector') as HTMLDivElement;
  detectDOM.addEventListener("DOMSubtreeModified", translationCallback, false);
  function translationCallback() {
    const currentValue = detectDOM.textContent;
    const barDOM = document.getElementById('google-translate-bar') as HTMLDivElement;
    if (currentValue && currentValue != formerValue) {
      formerValue = currentValue;
      document.body.style.top = '0';   
      const anchorDOM = document.querySelectorAll('body > div.skiptranslate')[0] as HTMLDivElement;
      anchorDOM.classList.add('google-translate-anchor');
      barDOM.classList.add('full');
      barDOM.classList.remove('hide');
      (document.getElementById('google-translate-btn') as HTMLButtonElement).classList.add('expanded');
    }
    if (currentValue == 'Contract Elements') {
      barDOM.classList.remove('full');
    }
  }
}

window.onkeydown = (ev: KeyboardEvent): void => {
  if (document.activeElement?.classList.contains('contract-element-input') && (ev.key == 'D' || ev.key == 'd')) {
    let iterDOM = ev.target as HTMLElement | null;
    let contractDOM: HTMLElement | null = null;
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
  } else if (ev.key == 'g' || ev.key == 'G') {
    addElementToContract('gtd-salary');
    ev.preventDefault();
  } else if (ev.key == 's' || ev.key == 'S') {
    addElementToContract('signing-bonus');
    ev.preventDefault();
  } else if (ev.key == 'O' || ev.key == 'o') {
    addElementToContract('option-bonus');
    ev.preventDefault();
  } else if (ev.key == 'R' || ev.key == 'r') {
    addElementToContract('roster-bonus');
    ev.preventDefault();
  } else if (ev.key == 'I' || ev.key == 'i') {
    addElementToContract('incentive');
    ev.preventDefault();
  } else if (ev.key == 'T' || ev.key == 't') {
    addElementToContract('release-or-trade');
    ev.preventDefault();
  } else if (ev.key == 'ArrowRight') {
    changePage(1);
  } else if (ev.key == 'ArrowLeft') {
    changePage(-1);
  }
}