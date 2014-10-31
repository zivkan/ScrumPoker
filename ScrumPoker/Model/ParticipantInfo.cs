namespace ScrumPoker.Model
{
    public class ParticipantInfo
    {
        public string Name { get; private set; }
        public string Bet { get; set; }

        public bool HasBet { get; private set; }

        public ParticipantInfo(Participant participant)
        {
            Name = participant.Name;
            Bet = participant.Bet;
            HasBet = Bet != null;
        }
    }
}