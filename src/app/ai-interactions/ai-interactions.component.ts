import {
  Component,
  HostListener,
  Inject,
  ChangeDetectorRef,
  ElementRef,
  Input,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { L10N_LOCALE, L10nLocale } from 'angular-l10n';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ai-interactions',
  templateUrl: './ai-interactions.component.html',
  styleUrl: './ai-interactions.component.scss',
})
export class AiInteractionsComponent {
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  showModal: boolean = false;
  selectedItem: any = null;
  modalMessage: string = '';
  modalTitle: string = '';
  dropdownIndex: number = -1;
  dataresponse: any;
  data: any[] = [];
  paginationMeta: any = {};
  currentPage: number = 1;
  perPage: number = 15;
  projectId: number = 0;
  isHideRow: boolean = true;
  dropdownOpen = false;
  sortBy: string = '';
  sortDir: string = '';
  page: number = 0;
  isMeeting: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    @Inject(L10N_LOCALE) public lang: L10nLocale
  ) {}

  ngOnInit() {
    this.route.params.subscribe((result: any) => {
      this.projectId = result.id;
    });
    this.handleRowVisibility();

    const urlSegments = this.route.snapshot.url.map((segment) => segment.path);

    this.isMeeting = urlSegments.includes('meeting-notes');

    this.getOpenAiResponserequest(this.currentPage);
    this.listenForNewResponses();
    console.log(this.isMeeting , "ngOnit")
  }
  ngOnDestroy() {
    // Clean up subscriptions to avoid memory leaks or multiple subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private handleRowVisibility(): void {
    const currentUrl = this.router.url;
    this.isHideRow =
      currentUrl.includes(`/project/${this.projectId}/ai-interactions`) ||
      currentUrl.includes(`/project/${this.projectId}/meeting-notes`);
  }

  getOpenAiResponserequest(page: number) {
    if(this.isMeeting === false){
      console.log("ai call")
      this.getAiResponse(page)

    }
    else{
      console.log("meeting call")
      this.getMeeting(page)
    }
    this.cdr.detectChanges();
  }
  getMeeting(page: number){
    // if(this.isMeeting === true){
    //   this.service.getAllMeetingNotes(page,
    //     this.perPage,
    //     this.projectId,
    //     this.sortBy,
    //     this.sortDir)
    //     .subscribe((response: any) => {
    //       if (response && response.data) {
    //         this.data = response.data || [];
    //         this.paginationMeta = response.meta || {};
    //         this.currentPage = response.meta?.current_page || 1;
    //       }
    //     });
    // }

  }
  getAiResponse(page : number){
    // if(this.isMeeting === false){
    //   this.service
    //   .getOpenAiResponse(
    //     page,
    //     this.perPage,
    //     this.projectId,
    //     this.sortBy,
    //     this.sortDir
    //   )
    //   .subscribe((response: any) => {
    //     if (response && response.data) {
    //       this.data = response.data || [];
    //       this.paginationMeta = response.meta || {};
    //       this.currentPage = response.meta?.current_page || 1;
    //     }
    //   });
    // }

  }

  onSortClick(sortBy: string): void {
    this.sortDir =
      this.sortBy === sortBy && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortBy = sortBy;
    // if (this.isMeeting) {
      // this.getMeeting(this.currentPage);
    // } else {
      this.getOpenAiResponserequest(this.currentPage);
    // }
  }

  edittxst(dataresponse: any, index: number) {
    this.dropdownIndex = -1;
    // this.service.setTranscriptionData(dataresponse);
    this.scrollToTop();
    if (this.dropdownIndex === index) {
      this.dropdownIndex = -1;
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  toggleDropdown(index: number): void {
    this.dropdownIndex = this.dropdownIndex === index ? -1 : index;
  }

  private listenForNewResponses(): void {
    // this.service.newAiResponse$.subscribe((newResponse) => {
    //   if (newResponse && newResponse.isUpdate) {
    //     this.updateExistingResponse(newResponse);
    //   } else if (newResponse && !newResponse.isUpdate) {
    //     this.addNewResponse(newResponse);
    //   }
    // });
  }


  private updateExistingResponse(newResponse: any): void {
    const index = this.data.findIndex((item) => item.id === newResponse.id);
    if (index > -1) {
      this.data[index] = { ...this.data[index], ...newResponse };
      this.cdr.detectChanges();
    }
  }

  private addNewResponse(newResponse: any): void {
    this.data = [newResponse, ...this.data];
    if (this.isMeeting) {
      this.getMeeting(this.currentPage);
    } else {
      this.getAiResponse(this.currentPage);
    }
    this.cdr.detectChanges();
  }


  deleteai(dataresponse: any, index: number): void {
    this.selectedItem = dataresponse;
    this.modalMessage = `Are you sure you want to delete this item: "${dataresponse.transcript}"?`;
    this.modalTitle = 'Confirm Deletion';
    this.showModal = true;
    if (this.dropdownIndex === index) {
      this.dropdownIndex = -1;
    }
  }

  onModalClose(confirmed: boolean): void {
    this.showModal = false;
    if (confirmed && this.selectedItem) {
      this.deleteResponse();
    }
    this.selectedItem = null;
  }
  private deleteResponse(): void {
    // if (this.isMeeting === true) {
    //   this.service
    //     .deleteMeetingNote(this.projectId, this.selectedItem?.id)
    //     .subscribe(
    //       (response) => {
    //         this.cdr.detectChanges();
    //         this.toastr.success(response.message, 'Success');
    //         this.getOpenAiResponserequest(this.currentPage);
    //       },
    //       (error) => {
    //         console.error('Error deleting item', error);
    //         this.toastr.error('Failed to delete item', 'Error');
    //       }
    //     );
    // } else {
    //   this.service.deleteData(this.projectId, this.selectedItem.id).subscribe(
    //     (response) => {
    //       // this.data = this.data.filter(item => item.id !== this.selectedItem.id);
    //       this.cdr.detectChanges();
    //       this.toastr.success('Item deleted successfully', 'Success');
    //       this.getOpenAiResponserequest(this.currentPage)
    //     },
    //     (error) => {
    //       console.error('Error deleting item', error);
    //       this.toastr.error('Failed to delete item', 'Error');
    //     }
    //   );
    // }
  }

  nextPage() {
    this.dropdownIndex = -1
    if (this.paginationMeta?.current_page < this.paginationMeta?.last_page) {
      this.getOpenAiResponserequest(this.paginationMeta?.current_page + 1);
    }
  }

  prevPage() {
    if (this.paginationMeta?.current_page > 1) {
      this.getOpenAiResponserequest(this.paginationMeta?.current_page - 1);
    }
  }
  goToPage(page: number) {
    this.dropdownIndex = -1
    if (page >= 1 && page <= this.paginationMeta?.last_page) {
      this.getOpenAiResponserequest(page);
    }
  }
  getPageNumbers(): number[] {
    const range: number[] = [];
    const totalPages = this.paginationMeta?.last_page;
    const currentPage = this.paginationMeta?.current_page;

    if (!totalPages || !currentPage) {
      return range;
    }

    const rangeSize = 5;

    let start = currentPage - Math.floor(rangeSize / 2);
    let end = currentPage + Math.floor(rangeSize / 2);

    if (start < 1) {
      start = 1;
      end = Math.min(rangeSize, totalPages);
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - rangeSize + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }
}
