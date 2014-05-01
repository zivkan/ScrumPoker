using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class LobbyHub : Hub
    {
        public class CreateRoomResponse
        {
            public ushort? roomId;
            public string message;
        }

        private readonly Lobby _lobby;

        public LobbyHub(Lobby lobby)
        {
            _lobby = lobby;
        }

        public IEnumerable<RoomInfo> GetRooms()
        {
            return _lobby.GetAllPublicRooms();
        }

        public async Task<CreateRoomResponse> CreateRoom(string roomName, string userName)
        {
            Room room;
            var result = new CreateRoomResponse {message = _lobby.CreateRoom(roomName, out room)};
            var participant = new Participant(Context.ConnectionId, userName);
            room.Participants.Add(participant);
            _lobby.ConnectedUsersRoom.Add(Context.ConnectionId, room.Id);
            var groupName = string.Format("room-{0}", room.Id);
            await Groups.Add(Context.ConnectionId, groupName);
            Clients.Group(groupName).roomMessage(userName + " joined the room");

            if (room == null)
                return result;

            result.roomId = room.Id;

            var roomInfo = new RoomInfo(room);
            Clients.All.RoomAdded(roomInfo);

            return result;
        }
    }
}
