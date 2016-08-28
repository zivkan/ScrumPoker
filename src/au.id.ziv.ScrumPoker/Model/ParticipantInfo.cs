namespace au.id.ziv.ScrumPoker.Model
{
    public class ParticipantInfo
    {
        public string Name { get; private set; }
        public string Bet { get; set; }

        public bool HasBet { get; private set; }

        public ParticipantInfo(Voter voter)
        {
            Name = voter.Name;
            Bet = voter.Bet;
            HasBet = Bet != null;
        }
    }
}