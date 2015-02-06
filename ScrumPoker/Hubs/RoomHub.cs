using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using ScrumPoker.Model;

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
            _lobby.Hub.Clients.All.RoomChanged(new RoomInfo(room));
            SendRoomUpdate(room);
            return new RoomInfoDetailed(room);
        }

        /// <summary>
        /// Change participation type (voter/viewer) in current room
        /// </summary>
        /// <param name="name">null if viewer access desired. Otherwise, user name in room.</param>
        /// <returns></returns>
        public bool ChangeParticipation(string name)
        {
            ushort roomId = 123;
            if (_lobby.ConnectedUsersRoom.TryGetValue(Context.ConnectionId, out roomId))
            {
                var room = _lobby.Rooms[roomId];

                if (room.Viewers.Contains(Context.ConnectionId))
                    room.Viewers.Remove(Context.ConnectionId);
                var voter = room.Voters.FirstOrDefault(v => v.ConnectionId == Context.ConnectionId);
                if (voter != null)
                    room.Voters.Remove(voter);

                if (name == null)
                {
                    room.Viewers.Add(Context.ConnectionId);
                }
                else
                {
                    voter = new Voter(Context.ConnectionId, name);
                    room.Voters.Add(voter);
                }

                SendRoomUpdate(room);
                _lobby.Hub.Clients.All.RoomChanged(new RoomInfo(room));
                return true;
            }
            return false;
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
                    _lobby.Hub.Clients.All.RoomUpdate(new RoomInfo(room));
                }
                if (room.Viewers.Contains(Context.ConnectionId))
                {
                    room.Viewers.Remove(Context.ConnectionId);
                    SendRoomUpdate(room);
                    _lobby.Hub.Clients.All.RoomUpdate(new RoomInfo(room));
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
            var participants = new RoomVotes(room.GetParticipantInfo(), room.Viewers.Count);

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
