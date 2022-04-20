using API.Helpers;

namespace API.DTOs
{
    public class MessageParams : PaginationParams
    {
        public string Username { get; set; }
        public string Container { get; set; } = "unread";
    }
}
