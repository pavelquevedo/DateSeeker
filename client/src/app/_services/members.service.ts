import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization: 'Bearer '+JSON.parse(localStorage.getItem('user') || '{}').token
//   })
// }

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  baseUrl = environment.apiUrl;
  members: Member[] = [];
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>();

  constructor(private http: HttpClient) { }

  getMembers(page?: number, itemsPerPage?: number){
    let params = new HttpParams();

    if (page !== null && itemsPerPage !== null) {
      params = params.append('pageNumber', page.toString());
      params = params.append('pageSize', itemsPerPage.toString());  
    }
    
    return this.http.get<Member[]>(this.baseUrl+'users', {observe: 'response', params}).pipe(
      map(response =>{
        this.paginatedResult.result = response.body;
        if(response.headers.get('Pagination') !== null){
          this.paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'))
        }

        return this.paginatedResult;
      })
    );
  }  

  getMembersWithCache(){ //No longer used since this method doesn't uses pagination
    if (this.members.length > 0) return of(this.members); //"of" returns array as an Observable
    return this.http.get<Member[]>(this.baseUrl+'users').pipe(
      //map also returns an observable
      map((members : Member[]) =>{
        this.members = members;
        return members;
      })
    );
  }  

  getMember(username: string | null){
    const member = this.members.find(x => x.username === username);
    if (member !== undefined) {
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl+'users/'+username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl+'users',member).pipe(
      map(() =>{
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/'+photoId, {});
  }

  deletePhoto(photoId: number){
    return this.http.delete(this.baseUrl + 'users/delete-photo/'+photoId);
  }
}
