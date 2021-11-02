import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // @Input() usersFromHomeComponent: any;
  @Output() cancelRegister = new EventEmitter();

  constructor(private accountService: AccountService, private toastr: ToastrService, private formBuilder: FormBuilder){}

  model: any = {
    username:"",
    password:""
  }

  

  registerForm: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  getObjectKeys(arg: any) {
    return Object.keys(arg);
  }

  initializeForm(){
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    //This is to re-fire the validation of confirmPassword if the user
    // changes the password field after confirmPassword
    this.registerForm.controls.password.valueChanges.subscribe(()=>{
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    })
  }

  matchValues(matchTo: string): ValidatorFn{
    return(control: AbstractControl) =>{
      const parentControls = control.parent?.controls as any;
      return (parentControls) 
        ? (control?.value === parentControls[matchTo]?.value) 
        ? null : {isMatching: true} : null;
    }
  }

  register(){
    console.log(this.registerForm.value);
    // this.accountService.register(this.model).subscribe(response =>{
    //   console.log(response);
    //   this.cancel();
    // }, error => {
    //   console.log(error);
    //   this.toastr.error(error.error);
    // });
  }

  cancel(){
    this.cancelRegister.emit(false);
  }

}
