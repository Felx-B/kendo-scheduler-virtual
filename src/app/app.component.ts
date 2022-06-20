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
  public selectedDate: Date = displayDate;
  public events: SchedulerEvent[] = sampleData;
  public group: any = {
    resources: ['Rooms'],
    orientation: 'vertical',
  };

  public resources$ = new BehaviorSubject<Resource[]>([]);

  public resourceContainer: HTMLElement | undefined;

  // items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);

  private currentOffset = 0;
  private maxOffset = 40;

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
      // this.addRessources();
    });
    // this.resourceContainer.addEventListener(
    //   'scroll',
    //   (ev: Event) => {
    //     this.scrolled(ev);
    //   },
    //   { passive: true }
    // );
  }

  scrolled(ev: any) {
    if (!this.resourceContainer || !this.resourceContainer.offsetParent) return;
    // const scrollTop = this.resourceContainer.scrollTop;
    // const offsetHeight = this.resourceContainer.offsetHeight;
    // if (scrollTop > 140) {
    //   this.addRessources()
    // }

    // var offset =  this.resourceContainer.getBoundingClientRect().top -  this.resourceContainer.offsetParent.getBoundingClientRect().top;
    // const top = window.innerHeight - offset;

    // console.log(this.resourceContainer.getBoundingClientRect().height);
    // console.log();
    const maxScroll =
      this.resourceContainer.scrollHeight - this.resourceContainer.offsetHeight;
    const scroll = this.resourceContainer.scrollTop;
    if (maxScroll === scroll && this.currentOffset < this.maxOffset) {
      console.log('bottom');
      this.currentOffset++;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTo(0, 0);
    } else if (scroll === 0 && this.currentOffset > 0) {
      console.log('top');
      this.currentOffset--;
      this.addRessources(this.currentOffset);
      this.resourceContainer.scrollTo(0, maxScroll);
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
    for (let index = 0; index < 10; index++) {
      result.push({
        text: 'Meeting Room ' + offset * 10 + index,
        value: 1,
        color: '#6eb3fa',
      });
    }
    return result;
  }
}
