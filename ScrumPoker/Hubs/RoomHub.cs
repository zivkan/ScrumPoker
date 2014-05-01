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

        public void JoinRoom(ushort room, string displayName)
        {
            Clients.All.test(room, displayName);
        }

        public void SendMessage(string message)
        {
            var roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];

            foreach(var p in _lobby.Rooms[roomId].Participants)
            {
                Clients.Client(p.ConnectionId).roomMessage("message = " + message);
            }
        }

        public override Task OnConnected()
        {
            var connectionId = Context.ConnectionId;
            if (_lobby.ConnectedUsersRoom.ContainsKey(connectionId))
            {
                var roomId = _lobby.ConnectedUsersRoom[connectionId];
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            if (_lobby.ConnectedUsersRoom.ContainsKey(Context.ConnectionId))
            {
                var roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];
                if (_lobby.Rooms.ContainsKey(roomId))
                {
                    var room = _lobby.Rooms[roomId];
                    var participant = room.Participants.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
                    if (participant != null)
                        room.Participants.Remove(participant);
                }
                _lobby.ConnectedUsersRoom.Remove(Context.ConnectionId);
            }

            return base.OnDisconnected();
        }
    }
}
