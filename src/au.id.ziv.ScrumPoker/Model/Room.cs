using System.Collections.Generic;

namespace au.id.ziv.ScrumPoker.Model
{
    public class Room
    {

        public ushort Id { get; private set; }
        public string Name { get; private set; }

        public IList<Voter> Voters { get; private set; }

        public IList<string> Viewers { get; private set; } 

        public bool WasEmptyLastInterval { get; set; }

        public Room(ushort id, string name)
        {
            Id = id;
            Name = name;
            Voters = new List<Voter>();
            Viewers = new List<string>();
            WasEmptyLastInterval = false;
        }
    }
}
