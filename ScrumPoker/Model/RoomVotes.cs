using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace ScrumPoker.Model
{
    public class RoomVotes
    {

        public RoomVotes(IEnumerable<ParticipantInfo> participants, int viewers)
        {
            Participants = participants.ToList();
            Viewers = viewers;
        }

        public IList<ParticipantInfo> Participants { get; private set; }
        public int Viewers { get; private set; }

        public string MajorityVote
        {
            get
            {
                if (EveryoneHasVoted)
                {
                    Dictionary<string, int> votes = new Dictionary<string, int>();
                    foreach (ParticipantInfo participantInfo in Participants)
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
                    return mostVotedOptions[0].Key;
                }
                return "Not everyone has voted yet";
            }
        }

        public string Average
        {
            get
            {
                if (EveryoneHasVoted)
                {
                    var average = Participants.Average(p => Convert.ToInt32(p.Bet));
                    if (Math.Abs(average - Math.Floor(average)) < 0.1)
                        return Convert.ToInt32(average).ToString(CultureInfo.InvariantCulture);
                    return average.ToString("#.#");
                }
                return "Not everyone has voted yet";
            }
        }

        private bool EveryoneHasVoted
        {
            get { return Participants.Count > 0 && Participants.All(p => p.HasBet); }
        }

    }
}