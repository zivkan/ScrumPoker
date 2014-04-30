using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class LobbyHub : Hub
    {
        private static readonly Lazy<Lobby> Lobby = new Lazy<Lobby>(()=>new Lobby());

        public IEnumerable<RoomInfo> GetRooms()
        {
            return Lobby.Value.GetAllPublicRooms();
        }

        public string AddRoom(string name)
        {
            RoomInfo room;

            var message = Lobby.Value.CreateRoom(name, out room);

            if (room != null)
                Clients.All.RoomAdded(room);

            return message;
        }
    }
}
