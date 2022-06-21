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
  throttleTime,
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
  private maxEvents = 10000;

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

    this.events = this.generateEvents(this.maxEvents);
  }

  ngAfterViewInit(): void {
    this.resourceContainer = (
      this._elementRef.nativeElement as HTMLElement
    ).getElementsByClassName('k-scheduler-content')[0] as HTMLElement;

    const scroll$ = fromEvent(this.resourceContainer, 'scroll', {
      passive: true,
    });

    scroll$.pipe(debounceTime(50)).subscribe((ev) => {
      this.scrolled(ev);
    });
  }

  scrolled(ev: any) {
    if (!this.resourceContainer || !this.resourceContainer.offsetParent) return;

    const maxScroll =
      this.resourceContainer.scrollHeight - this.resourceContainer.offsetHeight;
    const scrollTop = this.resourceContainer.scrollTop;
    const scrollLeft = this.resourceContainer.scrollLeft;

    //TODO calculer la position de la scrollbar en fonction de l'élément visible au moment du changement de ressource
    //TODO corriger le problème lorsque l'on scroll vers le haut
    const padding = 50;
    if (
      maxScroll - padding < scrollTop &&
      this.currentOffset < this.resourceSize
    ) {
      console.log(scrollTop, 'bottom');
      this.currentOffset += 10;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTop = (2 * padding);
    } else if (scrollTop < padding && this.currentOffset > 0) {
      console.log(scrollTop,'top');
      this.currentOffset -= 10;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTop =  maxScroll - (2 * padding);
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

  generateEvents(length: number): SchedulerEvent[] {
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

    return result;
  }

  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
