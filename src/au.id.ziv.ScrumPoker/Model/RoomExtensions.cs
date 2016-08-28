using System.Collections.Generic;

namespace au.id.ziv.ScrumPoker.Model
{
    public static class RoomExtensions
    {
        public static List<ParticipantInfo> GetParticipantInfo(this Room room)
        {
            var participants = new List<ParticipantInfo>();
            var everyoneBet = true;
            foreach (var p in room.Voters)
            {
                participants.Add(new ParticipantInfo(p));
                if (p.Bet == null)
                    everyoneBet = false;
            }

            if (!everyoneBet)
            {
                foreach (var p in participants)
                {
                    p.Bet = null;
                }
            }

            return participants;
        }
    }
}