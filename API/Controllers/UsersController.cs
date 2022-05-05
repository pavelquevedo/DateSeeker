using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers 
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public UsersController(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }

        // api/users
        /// <summary>
        /// Method to get all the users registered in the database
        /// </summary>
        /// <returns>Collection of MemberDto</returns>
        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDto>>> GetUsers([FromQuery]UserParams userParams){

            var gender = await _unitOfWork.UserRepository.GetUserGender(User.GetUsername());
            userParams.CurrentUsername = User.GetUsername();

            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = gender == "male" ? "female" : "male";
            }

            var users = await _unitOfWork.UserRepository.GetMembersAsync(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);
            //This is another option to return mapped objects, but is heavier
            //var usersToReturn = _mapper.Map<IEnumerable<MemberDto>>(users);

            return Ok(users);
        }

        // api/users/daniel
        /// <summary>
        /// Method to get a single user
        /// </summary>
        /// <param name="username">identifier of a registered user</param>
        /// <returns>Single MemberDTO object</returns>
        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(username);

            return _mapper.Map<MemberDto>(user);
        }

        /// <summary>
        /// Method to update user's data in the database
        /// </summary>
        /// <param name="memberUpdateDto">MemberDto with the modified values</param>
        /// <returns>NoContent code if success, BadRequest code if fails</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUsername());

            _mapper.Map(memberUpdateDto, user);

            _unitOfWork.UserRepository.Update(user);

            if (await _unitOfWork.Complete())
            {
                return NoContent();
            }
            else
            {
                return BadRequest("Failed to update the user");
            }
        }

        /// <summary>
        /// Method to add a new photo for a registered user
        /// </summary>
        /// <param name="file">File with photo content</param>
        /// <returns>Created code with the route where the resource can be found</returns>
        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUsername());

            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null)
            {
                return BadRequest(result.Error.Message);
            }

            var photo = new Photo()
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
            };

            if (user.Photos.Count == 0)
            {
                photo.IsMain = true;
            }

            user.Photos.Add(photo);

            if (await _unitOfWork.Complete())
            {
                //return _mapper.Map<PhotoDto>(photo);
                //return CreatedAtRoute("GetUser", _mapper.Map<PhotoDto>(photo)); //Route needs username parameter
                return CreatedAtRoute("GetUser", new { username = user.UserName}, _mapper.Map<PhotoDto>(photo));
            }

            return BadRequest("Problem adding photo");
        }

        /// <summary>
        /// Method to change the main photo of an user
        /// </summary>
        /// <param name="photoId">PhotoID of the requested main photo</param>
        /// <returns>NoContent code if success, BadRequest code if fails</returns>
        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUsername());

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if (photo.IsMain)
            {
                return BadRequest("This is already your main photo");
            }

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null)
            {
                currentMain.IsMain = false;
                photo.IsMain = true;
            }

            if (await _unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to set main photo");
        }

        /// <summary>
        /// Method to delete an users photo
        /// </summary>
        /// <param name="photoId">Identifier of the photo to be deleted</param>
        /// <returns>OK code if success, BadRequest code if fail, NotFound code if photo doesn't exist</returns>
        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUserNameAsync(User.GetUsername());

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if (photo == null)
            {
                return NotFound();
            }

            if (photo.IsMain)
            {
                return BadRequest("You can't delete your main photo");
            }

            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);

                if (result.Error != null)
                {
                    return BadRequest(result.Error.Message);
                }
            }

            user.Photos.Remove(photo);

            if (await _unitOfWork.Complete())
            {
                return Ok();
            }
            else
            {
                return BadRequest("Failed to delete the photo");
            }
        }

    }
}