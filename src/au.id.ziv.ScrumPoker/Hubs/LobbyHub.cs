using System;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using au.id.ziv.ScrumPoker.Model;

namespace au.id.ziv.ScrumPoker.Hubs
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

        public ushort CreateRoom(string roomName)
        {
            Room room;
            var message = _lobby.CreateRoom(roomName, out room);
            if (room == null)
                throw new Exception(message);

            var roomInfo = new RoomInfo(room);
            Clients.All.RoomAdded(roomInfo);

            return room.Id;
        }
    }
}
