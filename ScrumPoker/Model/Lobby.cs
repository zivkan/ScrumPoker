using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using Microsoft.AspNet.SignalR;

namespace ScrumPoker.Model
{
    public class Lobby
    {
        public IDictionary<ushort, Room> Rooms { get; private set; }
        public IDictionary<string, ushort> ConnectedUsersRoom { get; private set; } 
        private readonly Random _rand;
        private readonly Timer _timer;
        private readonly IHubContext _hub;

        public Lobby(IHubContext hub)
        {
            Rooms = new ConcurrentDictionary<ushort, Room>();
            ConnectedUsersRoom = new ConcurrentDictionary<string, ushort>();
            _rand = new Random();
            _timer = new Timer(30*1000) {Enabled = false, AutoReset = true};
            _timer.Elapsed += TimerOnElapsed;
            _hub = hub;
        }

        private void TimerOnElapsed(object sender, ElapsedEventArgs elapsedEventArgs)
        {
            var toDelete = new List<ushort>();

            foreach (var room in Rooms)
            {
                if (room.Value.Participants.Count == 0)
                {
                    if (room.Value.WasEmptyLastInterval)
                        toDelete.Add(room.Key);
                    else
                        room.Value.WasEmptyLastInterval = true;
                }
                else
                {
                    room.Value.WasEmptyLastInterval = false;
                }
            }

            foreach (var roomId in toDelete)
            {
                Rooms.Remove(roomId);
                _hub.Clients.All.roomDeleted(roomId);
            }

            if (Rooms.Count == 0)
                _timer.Enabled = false;
        }

        public IEnumerable<RoomInfo> GetAllPublicRooms()
        {
            return Rooms.Values.Select(x=>new RoomInfo(x));
        }

        public string CreateRoom(string name, out Room room)
        {
            room = null;
            if (string.IsNullOrEmpty(name))
                return "Must provide a name for the room";
            
            var lowerName = name.ToLower();
            if (Rooms.Values.Any(r => r.Name.ToLower() == lowerName))
                return "Room with that name already exists";
            
            var id = GetNewRoomId();

            room = new Room(id, name);
            Rooms.Add(id, room);

            if (!_timer.Enabled)
                _timer.Enabled = true;

            return null;
        }

        private ushort GetNewRoomId()
        {
            var id = Convert.ToUInt16(_rand.Next(ushort.MinValue, ushort.MaxValue));
            while (Rooms.ContainsKey(id)) // woohoo! infinite loop!
                id = Convert.ToUInt16(_rand.Next(ushort.MinValue, ushort.MaxValue));
            return id;
        }
    }
}
