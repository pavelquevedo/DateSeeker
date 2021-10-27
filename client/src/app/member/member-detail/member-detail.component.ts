import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(private memberService: MembersService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadMember();

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

    
  }

  getImages(): NgxGalleryImage[]{
    const imageUrls = [];
    for(const photo of this.member.photos){
      imageUrls.push({
        small: photo.url,
        medium: photo.url,
        big: photo.url
      });
    }
    return imageUrls;
  }
  
  loadMember(){
    this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(member => {
      this.member = member;
      this.galleryImages = this.getImages();
      // this.galleryImages = [
      //   {
      //     small: 'https://preview.ibb.co/jrsA6R/img12.jpg',
      //     medium: 'https://preview.ibb.co/jrsA6R/img12.jpg',
      //     big: 'https://preview.ibb.co/jrsA6R/img12.jpg'
      //   },
      //   {
      //     small: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      //     medium: 'https://preview.ibb.co/kPE1D6/clouds.jpg',
      //     big: 'https://preview.ibb.co/kPE1D6/clouds.jpg'
      //   },
      //   {
      //     small: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      //     medium: 'https://preview.ibb.co/mwsA6R/img7.jpg',
      //     big: 'https://preview.ibb.co/mwsA6R/img7.jpg'
      //   },{
      //     small: 'https://preview.ibb.co/kZGsLm/img8.jpg',
      //     medium: 'https://preview.ibb.co/kZGsLm/img8.jpg',
      //     big: 'https://preview.ibb.co/kZGsLm/img8.jpg'
      //   },      
      // ]; 
    })
  }

}
