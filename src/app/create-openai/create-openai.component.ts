import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Renderer2,
} from '@angular/core';
// import { CeateOpenaiService } from './ceate-openai.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { format } from 'date-fns';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { L10nLocale, L10N_LOCALE, L10nTranslationModule } from 'angular-l10n';
import { ToastrService } from 'ngx-toastr';
import { marked } from 'marked';

@Component({
  selector: 'app-create-openai',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    L10nTranslationModule,
    ReactiveFormsModule,
    LMarkdownEditorModule,
  ],
  templateUrl: './create-openai.component.html',
  styleUrl: './create-openai.component.scss',
})
export class CreateOpenaiComponent {
  isDataLoading: boolean = true;
  createform!: FormGroup;
  isNoDataFound: boolean = false;
  transcriptionHistory: string[] = [];
  isSidebarOpen = false;
  dropdownOpen = false;
  lastCreatedAtId: any;
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  private transcriptionSubscription: Subscription | null = null;

  isVisible: boolean = false;
  transcription: string = '';
  aiResponse: string = '';
  isRecording: boolean = false;
  isEditing: boolean = false;
  editedText: string = '';
  aiResponses: string[] = [];
  data: any[] = [];
  projectnames: any[] = [];
  projectname: any;
  paginationMeta: any = {};
  currentPage: number = 1;
  perPage: number = 15;
  projectId: number = 0;
  aiId: any;
  audioBlob: Blob | null = null;
  mediaRecorder: any;
  silenceTimeout: any;
  openAiResponse: string = '';
  spacebarTimer: any;
  minHoldTime = 100;
  isLoading: boolean = false;
  isLoadingSaveData = false;
  isUpdate: boolean = false;
  sortBy: string = '';
  sortDir: string = '';
  aires: boolean = false;
  image: any;
  templateId: number = 0;
  isProcessing = false;
  private typingSubject = new Subject<string>();
  page: number = 0;
  previewContent: string = '';
  aitrancriptId: number = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    // private openAIService: CeateOpenaiService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    @Inject(L10N_LOCALE) public lang: L10nLocale
  ) {
    this.route.params.subscribe((result: any) => {
      this.projectId = result.id;
    });
    this.formpromoInitialization();

    this.typingSubject.pipe(debounceTime(2000)).subscribe(() => {
      this.savedata();
    });
  }

  formpromoInitialization() {
    this.createform = this.fb?.group({
      transcription: ['', [Validators.required]],
      airesponse: ['', [Validators.required]],
    });
  }

  get trancript() {
    return this.createform.get('transcription');
  }

  get airesponse() {
    return this.createform.get('airesponse');
  }

  ngOnInit() {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.getprojectname();
    this.updatetranscript();
    // this.openAIService.fetchProjectById(this.projectId)
  }

  @HostListener('window:keydown', ['$event'])
  onSpacebarPress(event: KeyboardEvent) {
    if (event.code === 'Space') {
      const isInputElement =
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLInputElement;
      if (!isInputElement) {
        if (event.code === 'Space' && !this.isRecording) {
          this.spacebarTimer = setTimeout(() => {
            this.startRecording();
          }, this.minHoldTime);
        }
        event.preventDefault();
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onSpacebarRelease(event: KeyboardEvent) {
    if (event.code === 'Space') {
      clearTimeout(this.spacebarTimer);
      if (this.isRecording) {
        this.stopRecording();
      }
    }
  }

  startRecording() {
    this.isLoading = true;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.isRecording = true;

        const audioChunks: BlobPart[] = [];

        this.mediaRecorder.addEventListener('dataavailable', (event: any) => {
          audioChunks.push(event.data);
        });

        this.mediaRecorder.addEventListener('stop', () => {
          this.audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

          if (this.audioBlob) {
            this.isSilent(this.audioBlob).then((isSilent) => {
              if (isSilent) {
                this.isProcessing = false;
                this.toastr.warning(
                  'No significant audio detected.',
                  'Warning'
                );
                this.transcriptionHistory.push(this.transcription);
                this.isLoading = false;
              } else {
                this.transcribeAudio();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Error accessing audio stream:', error);
        this.isLoading = false;
      });
  }

  stopRecording() {
    this.isRecording = false;
    this.isProcessing = true;
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
  }

  transcribeAudio() {
    if (this.audioBlob) {
      const audioFile = new File([this.audioBlob], 'recording.wav', {
        type: 'audio/wav',
      });

      // this.openAIService.transcribeAudio(audioFile, 'en').subscribe(
      //   (response: any) => {
      //     if (response && response.text) {
      //       this.transcription += ' ' + response.text;
      //       this.transcriptionHistory.push(this.transcription);
      //       this.savedata();
      //     }
      //     this.isProcessing = false;
      //     this.isLoading = false;
      //   },
      //   (error) => {
      //     console.error('Transcription error:', error);
      //     this.isLoading = false;
      //   }
      // );
    }
  }

  isSilent(audioBlob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      const audioContext = new AudioContext();
      const reader = new FileReader();

      reader.onload = () => {
        audioContext.decodeAudioData(reader.result as ArrayBuffer, (buffer) => {
          const channelData = buffer.getChannelData(0);
          const totalSamples = channelData.length;

          let sum = 0;
          for (let i = 0; i < totalSamples; i++) {
            sum += Math.abs(channelData[i]);
          }
          const averageAmplitude = sum / totalSamples;

          resolve(averageAmplitude < 0.01);
        });
      };
      reader.readAsArrayBuffer(audioBlob);
    });
  }

  onTextInput(event: any) {
    this.transcription = event.target.value;
    this.typingSubject.next(this.transcription);
    this.cdr.detectChanges();
  }

  savedata() {
    if (this.aitrancriptId !== 0) {
      this.saveapi(false);
      return;
    }
    const newEntry = {
      transcript: this.transcription,
      ai_response: '',
      template_id: this.templateId,
      created_at: format(new Date(), 'dd MMM. yyyy HH:mm:ss'),
      isUpdate: false,
    };
    this.isLoadingSaveData = true;
    // this.openAIService
    //   .createqustion(this.transcription, newEntry, this.projectId)
    //   .subscribe(
    //     (response) => {
    //       this.isLoadingSaveData = false;
    //       if (response) {
    //         this.openAIService.addAiResponse({
    //           ...response.ai_interaction_id,
    //           isUpdate: false,
    //         });
    //         this.aitrancriptId = response.ai_interaction_id.id;
    //         this.aires = false;
    //         this.isRecording = false;
    //         this.cdr.detectChanges();
    //       }
    //     },
    //     (error) => {
    //       console.log('error', error);
    //     }
    //   );
    }

  saveText() {
    this.isLoading = true;
    this.aires = false;
    // this.getAIResponse(this.transcription)
    //   .then((aiResponseText: string) => {
    //     this.aiResponse = aiResponseText;
    //     this.isLoading = false;
    //   })
    //   .catch(() => {
    //     this.isLoading = false;
    //   });
    this.cdr.detectChanges();
  }

// async getAIResponse(prompt: string): Promise<string> {
//   try {
//     // const response = await this.openAIService.getResponse([prompt]);
//     this.aiResponse = response;
//     this.createform.get('airesponse')?.setValue(this.aiResponse);
//     this.aires = true
//     return response;
//   } catch (error) {
//     console.error('Error generating AI response:', error);
//     return 'Something went wrong while generating the response.';
//   }
// }

  saveapi(isreset: boolean = true): void {
    // this.openAIService
    //   .getOpenAiResponse(
    //     this.page,
    //     this.perPage,
    //     this.projectId,
    //     this.sortBy,
    //     this.sortDir
    //   )
    //   .subscribe((response: any) => {
    //     if (response && response.data && response.data.length > 0) {
    //       this.data = response.data || [];
    //       const sortedData = this.data.sort(
    //         (a, b) =>
    //           new Date(b.created_at).getTime() -
    //           new Date(a.created_at).getTime()
    //       );
    //       this.lastCreatedAtId = sortedData[0]?.id;
    //       try {
    //         // const template_id = this.CategoryService.getTemplateId();
    //         const updatedData = {
    //           transcript: this.transcription,
    //           ai_response: this.aiResponse,
    //           // template_id: template_id,
    //           // image: this.CategoryService.getImage(),
    //           created_at: format(new Date(), 'dd MMM. yyyy HH:mm:ss'),
    //           isUpdate: true,
    //           id: this.lastCreatedAtId,
    //         };
    //         this.isLoadingSaveData = true;
    //         this.openAIService
    //           .updateTranscription(
    //             this.projectId,
    //             updatedData,
    //             this.lastCreatedAtId
    //           )
    //           .subscribe(
    //             (response: any) => {
    //               this.isLoadingSaveData = false;
    //               if (isreset) {
    //                 this.toastr.success('Data saved successfully!');
    //               }
    //               this.aiResponse = updatedData.ai_response;
    //               this.openAIService.addAiResponse(updatedData);

    //               if (response) {
    //                 if (isreset) {
    //                   this.createform.reset();
    //                   this.aitrancriptId = 0;
    //                   this.aiId = '';
    //                   this.transcription = '';
    //                   this.aiResponse = '';
    //                   this.templateId = 0;
    //                 }
    //                 this.aires = false;
    //                 this.cdr.detectChanges();
    //                 this.isRecording = false;
    //               }
    //             },
    //             (HttpErrorResponse) => {
    //               this.isLoadingSaveData = false;
    //               if (
    //                 HttpErrorResponse.status === 422 &&
    //                 HttpErrorResponse.error
    //               ) {
    //                 if (HttpErrorResponse.error.transcript) {
    //                   this.trancript?.setErrors({
    //                     serverError: HttpErrorResponse.error.name.join(', '),
    //                   });
    //                 }
    //                 if (HttpErrorResponse.error.description) {
    //                   this.airesponse?.setErrors({
    //                     serverError:
    //                       HttpErrorResponse.error.description.join(', '),
    //                   });
    //                 }
    //                 this.toastr.error('Please fix the form errors.');
    //               } else {
    //                 this.toastr.error(HttpErrorResponse.error.message);
    //               }
    //             }
    //           );
    //       } catch (error) {
    //         this.toastr.error('An unexpected error occurred.');
    //         this.isLoadingSaveData = false;
    //       }
    //     }
    //   });
   }

  private updatetranscript(): void {
    // this.transcriptionSubscription =
      // this.openAIService.transcription$.subscribe((data: any) => {
      //   this.isEditing = true;
      //   this.transcription = data.transcript;
      //   this.aiResponse = data.ai_response;
      //   this.aiId = data.id;
      //   this.aitrancriptId = data.id;
      //   this.templateId = data.template.id;
      // });
        this.aires = true;
    }

  update(aiResponse: any) {
    if (this.createform.invalid) {
      this.createform.markAllAsTouched();
      return;
    }
    const image = this.image;
    const updatedData = {
      transcript: this.transcription,
      ai_response: aiResponse,
      template_id: this.templateId,
      image: image,
      created_at: format(new Date(), 'dd MMM. yyyy HH:mm:ss'),
      isUpdate: true,
      id: this.aiId,
    };
    // this.openAIService.addAiResponse(updatedData);
    this.isLoadingSaveData = true;
    // this.openAIService
    //   .updateTranscription(this.projectId, updatedData, this.aiId)
    //   .subscribe(
    //     (response) => {
    //       this.isLoadingSaveData = false;
    //       if (response) {
    //       }
    //       this.createform.reset();
    //        this.transcription = '';
    //        this.aiResponse ='';
    //       this.aires = false;
    //       this.isEditing = false;
    //       this.aitrancriptId =0;
    //       this.cdr.detectChanges();
    //       this.toastr.success(response.message);
    //     },

    //     (HttpErrorResponse) => {
    //       this.isLoadingSaveData = false;
    //       if (HttpErrorResponse.status === 422 && HttpErrorResponse.error) {
    //         if (HttpErrorResponse.error.transcript) {
    //           this.trancript?.setErrors({
    //             serverError: HttpErrorResponse.error.name.join(', '),
    //           });
    //         }
    //         if (HttpErrorResponse.error.description) {
    //           this.airesponse?.setErrors({
    //             serverError: HttpErrorResponse.error.description.join(', '),
    //           });
    //         }
    //         this.toastr.error('Please fix the form errors.');
    //       } else {
    //         this.toastr.error(HttpErrorResponse.error.message);
    //       }
    //     }
      // );
  }
  showResponse() {
    this.isVisible = true;
  }
  getprojectname() {
    this.isDataLoading = true;
    try {
      // this.projectService.getProject().subscribe(
      //   (response: any) => {
      //     if (response && response.data) {
      //       const project = response.data.find(
      //         (item: any) => item.id === this.projectId
      //       );
      //       this.projectname = project;
      //     }
      //     this.isDataLoading = false;
      //   },
      //   (error) => {
      //     console.error('Error fetching project:', error);
      //     this.isDataLoading = false;
      //   }
      // );
    } catch (error) {
      console.log(error);
      this.isDataLoading = false;
    }
  }

  cancel() {
    this.createform.reset();
    this.isRecording = false;
    this.transcription = '';
    this.aiResponse = '';
    this.isEditing = false;
     this.aires = false;
     this.image = null;
     this.aiId = null;
  }

  preRenderFunc(content: string) {
    return content.replace(/something/g, 'new value');
  }

  postRenderFunc(content: string) {
    this.previewContent = content;
    this.aiResponse = content
    return content.replace(/something/g, 'new value');
  }

  onEditorLoaded(event: any): void {
  }

  onPreviewDomChanged(event: any): void {
    if (event && event.target instanceof HTMLElement) {
      const previewHtmlContent = event.target.innerHTML;
      this.previewContent = previewHtmlContent;
    } else {
    }
  }
}
