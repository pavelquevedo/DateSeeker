using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers 
{
    public class UsersController : BaseApiController
    {
        private readonly DataContext context;

        public UsersController(DataContext context)
        {
            this.context = context;
        }

        // api/users
        [HttpGet]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers(){

            var users = await this.context.Users.ToListAsync(); 

            return users;
        }

        // api/users/3
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AppUser>> GetUsers(int id){
            
            var user = await this.context.Users.FindAsync(id);
        
            return user;
        }

        


    }
}