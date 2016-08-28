using System.Collections.Generic;

namespace au.id.ziv.ScrumPoker.Model
{
    public class CreateRoomResponse
    {
        public ushort? RoomId;
        public string Message;
        public List<ParticipantInfo> Participants;
    }
}