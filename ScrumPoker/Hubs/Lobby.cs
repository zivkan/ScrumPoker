using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using Microsoft.AspNet.SignalR;

namespace ScrumPoker.Hubs
{
    public class Lobby
    {
        private readonly IDictionary<ushort, Room> _rooms;
        private readonly Random _rand;
        private readonly Timer _timer;
        private readonly IHubContext _hub;

        public Lobby(IHubContext hub)
        {
            _rooms = new ConcurrentDictionary<ushort, Room>();
            _rand = new Random();
            _timer = new Timer(30*1000) {Enabled = false, AutoReset = true};
            _timer.Elapsed += TimerOnElapsed;
            _hub = hub;
        }

        private void TimerOnElapsed(object sender, ElapsedEventArgs elapsedEventArgs)
        {
            var toDelete = new List<ushort>();

            foreach (var room in _rooms)
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
                _rooms.Remove(roomId);
                _hub.Clients.All.roomDeleted(roomId);
            }

            if (_rooms.Count == 0)
                _timer.Enabled = false;
        }

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

            var newRoom = new Room(id, name);
            _rooms.Add(id, newRoom);

            if (!_timer.Enabled)
                _timer.Enabled = true;

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