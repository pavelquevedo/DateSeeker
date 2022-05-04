import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;
  activeTab: TabDirective;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  messages: Message[] = [];
  user: User;

  constructor(public presence: PresenceService,
      private messageService: MessageService,
      private accountService: AccountService,
      private route: ActivatedRoute,
      private router: Router) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => this.user = user)
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  ngOnInit(): void {

    //this.loadMember();
    //We're replacing the "loadMember" method for the route resolver for MemberDetail, since we need the data 
    //before rendering the template.
    this.route.data.subscribe(data => {
      this.member = data.member;
    })

    this.route.queryParams.subscribe(params => {
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        thumbnailsColumns: 4,
        arrowPrevIcon: 'fa fa-chevron-left',
        arrowNextIcon: 'fa fa-chevron-right',
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];

    this.galleryImages = this.getImages();

  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url
      });
    }
    return imageUrls;
  }

  //Unused loadMember function, since it was replaced for a route resolver.
  // loadMember(){
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => {
  //     this.member = member;
  //     this.galleryImages = this.getImages();
  //     // this.galleryImages = [
  //     //   {
  //     //     small: 'https://preview.ibb.co/jrsA6R/img12.jpg',
  //     //     medium: 'https://preview.ibb.co/jrsA6R/img12.jpg',
  //     //     big: 'https://preview.ibb.co/jrsA6R/img12.jpg'
  //     //   },
  //     //   {
  //     //     small: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
  //     //     medium: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
  //     //     big: 'https://preview.ibb.co/kPE1D6/clouds.jpg'
  //     //   },
  //     //   {
  //     //     small: 'https://preview.ibb.co/mwsA6R/img7.jpg',
  //     //     medium: 'https://preview.ibb.co/mwsA6R/img7.jpg',
  //     //     big: 'https://preview.ibb.co/mwsA6R/img7.jpg'
  //     //   },{
  //     //     small: 'https://preview.ibb.co/kZGsLm/img8.jpg',
  //     //     medium: 'https://preview.ibb.co/kZGsLm/img8.jpg',
  //     //     big: 'https://preview.ibb.co/kZGsLm/img8.jpg'
  //     //   },      
  //     // ]; 
  //   })
  // }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0) {
      //Removed to use the SignalR behavior
      //this.loadMessages();    
      this.messageService.createHubConnection(this.user, this.member.username);
    } else {
      this.messageService.stopHubConnection();
    }
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.username).subscribe(messages => {
      this.messages = messages;
    });
  }

}
