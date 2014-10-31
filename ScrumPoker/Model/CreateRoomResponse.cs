using ScrumPoker.Model;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class CreateRoomResponse
    {
        public ushort? RoomId;
        public string Message;
        public List<ParticipantInfo> Participants;
    }
}