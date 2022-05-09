import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @Input() username: string;
  @Input() messages: Message[];
  messageContent: string;
  loading = false;
  
  constructor(public messageService: MessageService) { }

  ngOnInit(): void {
    //This was moved to "member-detail.component.ts"
    //this.loadMessages();
  }

  sendMessage(){
    this.loading = true;
    this.messageService.sendMessage(this.username, this.messageContent).then(() =>{
      //Removing this line since the messages are already updated with SignalR
      //this.messages.push(message);
      this.messageForm.reset();
    }).finally(() => {
      this.loading = false;
    });
  }
}
