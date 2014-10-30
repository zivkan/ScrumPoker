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
                        return "There is no majority";
                    }

                    List<KeyValuePair<string, int>> mostVotedOptions = votes.Where(pair => pair.Value == max).ToList();
                    if (mostVotedOptions.Count() > 1)
                    {
                        return "There is no majority";
                    }
                    else
                    {
                        return mostVotedOptions[0].Key;
                    }
                }
                return "Not everyone has voted yet";;
            }
        }

        public string Average
        {
            get {
                if (EveryoneHasVoted)
                {
                    var average = Participants.Average(p => Convert.ToInt32(p.Bet));
                    if (average - Math.Floor(average) == 0.0)
                        return Convert.ToInt32(average).ToString();
                    return average.ToString("#.#");

                }
                else
                {
                    return "Not everyone has voted yet";
                }
            }
        }

        private bool EveryoneHasVoted
        {
            get { return Participants.All(p => p.HasBet); }
        }

    }
}