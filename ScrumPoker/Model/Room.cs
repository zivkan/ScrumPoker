using System.Collections.Generic;

namespace ScrumPoker.Model
{
    public class Room
    {

        public ushort Id { get; private set; }
        public string Name { get; private set; }

        public IList<Participant> Participants { get; private set; }

        public bool WasEmptyLastInterval { get; set; }

        public Room(ushort id, string name)
        {
            Id = id;
            Name = name;
            Participants = new List<Participant>();
            WasEmptyLastInterval = false;
        }
    }
}
