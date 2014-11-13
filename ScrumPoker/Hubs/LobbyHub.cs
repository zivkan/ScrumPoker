using Microsoft.AspNet.SignalR;
using ScrumPoker.Model;
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

        public CreateRoomResponse CreateRoom(string roomName, string userName)
        {
            Room room;
            var result = new CreateRoomResponse {Message = _lobby.CreateRoom(roomName, out room)};
            if (room == null)
                return result;

            var participant = new Voter(Context.ConnectionId, userName);
            room.Voters.Add(participant);
            _lobby.ConnectedUsersRoom.Add(Context.ConnectionId, room.Id);
            result.Participants = room.GetParticipantInfo();

            result.RoomId = room.Id;

            var roomInfo = new RoomInfo(room);
            Clients.All.RoomAdded(roomInfo);

            return result;
        }
    }
}
