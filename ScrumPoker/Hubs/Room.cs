using System.Collections;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class Room
    {
        public int Id;
        public string Name;
        public bool FlaggedForDeletion;
        public IList<object> Participants;

        public Room()
        {
            Participants = new List<object>();
        }
    }
}
