import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { Resource, SchedulerEvent } from '@progress/kendo-angular-scheduler';
import {
  BehaviorSubject,
  debounceTime,
  fromEvent,
  Observable,
  Subject,
  throttle,
} from 'rxjs';
import { displayDate, sampleData } from './events';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  // @ViewChild('.k-scheduler-times')
  // protected container: ElementRef<HTMLElement> | undefined;

  title = 'test';
  private currentYear = new Date().getFullYear();
  public selectedDate = new Date(this.currentYear, 5, 24);

  public events: SchedulerEvent[];
  public group: any = {
    resources: ['Rooms'],
    orientation: 'vertical',
  };

  public resources$ = new BehaviorSubject<Resource[]>([]);

  public resourceContainer: HTMLElement | undefined;

  // items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);

  private currentOffset = 0;
  private resourceSize = 4000;

  constructor(private _elementRef: ElementRef) {
    this.resources$.next([
      {
        name: 'Rooms',
        data: [...this.addData()],
        field: 'roomId',
        valueField: 'value',
        textField: 'text',
        colorField: 'color',
      },
    ]);

    this.events = this.generateEvents();
  }

  ngAfterViewInit(): void {
    this.resourceContainer = (
      this._elementRef.nativeElement as HTMLElement
    ).getElementsByClassName('k-scheduler-content')[0] as HTMLElement;

    const scroll$ = fromEvent(this.resourceContainer, 'scroll', {
      passive: true,
    });

    scroll$.pipe(debounceTime(10)).subscribe((ev) => {
      this.scrolled(ev);
    });
  }

  scrolled(ev: any) {
    if (!this.resourceContainer || !this.resourceContainer.offsetParent) return;

    const maxScroll =
      this.resourceContainer.scrollHeight - this.resourceContainer.offsetHeight;
    const scroll = this.resourceContainer.scrollTop;
    const scrollLeft = this.resourceContainer.scrollLeft;
    const padding = 75;
    if (
      maxScroll - padding < scroll &&
      this.currentOffset < this.resourceSize
    ) {
      console.log('bottom');
      this.currentOffset += 10;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTo(scrollLeft, padding);
    } else if (scroll < padding && this.currentOffset > 0) {
      console.log('top');
      this.currentOffset -= 10;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTo(scrollLeft, maxScroll - padding);
    }
  }

  addRessources(offset = 0) {
    this.resources$.next([
      {
        ...this.resources$.value[0],
        data: [...this.addData(offset)],
      },
    ]);
  }

  addData(offset = 0) {
    const result = [];
    for (let index = Math.max(offset - 5, 0); index < offset + 15; index++) {
      result.push({
        text: 'Meeting Room ' + index,
        value: index,
        color: '#6eb3fa',
      });
    }
    return result;
  }

  generateEvents(length: number = 1000): SchedulerEvent[] {
    const result: SchedulerEvent[] = [];

    for (let index = 0; index < length; index++) {
      const start = new Date(this.selectedDate);
      const end = new Date(this.selectedDate);
      start.setHours(this.randomInt(8, 10), 0, 0, 0);
      end.setHours(this.randomInt(11, 13), 0, 0, 0);
      result.push(<SchedulerEvent>{
        id: index,
        start,
        end,
        isAllDay: false,
        title: 'Event ' + index,
        description: 'Event ' + index,
        roomId: this.randomInt(0, this.resourceSize),
      });
    }

    console.log(result)
    return result;
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
