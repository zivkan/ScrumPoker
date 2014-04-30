using System.Linq;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;

namespace ScrumPoker.Hubs
{
    public class LobbyHub : Hub
    {
        private static readonly Lazy<IDictionary<int, Room>> Rooms = new Lazy<IDictionary<int,Room>>(()=> new Dictionary<int, Room>());
        private static readonly Lazy<Random> Rand = new Lazy<Random>(()=>new Random());

        public ICollection<Room> GetRooms()
        {
            return Rooms.Value.Values;
        }

        public string addRoom(string name)
        {
            if (string.IsNullOrEmpty(name))
                return "Must provide a name for the room";

            var lowerName = name.ToLower();
            if (Rooms.Value.Values.Any(r => r.Name.ToLower() == lowerName))
                return "Room with that name already exists";

            var id = Convert.ToUInt16(Rand.Value.Next(ushort.MinValue, ushort.MaxValue));
            while (Rooms.Value.ContainsKey(id)) // woohoo! infinite loop!
                id = Convert.ToUInt16(Rand.Value.Next(ushort.MinValue, ushort.MaxValue));

            var room = new Room {Id = id, Name = name};
            Rooms.Value.Add(id, room);
            Clients.All.roomAdded(room);
            return "";
        }

    }
}
