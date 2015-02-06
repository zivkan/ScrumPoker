namespace ScrumPoker.Model
{
    public class RoomInfo
    {
        public ushort Id { get; private set; }
        public string Name { get; private set; }
        public int Voters { get; private set; }
        public int Viewers { get; private set; }

        public RoomInfo(Room room)
        {
            Id = room.Id;
            Name = room.Name;
            Voters = room.Voters.Count;
            Viewers = room.Viewers.Count;
        }
    }
}
