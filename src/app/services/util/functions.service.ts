import { Injectable, QueryList } from '@angular/core';
import { AMPERSAND, DateTimeFormat, VisaIcon } from 'src/app/core/constants';
import { Utils } from '../utils';
import { AccordionComponent, AccordionItemComponent } from '@visa/vds-angular';
import { DateUtils } from './dateUtils';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {
  constructor() { }

  private getEncodeValue(value: any): string {
    return encodeURIComponent(value);
  }

  /**
   * for using sortArray() method
   * @param array : Array which needs to sort
   * @param colName : Column name
   * @param index : Index of column
   * @param iconArr : SVG for visual representation
   */
  sortArray(array: any, colName: string, index: number, iconArr: string[]) {
    let sortFactor = 1;

    if (iconArr[index] !== '-descending') {
      iconArr = iconArr.map((res, i) => (index === i ? '-descending' : ''));
    } else {
      iconArr = iconArr.map((res, i) => (index === i ? '-ascending' : ''));
      sortFactor = -1;
    }

    array = array.sort((a: any, b: any) => {
      if (a[colName] > b[colName]) {
        return -1 * sortFactor;
      }
      if (a[colName] < b[colName]) {
        return 1 * sortFactor;
      }
      return 0;
    });

    return { array, iconArr };
  }

  switchTab(selectedTabIndex: number, tabs: string[]) {
    const totalTabs = tabs.length - 1;

    if (selectedTabIndex === totalTabs) {
      selectedTabIndex = 0;
    } else {
      selectedTabIndex++;
    }
  }

  public truncateString(text: string, requiredLength: number, lastString: string) {
    if (Utils.isNotNull(text) && Utils.isNotNull(lastString) && text.length > requiredLength) {
      return text.slice(0, requiredLength - lastString.length) + lastString;
    }
    return text;
  }

  private expandAccordionItem(expand: boolean = true, accordionItemComponent: AccordionItemComponent) {
    accordionItemComponent.isOpen = expand;
    accordionItemComponent.accordionHeading.isOpen = expand;
    accordionItemComponent.accordionHeading.isFocused = expand;
    accordionItemComponent.accordionBody.isOpen = expand;

    accordionItemComponent.accordionHeading.currentIcon = accordionItemComponent.accordionHeading.isOpen
      ? VisaIcon.ARROW_COLLAPSE
      : VisaIcon.ARROW_EXPAND;
    accordionItemComponent.accordionHeading.altText = accordionItemComponent.accordionHeading.isOpen
      ? 'collapse'
      : 'expand';
  }


  public expandAccordionItems(expand: boolean = true, accordions: QueryList<AccordionComponent>) {
    if (Utils.isNotNull(accordions)) {
      accordions.toArray()
        .forEach(accordion => {
          if (accordion) {
            accordion.sections.toArray()
              .forEach(s => this.expandAccordionItem(expand, s));
          }
        });
    }
  }

  public getTabId(viewName: string, tabIndex: number, tabName: string): string {
    return `${viewName}-${tabName}-${tabIndex}`;

  }

  public getTabLabelledById(viewName: string, tabIndex: number, tabName: string): string {
    return `${viewName}-${tabName}-${tabIndex}-tab-label`;
  }

  public scrollToView(elementId: string, delay: number = 100) {
    if (!!elementId) {
      setTimeout(() => {
        const myElement = document.getElementById(elementId);

        if (!!myElement) {
          myElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
        delay
      );
    }
  }

  public prepareParams(params: any) {

    return Object.entries({
      ...params
    })
      .filter(([key, value]) => Utils.isNotNull(value))
      .map(([key, value]) => `${key}=${this.getEncodeValue(value)}`)
      .join(AMPERSAND);

  }

  public parseDateTimeFilters(filters: any = {}, dateKey: string, timeKey: string): string {
    const dateValue = filters[dateKey];
    const timeValue = filters[timeKey];

    const date = DateUtils.formatDateTime(dateValue, DateTimeFormat.MOMENT_YYYY_MM_DD);
    const dateTime = DateUtils.convertLocalDateTimeToUTCDateTime(`${date} ${timeValue}`,
      DateTimeFormat.YYYY_MM_DD_HH_MM_SS);

    return dateTime;
  }
}
