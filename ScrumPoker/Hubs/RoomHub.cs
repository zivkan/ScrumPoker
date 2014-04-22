using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace ScrumPoker.Hubs
{
    public class RoomHub : Hub
    {
        public void JoinRoom(string room, string displayName)
        {
            Clients.All.test(room, displayName);
        }
    }
}
