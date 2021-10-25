using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers 
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            this._userRepository = userRepository;
            this._mapper = mapper;
        }

        // api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers(){
            
            var users = await _userRepository.GetMembersAsync();

            //This is another option to return mapped objects, but is heavier
            //var usersToReturn = _mapper.Map<IEnumerable<MemberDto>>(users);

            return Ok(users);
        }

        // api/users/3
        //[HttpGet("{id}")]
        //public async Task<ActionResult<MemberDto>> GetUsers(int id){

        //    var user = await _userRepository.GetUserByIdAsync(id);

        //    return _mapper.Map<MemberDto>(user);
        //}

        // api/users/daniel
        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUsers(string username)
        {

            var user = await _userRepository.GetUserByUserNameAsync(username);

            return _mapper.Map<MemberDto>(user);
        }



    }
}