using Microsoft.AspNet.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ScrumPoker.Hubs
{
    public class RoomHub : Hub
    {
        public class ParticipantInfo
        {
            public string Name { get; private set; }
            public string Bet { get; set; }

            public bool HasBet { get; private set; }

            public ParticipantInfo(Participant participant)
            {
                Name = participant.Name;
                Bet = participant.Bet;
                HasBet = Bet != null;
            }
        }

        private readonly Lobby _lobby;

        public RoomHub(Lobby lobby)
        {
            _lobby = lobby;
        }

        public IEnumerable<ParticipantInfo> JoinRoom(ushort roomId, string displayName)
        {
            var participant = new Participant(Context.ConnectionId, displayName);
            var room = _lobby.Rooms[roomId];
            room.Participants.Add(participant);
            _lobby.ConnectedUsersRoom.Add(Context.ConnectionId, roomId);

            SendMessage(string.Format("User '{0}' has joined", displayName));

            return GetParticipantInfo(room);
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
                    SendRoomUpdate(room);
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

            SendRoomUpdate(_lobby.Rooms[roomId]);
        }

        private void SendRoomUpdate(Room room)
        {
            var participants = GetParticipantInfo(room);

            foreach (var p in room.Participants)
            {
                Clients.Client(p.ConnectionId).roomUpdate(participants);
            }
        }

        internal static List<ParticipantInfo> GetParticipantInfo(Room room)
        {
            var participants = new List<ParticipantInfo>();
            var everyoneBet = true;
            foreach (var p in room.Participants)
            {
                participants.Add(new ParticipantInfo(p));
                if (p.Bet == null)
                    everyoneBet = false;
            }

            if (!everyoneBet)
            {
                foreach (var p in participants)
                {
                    p.Bet = null;
                }
            }

            return participants;
        }

        public void Bet(string value)
        {
            var roomId = _lobby.ConnectedUsersRoom[Context.ConnectionId];
            var room = _lobby.Rooms[roomId];
            var me = room.Participants.Single(p => p.ConnectionId == Context.ConnectionId);
            me.Bet = value;

            SendRoomUpdate(room);
        }
    }
}
