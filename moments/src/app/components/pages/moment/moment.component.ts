import { Component, OnInit } from '@angular/core';

import { MomentService } from 'src/app/services/moment.service';
import { Moment } from 'src/app/Moment';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MessagesService } from'src/app/services/messages.service';
import { Comment } from 'src/app/Comments';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { CommentService } from 'src/app/services/comment.service';


@Component({
  selector: 'app-moment',
  templateUrl: './moment.component.html',
  styleUrls: ['./moment.component.css']
})
export class MomentComponent implements OnInit {
  moment?: Moment;
  baseApiUrl = environment.baseApiUrl;
  faTrash = faTrash;
  faEdit = faEdit;
  showConfirmationModal = false;
  momentIdToDelete: number | null = null;

  commentForm!: FormGroup;

  constructor(private momentService: MomentService, 
              private route: ActivatedRoute, 
              private messagesService: MessagesService,
              private router: Router,
              private commentService: CommentService
  ){}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.momentService.getMoment(id).subscribe((item) => {
      this.moment = item.data;
    });
    this.commentForm = new FormGroup({
      text: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    })
  }

  get text(){
    return this.commentForm.get('text')!;
  }

  get username(){
    return this.commentForm.get('username')!;
  }

  async confirmRemove(momentId: number): Promise<void> {
    const confirmed = confirm('Você tem certeza que deseja deletar este momento?');
    if (confirmed) {
      await this.removeHandler(momentId);
    }
  }

  openConfirmationModal(momentId: number) {
    this.momentIdToDelete = momentId;
    this.showConfirmationModal = true;
  }

  onConfirmed() {
    if (this.momentIdToDelete !== null) {
      this.removeHandler(this.momentIdToDelete);
    }
    this.showConfirmationModal = false;
  }

  onCanceled() {
    this.showConfirmationModal = false;
    this.momentIdToDelete = null;
  }

  async removeHandler(id: number): Promise<void> {
    try {
      await this.momentService.removeMoment(id).toPromise();
      this.messagesService.add('Momento excluído com sucesso!');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erro ao excluir momento', error);
      this.messagesService.add('Erro ao excluir momento.');
    }
  }

  async onSubmit(formDirective: FormGroupDirective){
    if (this.commentForm.invalid){
      return;
    }

    const data = this.commentForm.value;

    data.momentId = Number(this.moment!.id);

    await this.commentService.createComment(data).subscribe((comment) => this.moment!.comments.push(comment.data));

    this.messagesService.add("Comentário adicionado!");

    this.commentForm.reset();

    formDirective.resetForm();
  }

}
