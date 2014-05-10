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
            public List<RoomHub.ParticipantInfo> participants;
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
            result.participants = RoomHub.GetParticipantInfo(room);

            if (room == null)
                return result;

            result.roomId = room.Id;

            var roomInfo = new RoomInfo(room);
            Clients.All.RoomAdded(roomInfo);

            return result;
        }
    }
}
