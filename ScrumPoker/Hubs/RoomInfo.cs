namespace ScrumPoker.Hubs
{
    public class RoomInfo
    {
        public ushort Id { get; private set; }
        public string Name { get; private set; }

        public RoomInfo(Room room)
        {
            Id = room.Id;
            Name = room.Name;
        }
    }
}