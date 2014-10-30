using System;
using System.Linq;
using ScrumPoker.Hubs;
using System.Collections.Generic;

namespace ScrumPoker.Model
{
    public class RoomVotes
    {

        public RoomVotes(IEnumerable<RoomHub.ParticipantInfo> participants)
        {
            Participants = participants.ToList();
        }

        public IList<RoomHub.ParticipantInfo> Participants { get; private set; }

        public string MajorityVote
        {
            get
            {
                if (EveryoneHasVoted)
                {
                    Dictionary<string, int> votes = new Dictionary<string, int>();
                    foreach (RoomHub.ParticipantInfo participantInfo in Participants)
                    {
                        if (!votes.ContainsKey(participantInfo.Bet))
                        {
                            votes.Add(participantInfo.Bet, 1);
                        }
                        else
                        {
                            votes[participantInfo.Bet]++;
                        }
                    }

                    int max = votes.Max(pair => pair.Value);
                    if (max < Participants.Count/2)
                    {
                        return null;
                    }

                    List<KeyValuePair<string, int>> mostVotedOptions = votes.Where(pair => pair.Value == max).ToList();
                    if (mostVotedOptions.Count() > 1)
                    {
                        return null;
                    }
                    else
                    {
                        return mostVotedOptions[0].Key;
                    }
                }
                return null;
            }
        }

        public double? Average
        {
            get {
                if (EveryoneHasVoted)
                {
                    return Participants.Average(p => Convert.ToInt32(p.Bet));
                }
                else
                {
                    return null;
                }
            }
        }

        private bool EveryoneHasVoted
        {
            get { return Participants.All(p => p.HasBet); }
        }

    }
}