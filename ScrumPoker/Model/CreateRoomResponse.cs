using System.Collections.Generic;
using ScrumPoker.Model;

namespace ScrumPoker.Hubs
{
    public class CreateRoomResponse
    {
        public ushort? RoomId;
        public string Message;
        public List<ParticipantInfo> Participants;
    }
}