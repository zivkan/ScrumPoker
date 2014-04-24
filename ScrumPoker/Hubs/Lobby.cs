using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Timers;

namespace ScrumPoker.Hubs
{
    public class Lobby
    {
        private readonly static Lazy<Lobby> SingletonLobby
            = new Lazy<Lobby>(() => new Lobby(GlobalHost.ConnectionManager.GetHubContext<LobbyHub>()));

        public Lobby Instance
        {
            get { return SingletonLobby.Value; }
        }

        private readonly ISet<Room> _rooms;
        private readonly Timer _cleanupTimer;
        private readonly IHubContext _hub;

        public Lobby(IHubContext lobbyHub)
        {
            _cleanupTimer = new Timer {AutoReset = true, Enabled = false, Interval = 60000};
            _cleanupTimer.Elapsed += CleanupTimerOnElapsed;

            _hub = lobbyHub;

            _rooms = new HashSet<Room>();
        }

        private void CleanupTimerOnElapsed(object sender, ElapsedEventArgs elapsedEventArgs)
        {
            lock (_rooms)
            {
                IList<Room> toDelete = new List<Room>();
                foreach (var room in _rooms)
                {
                    if (room.FlaggedForDeletion && room.Participants.Count == 0)
                        toDelete.Add(room);

                    if (room.Participants.Count == 0)
                        room.FlaggedForDeletion = true;
                }

                foreach (var room in toDelete)
                {
                    _hub.Clients.All.roomDeleted(room.Id);
                    _rooms.Remove(room);
                }

                if (_rooms.Count == 0)
                    _cleanupTimer.Enabled = false;
            }
        }
    }
}