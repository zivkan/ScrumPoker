using System;
using System.Collections.Generic;
using System.Linq;

namespace ScrumPoker.Hubs
{
    public class Lobby
    {
        private readonly IDictionary<int, Room> _rooms = new Dictionary<int, Room>();
        private readonly Random _rand = new Random();

        public IEnumerable<RoomInfo> GetAllPublicRooms()
        {
            return _rooms.Values.Select(GetRoomInfo);
        }

        public string CreateRoom(string name, out RoomInfo room)
        {
            room = null;
            if (string.IsNullOrEmpty(name))
                return "Must provide a name for the room";
            
            var lowerName = name.ToLower();
            if (_rooms.Values.Any(r => r.Name.ToLower() == lowerName))
                return "Room with that name already exists";
            
            var id = GetNewRoomId();

            var newRoom = new Room() { Id = id, Name = name };
            _rooms.Add(id, newRoom);

            room = GetRoomInfo(newRoom);
            return "";
        }

        private static RoomInfo GetRoomInfo(Room newRoom)
        {
            return new RoomInfo { Id = newRoom.Id, Name = newRoom.Name};
        }

        private ushort GetNewRoomId()
        {
            var id = Convert.ToUInt16(_rand.Next(ushort.MinValue, ushort.MaxValue));
            while (_rooms.ContainsKey(id)) // woohoo! infinite loop!
                id = Convert.ToUInt16(_rand.Next(ushort.MinValue, ushort.MaxValue));
            return id;
        }
    }
}