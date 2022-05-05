using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public MessageRepository(DataContext context, IMapper mapper)
        {
            this._context = context;
            this._mapper = mapper;
        }
        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
           _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .SingleOrDefaultAsync(m => m.Id == id);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUserName)
        {
            var messages = await _context.Messages
                .Where(m => m.Recipient.UserName == currentUsername && m.RecipientDeleted == false
                        && m.Sender.UserName == recipientUserName
                        || m.Recipient.UserName == recipientUserName
                        && m.Sender.UserName == currentUsername && m.SenderDeleted == false)
                .OrderBy(m => m.MessageSent)
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            var unreadMessages = messages.Where(m => m.DateRead == null 
            && m.RecipientUsername == currentUsername).ToList();

            if (unreadMessages.Any())
            {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.Now;
                    //message.DateRead = DateTime.UtcNow;
                }

                //This will be saved with the Unit of work
                //await _context.SaveChangesAsync();
            }

            //Optimizing query, mapping in the query above
            //return _mapper.Map<IEnumerable<MessageDto>>(messages);
            return messages;
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages
                .OrderByDescending(m => m.MessageSent)
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .AsQueryable();

            messages = messageParams.Container switch
            {
                "Inbox" => messages.Where(u => u.RecipientUsername == messageParams.Username
                    && u.RecipientDeleted == false),
                "Outbox" => messages.Where(u => u.SenderUsername == messageParams.Username
                    && u.SenderDeleted == false),
                _ => messages.Where(u => u.RecipientUsername == messageParams.Username 
                    && u.RecipientDeleted == false 
                    && u.DateRead == null)
            };

            return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        }

        //Replaced with Unit of work pattern
        //public async Task<bool> SaveAllAsync()
        //{
        //    return await _context.SaveChangesAsync() > 0; 
        //}

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }

        public async Task<Connection> GetConnection(string connectionId)
        {
            return await _context.Connections.FindAsync(connectionId);
        }

        public async Task<Group> GetMessageGroup(string groupName)
        {
            return await _context.Groups
                .Include(x => x.Connections)
                .FirstOrDefaultAsync(x => x.Name == groupName);
        }

        public async Task<Group> GetGroupForConnection(string connectionId)
        {
            return await _context.Groups
                .Include(c => c.Connections)
                .Where(c => c.Connections.Any(x => x.ConnectionId == connectionId))
                .FirstOrDefaultAsync();
        }
    }
}
