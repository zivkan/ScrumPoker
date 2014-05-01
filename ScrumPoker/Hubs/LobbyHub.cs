using Microsoft.AspNet.SignalR;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class LobbyHub : Hub
    {
        private readonly Lobby _lobby;

        public LobbyHub(Lobby lobby)
        {
            _lobby = lobby;
        }

        public IEnumerable<RoomInfo> GetRooms()
        {
            return _lobby.GetAllPublicRooms();
        }

        public string AddRoom(string name)
        {
            RoomInfo room;

            var message = _lobby.CreateRoom(name, out room);

            if (room != null)
                Clients.All.RoomAdded(room);

            return message;
        }
    }
}
