using Microsoft.AspNet.SignalR;
using ScrumPoker.Model;
using System.Collections.Generic;
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

        public RoomInfoDetailed JoinRoom(ushort roomId)
        {
            var room = _lobby.Rooms[roomId];
            _lobby.ConnectedUsersRoom.Add(Context.ConnectionId, roomId);
            room.Viewers.Add(Context.ConnectionId);

            return new RoomInfoDetailed(room);
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
                var participant = room.Voters.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
                if (participant != null)
                {
                    room.Voters.Remove(participant);
                    SendRoomUpdate(room);
                }
                if (room.Viewers.Contains(Context.ConnectionId))
                {
                    room.Viewers.Remove(Context.ConnectionId);
                    SendRoomUpdate(room);
                }
            }

        }

        public override Task OnDisconnected()
        {
            LeaveRoom();

            return base.OnDisconnected();
        }

        private void SendRoomUpdate(Room room)
        {
            var participants = new RoomVotes(room.GetParticipantInfo());

            var connections = room.Voters.Select(v => v.ConnectionId).Concat(room.Viewers);

            foreach (var c in connections)
            {
                Clients.Client(c).roomUpdate(participants);
            }
        }

        public void Bet(string value)
        {
            var roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];
            var room = _lobby.Rooms[roomId];
            var me = room.Voters.Single(p => p.ConnectionId == Context.ConnectionId);
            me.Bet = value;

            SendRoomUpdate(room);
        }
    }
}
