import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'females'}];

  constructor(private memberService: MembersService) {
    //This was moved to members.service.ts in order to cache user params selection   
    // this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
    //   this.user = user;
    //   this.userParams = new UserParams(user);
    // })

    //This is the new way to get cached params, because services are singleton so the selection will remain during the application lifecycle
    this.userParams = this.memberService.getUserParams();
   }

  ngOnInit(): void {
    this.loadMembers();
    //this.members$ = this.memberService.getMembers();
  }

  loadMembers(){
    //Caching params selection
    this.memberService.setUserParams(this.userParams);    
    
    this.memberService.getMembers(this.userParams).subscribe(response =>{
      this.members = response.result;
      this.pagination = response.pagination;
    });
  }

  resetFilters(){
    //Old way to reset user params
    //this.userParams = new UserParams(this.user);

    //New way to reset user params from the service
    this.userParams = this.memberService.resetUserParams();

    this.loadMembers();
  }

  pageChanged(event: any){
    this.userParams.pageNumber = event.page;
    //Caching params since the selection changed        
    this.memberService.setUserParams(this.userParams);
    this.loadMembers();
  }

}
