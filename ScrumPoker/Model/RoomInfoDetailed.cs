using System.Collections.Generic;

namespace ScrumPoker.Model
{
    public class RoomInfoDetailed
    {
        public string Name { get; private set; }
        public ushort Id { get; private set; }
        public IList<ParticipantInfo> Voters { get; private set; }
        public int Viewers { get; private set; }

        public RoomInfoDetailed(Room room)
        {
            Name = room.Name;
            Id = room.Id;
            Voters = room.GetParticipantInfo();
            Viewers = room.Viewers.Count;
        }
    }
}
