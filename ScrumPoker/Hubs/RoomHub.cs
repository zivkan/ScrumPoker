using Microsoft.AspNet.SignalR;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumPoker.Hubs
{
    public class RoomHub : Hub
    {
        private readonly Lobby _lobby;

        public RoomHub(Lobby lobby)
        {
            _lobby = lobby;
        }

        public void JoinRoom(ushort roomId, string displayName)
        {
            var participant = new Participant(Context.ConnectionId, displayName);
            var room = _lobby.Rooms[roomId];
            room.Participants.Add(participant);
            _lobby.ConnectedUsersRoom.Add(Context.ConnectionId, roomId);

            SendMessage(string.Format("User '{0}' has joined", displayName));
        }

        public void LeaveRoom()
        {
            ushort? roomId = null;
            if (_lobby.ConnectedUsersRoom.ContainsKey(Context.ConnectionId))
            {
                roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];
                _lobby.ConnectedUsersRoom.Remove(Context.ConnectionId);
            }

            if (roomId != null)
            {
                var room = _lobby.Rooms[roomId.Value];
                var participant = room.Participants.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
                if (participant != null)
                {
                    room.Participants.Remove(participant);
                    SendMessage(room, participant.Name + " has left the building");
                }
            }

        }

        public override Task OnDisconnected()
        {
            LeaveRoom();

            return base.OnDisconnected();
        }

        public void SendMessage(string message)
        {
            var roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];

            SendMessage(_lobby.Rooms[roomId], message);
        }

        private void SendMessage(Room room, string message)
        {
            foreach (var p in room.Participants)
            {
                Clients.Client(p.ConnectionId).roomMessage("message = " + message);
            }
            
        }

    }
}
